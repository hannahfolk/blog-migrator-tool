import { detectSections } from './sectionDetector'
import { generateSectionHtml, getBestImageSrc } from './extractContent'
import { FIGMA_BLOCKS } from '../constants/figmaBlocks'

const PROXY_URL = '/.netlify/functions/fetch-page'

/**
 * Normalize a user-entered blog URL:
 * - add https:// if missing
 * - strip www. prefix (most blogs don't use it; the proxy follows redirects if needed)
 * - remove trailing slash inconsistencies
 */
export function normalizeUrl(raw) {
  let url = raw.trim()
  if (!url) return url
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url
  try {
    const parsed = new URL(url)
    // Strip www. — if the site needs it, the server will redirect and the proxy follows redirects
    parsed.hostname = parsed.hostname.replace(/^www\./i, '')
    return parsed.href
  } catch {
    return url
  }
}

/**
 * Fetch a page through the Netlify CORS proxy.
 * Returns { html, finalUrl }.
 */
export async function fetchPage(url, signal) {
  const proxyUrl = `${PROXY_URL}?url=${encodeURIComponent(url)}`
  console.log('[AutoMigrator] fetchPage:', proxyUrl)
  const res = await fetch(proxyUrl, { signal })
  console.log('[AutoMigrator] fetchPage response:', res.status, res.headers.get('content-type'))
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Proxy returned ${res.status}`)
  }
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await res.text()
    console.error('[AutoMigrator] Expected JSON but got:', contentType, text.slice(0, 200))
    throw new Error(`Proxy returned non-JSON response (${contentType}). Make sure the dev server was restarted.`)
  }
  return res.json()
}

/**
 * Parse an index/archive page and discover blog post URLs.
 * Also returns the "next page" URL if pagination exists.
 */
export function discoverPostUrls(indexHtml, blogUrl) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(indexHtml, 'text/html')
  const base = new URL(blogUrl)

  const postUrls = new Set()

  console.log('[AutoMigrator] discoverPostUrls — parsing HTML, length:', indexHtml?.length, 'base:', blogUrl)

  // Selectors tried in order — we combine results from all that match
  const selectors = [
    // Standard WordPress <article> elements
    'article a[href]',
    // Post title links (many themes use .post-title or .entry-title)
    '.post-title a[href], .entry-title a[href]',
    // Heading links in post listings
    'h2 a[href], h3 a[href]',
    // WordPress post divs (e.g. <div class="post ...">)
    'div[class*="type-post"] a[href]',
    'div[class*="hentry"] a[href]',
  ]

  for (const selector of selectors) {
    const matches = doc.querySelectorAll(selector)
    let added = 0
    matches.forEach(link => {
      const href = resolveUrl(link.getAttribute('href'), base)
      if (href && isLikelyPostUrl(href, base)) {
        postUrls.add(href)
        added++
      }
    })
    if (matches.length > 0) {
      console.log(`[AutoMigrator] selector "${selector}": ${matches.length} matches, ${added} post URLs`)
    }
  }

  console.log('[AutoMigrator] Total unique post URLs found:', postUrls.size)

  // Find next page link for pagination
  let nextPageUrl = null
  const nextLink = doc.querySelector(
    'a.next, a.next-page, .nav-next a, .pagination .next a, ' +
    'a[rel="next"], .nav-links .next a, .older-posts a'
  )
  if (nextLink) {
    nextPageUrl = resolveUrl(nextLink.getAttribute('href'), base)
  }

  return { postUrls: Array.from(postUrls), nextPageUrl }
}

/**
 * Filter out category, tag, author, and feed pages — keep only likely blog post URLs.
 */
function isLikelyPostUrl(href, base) {
  try {
    const url = new URL(href)
    if (url.hostname !== base.hostname) return false
    const path = url.pathname
    // Skip category/tag/author archive pages, feeds, and media files
    if (/^\/(category|tag|author|page|feed|wp-|comments)\//i.test(path)) return false
    if (/\.(jpg|jpeg|png|gif|svg|css|js|xml|json|pdf)$/i.test(path)) return false
    // Skip bare root
    if (path === '/' || path === '') return false
    // Skip paths that are only one character deep like /videos/
    // Actually keep them — some blogs use /slug/ for posts
    return true
  } catch {
    return false
  }
}

/**
 * Process a single blog post page: extract title, metadata, detect sections, generate HTML.
 */
export function processPost(postHtml, postUrl) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(postHtml, 'text/html')

  // Extract title
  const titleEl = doc.querySelector('.entry-title')
    || doc.querySelector('h1.post-title')
    || doc.querySelector('article h1')
    || doc.querySelector('h1')
  const title = titleEl?.textContent?.trim() || 'Untitled'

  // Extract author
  const authorEl = doc.querySelector('.author-name')
    || doc.querySelector('.entry-author')
    || doc.querySelector('[rel="author"]')
    || doc.querySelector('.byline a')
    || doc.querySelector('.post-author a')
    || doc.querySelector('meta[name="author"]')
  const author = authorEl?.content || authorEl?.textContent?.trim() || ''

  // Extract published date
  const timeEl = doc.querySelector('time[datetime]')
    || doc.querySelector('.entry-date')
    || doc.querySelector('.post-date')
    || doc.querySelector('meta[property="article:published_time"]')
  let publishedAt = timeEl?.getAttribute('datetime')
    || timeEl?.content
    || timeEl?.textContent?.trim()
    || ''

  // Extract tags/categories
  const tagEls = doc.querySelectorAll('.thb-article-tags a, .tag-links a, .post-tags a, [rel="tag"], .entry-tags a, .cat-links a, .entry-categories a')
  const tags = Array.from(new Set(
    Array.from(tagEls).map(a => a.textContent.trim()).filter(Boolean)
  ))

  // Extract featured image — scope search to article/post area to avoid sidebar images
  let imageSrc = ''
  let imageAlt = ''
  const articleEl = doc.querySelector('article') || doc.querySelector('.post') || doc.querySelector('.hentry')
  const featuredSearchEl = articleEl || doc

  // Try post-specific selectors scoped to the article first
  const featuredImgSelectors = [
    '.post-thumbnail img',
    '.featured-image img',
    'img.wp-post-image',
    '.entry-content img:first-of-type',
  ]
  for (const selector of featuredImgSelectors) {
    const img = featuredSearchEl.querySelector(selector)
    if (img) {
      imageSrc = getBestImageSrc(img) || img.getAttribute('src') || ''
      imageAlt = img.getAttribute('alt') || ''
      if (imageSrc) break
    }
  }
  // Fall back to og:image meta tag (page-specific)
  if (!imageSrc) {
    const ogImage = doc.querySelector('meta[property="og:image"]')
    if (ogImage) {
      imageSrc = ogImage.content || ogImage.getAttribute('content') || ''
    }
  }

  // Extract summary/excerpt
  const excerptEl = doc.querySelector('.entry-summary')
    || doc.querySelector('.post-excerpt')
    || doc.querySelector('meta[property="og:description"]')
    || doc.querySelector('meta[name="description"]')
  const summary = excerptEl?.content || excerptEl?.textContent?.trim() || ''

  // Find content container
  const contentEl = doc.querySelector('.entry-content')
    || doc.querySelector('.post-content')
    || doc.querySelector('article .content')
    || doc.querySelector('article')

  if (!contentEl) {
    return {
      title, url: postUrl, sections: [], html: '', error: 'No content container found',
      author, publishedAt, tags, imageSrc, imageAlt, summary,
    }
  }

  // Auto-detect sections
  const sections = detectSections(contentEl)

  // Check for author byline outside .entry-content (e.g. in article footer)
  const hasAuthorByline = sections.some(s => s.blockType === 'authorByline')
  if (!hasAuthorByline) {
    const articleScope = doc.querySelector('article') || doc
    const authorEl = articleScope.querySelector('.article-author')
    if (authorEl) {
      const lines = authorEl.innerHTML.split(/<br\s*\/?>/).map(line => {
        const temp = doc.createElement('div')
        temp.innerHTML = line.trim()
        return temp.textContent.trim()
      }).filter(Boolean)
      if (lines.length > 0) {
        const authorContent = {
          headings: [], paragraphs: [], images: [], links: [], lists: [], videos: [], hotspots: [],
        }
        lines.forEach(line => {
          authorContent.paragraphs.push({ text: line, html: line })
        })
        sections.push({
          id: `section-${sections.length + 1}`,
          blockType: 'authorByline',
          extractedContent: authorContent,
        })
      }
    }
  }

  // Generate HTML for each section
  const htmlParts = sections.map(section => {
    const blockConfig = FIGMA_BLOCKS[section.blockType]
    if (!blockConfig) return ''
    return generateSectionHtml(
      { extractedContent: section.extractedContent, hrColor: section.hrColor },
      section.blockType,
      blockConfig
    )
  })

  const html = htmlParts.filter(Boolean).join('\n\n')

  return {
    title, url: postUrl, sections, html,
    author, publishedAt, tags, imageSrc, imageAlt, summary,
  }
}

/**
 * Full scraping orchestration.
 * Options: { blogUrl, maxPosts, delayMs, signal, onProgress, onPostComplete }
 */
export async function scrapeWordPressBlog({
  blogUrl,
  maxPosts = 600,
  delayMs = 500,
  signal,
  onProgress,
  onPostComplete,
}) {
  const results = []
  const allPostUrls = []
  let currentPageUrl = normalizeUrl(blogUrl)

  // Phase 1: Discover post URLs
  // Try sources in order: sitemap → WP REST API → HTML scraping
  onProgress?.({ phase: 'discovering', message: 'Discovering blog posts...' })

  const baseUrl = new URL(currentPageUrl)
  const origin = baseUrl.origin

  // --- Strategy 1: WordPress post sitemap ---
  let discovered = false
  try {
    onProgress?.({ phase: 'discovering', message: 'Checking post sitemap...' })
    const sitemapUrl = `${origin}/post-sitemap.xml`
    const { html: sitemapXml } = await fetchPage(sitemapUrl, signal)
    const sitemapUrls = parseSitemapUrls(sitemapXml, baseUrl)
    if (sitemapUrls.length > 0) {
      console.log(`[AutoMigrator] Sitemap found ${sitemapUrls.length} post URLs — importing all`)
      for (const url of sitemapUrls) {
        allPostUrls.push(url)
      }
      discovered = true
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    console.log('[AutoMigrator] No post sitemap found, trying REST API...')
  }

  // --- Strategy 2: WP REST API ---
  if (!discovered) {
    try {
      onProgress?.({ phase: 'discovering', message: 'Checking WP REST API...' })
      const apiUrls = await discoverViaRestApi(origin, maxPosts, signal, onProgress)
      if (apiUrls.length > 0) {
        console.log(`[AutoMigrator] REST API found ${apiUrls.length} post URLs`)
        for (const url of apiUrls) {
          if (allPostUrls.length >= maxPosts) break
          allPostUrls.push(url)
        }
        discovered = true
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err
      console.log('[AutoMigrator] REST API not available, falling back to HTML scraping...')
    }
  }

  // --- Strategy 3: HTML scraping (fallback) ---
  if (!discovered) {
    while (currentPageUrl && allPostUrls.length < maxPosts) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

      onProgress?.({
        phase: 'discovering',
        message: `Fetching page: ${currentPageUrl}`,
        postCount: allPostUrls.length,
      })

      try {
        const { html } = await fetchPage(currentPageUrl, signal)
        console.log('[AutoMigrator] Fetched page, HTML length:', html?.length)
        const { postUrls, nextPageUrl } = discoverPostUrls(html, currentPageUrl)
        console.log('[AutoMigrator] Discovered', postUrls.length, 'post URLs, next page:', nextPageUrl)

        for (const url of postUrls) {
          if (allPostUrls.length >= maxPosts) break
          if (!allPostUrls.includes(url)) {
            allPostUrls.push(url)
          }
        }

        currentPageUrl = nextPageUrl
      } catch (err) {
        if (err.name === 'AbortError') throw err
        console.error('[AutoMigrator] Discovery error:', err)
        onProgress?.({
          phase: 'error',
          message: `Error fetching ${currentPageUrl}: ${err.message}`,
          postCount: allPostUrls.length,
        })
        break
      }

      if (currentPageUrl) {
        await delay(delayMs, signal)
      }
    }
  }

  if (allPostUrls.length === 0) {
    onProgress?.({
      phase: 'error',
      message: 'No blog posts found on this page. Check the URL and try again.',
    })
    return results
  }

  onProgress?.({
    phase: 'processing',
    message: `Found ${allPostUrls.length} posts. Processing...`,
    postCount: allPostUrls.length,
    totalPosts: allPostUrls.length,
  })

  // Phase 2: Fetch and process each post
  for (let i = 0; i < allPostUrls.length; i++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const postUrl = allPostUrls[i]
    onProgress?.({
      phase: 'processing',
      message: `Processing ${i + 1}/${allPostUrls.length}: ${postUrl}`,
      current: i + 1,
      totalPosts: allPostUrls.length,
    })

    try {
      const { html } = await fetchPage(postUrl, signal)
      const result = processPost(html, postUrl)
      results.push(result)
      onPostComplete?.(result, i)
    } catch (err) {
      if (err.name === 'AbortError') throw err
      const errorResult = {
        title: 'Error',
        url: postUrl,
        sections: [],
        html: '',
        error: err.message,
      }
      results.push(errorResult)
      onPostComplete?.(errorResult, i)
    }

    if (i < allPostUrls.length - 1) {
      await delay(delayMs, signal)
    }
  }

  return results
}

// --- Helpers ---

function resolveUrl(href, base) {
  if (!href) return null
  try {
    const resolved = new URL(href, base)
    // Only keep URLs on the same host
    if (resolved.hostname === base.hostname) {
      return resolved.href
    }
  } catch { /* skip invalid URLs */ }
  return null
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

/**
 * Parse post URLs from a WordPress post-sitemap.xml.
 * Extracts all <loc> URLs that look like blog posts.
 */
function parseSitemapUrls(xml, base) {
  const urls = []
  const locRegex = /<loc>\s*(.*?)\s*<\/loc>/gi
  let match
  while ((match = locRegex.exec(xml)) !== null) {
    const url = match[1].trim()
    if (url && isLikelyPostUrl(url, base)) {
      urls.push(url)
    }
  }
  return urls
}

/**
 * Discover post URLs via the WordPress REST API.
 * Paginates through /wp-json/wp/v2/posts?per_page=100&page=N
 */
async function discoverViaRestApi(origin, maxPosts, signal, onProgress) {
  const urls = []
  const perPage = 100
  let page = 1
  let totalPages = 1

  // First request to check if API exists and get total pages
  const firstUrl = `${origin}/wp-json/wp/v2/posts?per_page=${perPage}&page=1`
  const { html: firstResponse } = await fetchPage(firstUrl, signal)

  // The proxy returns { html } where html is the raw response body
  let posts
  try {
    posts = JSON.parse(firstResponse)
  } catch {
    // If the response isn't JSON, the API isn't available
    return []
  }

  if (!Array.isArray(posts) || posts.length === 0) return []

  // Extract total pages from the response (we can't read headers through our proxy,
  // so we'll paginate until we get an empty page)
  for (const post of posts) {
    const link = post.link
    if (link && urls.length < maxPosts) {
      urls.push(link)
    }
  }

  page = 2
  // Keep fetching pages until we run out of posts or hit maxPosts
  while (urls.length < maxPosts) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    onProgress?.({
      phase: 'discovering',
      message: `REST API page ${page}: found ${urls.length} posts so far...`,
      postCount: urls.length,
    })

    try {
      const apiUrl = `${origin}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}`
      const { html: pageResponse } = await fetchPage(apiUrl, signal)
      const pagePosts = JSON.parse(pageResponse)
      if (!Array.isArray(pagePosts) || pagePosts.length === 0) break

      for (const post of pagePosts) {
        const link = post.link
        if (link && urls.length < maxPosts) {
          urls.push(link)
        }
      }
      page++
    } catch {
      break
    }
  }

  console.log(`[AutoMigrator] REST API: ${urls.length} posts across ${page - 1} pages`)
  return urls
}

