import { getBestImageSrc } from './extractContent'

/**
 * Detect and classify sections from a WordPress .entry-content container.
 * Returns an array of section objects compatible with generateSectionHtml.
 */
export function detectSections(contentEl) {
  if (!contentEl) return []

  const children = Array.from(contentEl.children)
  const sections = []
  let current = createEmptyAccumulator()
  let sectionCounter = 0

  for (let i = 0; i < children.length; i++) {
    const el = children[i]
    const tag = el.tagName.toLowerCase()

    // Skip empty/whitespace-only elements
    if (!el.textContent.trim() && !el.querySelector('img, iframe, video')) continue

    // --- Boundary: <hr> → emit current + standalone divider ---
    if (tag === 'hr') {
      emitSection()
      const color = extractHrColor(el)
      sections.push({
        id: `section-${++sectionCounter}`,
        blockType: 'hr',
        extractedContent: createEmptyContent(),
        hrColor: color,
      })
      continue
    }

    // --- Boundary: <iframe> or <video> → standalone video section ---
    if (tag === 'iframe' || tag === 'video') {
      emitSection()
      const videoContent = createEmptyContent()
      const src = el.getAttribute('src') || el.querySelector('source')?.getAttribute('src') || ''
      if (src) {
        videoContent.videos.push({ src, title: el.getAttribute('title') || '' })
      }
      sections.push({
        id: `section-${++sectionCounter}`,
        blockType: 'video',
        extractedContent: videoContent,
      })
      continue
    }

    // --- Boundary: headings start new section ---
    if (['h2', 'h3', 'h4', 'h5'].includes(tag)) {
      emitSection()
      const origLevel = parseInt(tag[1])
      // Remap: h3 → h2, h4 → h2; h5 stays h5
      const level = (origLevel === 3 || origLevel === 4) ? 2 : origLevel
      current.headings.push({
        level,
        text: el.textContent.trim(),
        html: el.innerHTML,
      })
      continue
    }

    // --- Author byline detection ---
    if (el.classList?.contains('article-author') || el.querySelector?.('.article-author')) {
      emitSection()
      const authorEl = el.classList?.contains('article-author') ? el : el.querySelector('.article-author')
      const authorContent = createEmptyContent()
      // Split by <br> to handle bare text nodes (e.g. "By: Name<br>Title")
      const lines = authorEl.innerHTML.split(/<br\s*\/?>/).map(line => {
        const temp = document.createElement('div')
        temp.innerHTML = line.trim()
        return temp.textContent.trim()
      }).filter(Boolean)
      lines.forEach(line => {
        authorContent.paragraphs.push({ text: line, html: line })
      })
      sections.push({
        id: `section-${++sectionCounter}`,
        blockType: 'authorByline',
        extractedContent: authorContent,
      })
      continue
    }

    // --- Handle <div> wrappers ---
    if (tag === 'div') {
      const className = el.className || ''

      // ==============================================
      // WPBakery / Visual Composer row
      // Each row is a self-contained section.
      // Column widths tell us the intended layout.
      // ==============================================
      if (className.includes('wpb_row') || className.includes('vc_row')) {
        // Check if this is a full-width wrapper row (single medium-12 column)
        // containing inner rows/text columns. If so, unwrap and recurse
        // into the wrapper's children for better section detection.
        if (!className.includes('vc_inner')) {
          const wrapperEl = getFullWidthWrapperEl(el)
          if (wrapperEl && wrapperEl.querySelector('.wpb_row, .wpb_text_column')) {
            emitSection()
            const innerSections = detectSections(wrapperEl)
            innerSections.forEach(s => { s.id = `section-${++sectionCounter}` })
            sections.push(...innerSections)
            continue
          }
        }

        const rowResult = processWpbRow(el)
        if (rowResult) {
          // If this row only has headings or body text, merge into accumulator
          if (rowResult.images.length === 0 && rowResult.links.length === 0 && rowResult.videos.length === 0) {
            if (rowResult.headings.length > 0) {
              emitSection()
              current.headings.push(...rowResult.headings)
            }
            current.paragraphs.push(...rowResult.paragraphs)
            current.lists.push(...rowResult.lists)
          } else if (rowResult.images.length === 0 && rowResult.links.length > 0) {
            // Row with only buttons — attach to current section or previous section
            if (hasContent(current)) {
              current.links.push(...rowResult.links)
            } else if (sections.length > 0) {
              // Buttons in a separate row after images — append to last emitted section
              const lastSection = sections[sections.length - 1]
              lastSection.extractedContent.links.push(...rowResult.links)
              // Re-determine block type now that links are present
              lastSection.blockType = determineBlockType(lastSection.extractedContent, lastSection._columnHint || 0)
            } else {
              current.links.push(...rowResult.links)
            }
          } else {
            // Row with images/video — emit previous and create a new section
            emitSection()
            current.headings = rowResult.headings
            current.paragraphs = rowResult.paragraphs
            current.images = rowResult.images
            current.links = rowResult.links
            current.lists = rowResult.lists
            current.videos = rowResult.videos
            current.columnHint = rowResult.columnHint
            emitSection()
          }
        }
        continue
      }

      // Gallery block → treat all images as one batch
      if (className.includes('wp-block-gallery') || className.includes('gallery')) {
        emitSection()
        const imgs = extractImagesFromElement(el)
        if (imgs.length > 0) {
          current.images.push(...imgs)
          emitSection()
        }
        continue
      }

      // Columns block (Gutenberg)
      if (className.includes('wp-block-columns')) {
        emitSection()
        const colCount = el.querySelectorAll(':scope > .wp-block-column').length
        const imgs = extractImagesFromElement(el)
        const paras = extractParagraphsFromElement(el)
        const links = extractButtonsFromElement(el)
        if (imgs.length > 0 || paras.length > 0) {
          current.images.push(...imgs)
          current.paragraphs.push(...paras)
          current.links.push(...links)
          if (colCount > 0) current.columnHint = colCount
          emitSection()
        }
        continue
      }

      // Buttons block (Gutenberg)
      if (className.includes('wp-block-buttons') || className.includes('wp-block-button')) {
        const links = extractButtonsFromElement(el)
        current.links.push(...links)
        continue
      }

      // Single image wrapper
      if (className.includes('wp-block-image')) {
        const img = extractSingleImage(el)
        if (img) {
          handleImageBoundary(img)
        }
        continue
      }

      // Video wrapper
      if (className.includes('wp-block-video') || className.includes('wp-block-embed')) {
        const iframe = el.querySelector('iframe')
        const video = el.querySelector('video')
        const mediaEl = iframe || video
        if (mediaEl) {
          emitSection()
          const videoContent = createEmptyContent()
          const src = mediaEl.getAttribute('src') || mediaEl.querySelector('source')?.getAttribute('src') || ''
          if (src) {
            videoContent.videos.push({ src, title: mediaEl.getAttribute('title') || '' })
          }
          sections.push({
            id: `section-${++sectionCounter}`,
            blockType: 'video',
            extractedContent: videoContent,
          })
          continue
        }
      }

      // Generic div: recurse if it has meaningful content
      const innerImgs = extractImagesFromElement(el)
      const innerParas = extractParagraphsFromElement(el)
      const innerLinks = extractButtonsFromElement(el)
      const innerHeadings = extractHeadingsFromElement(el)

      if (innerHeadings.length > 0) {
        emitSection()
        current.headings.push(...innerHeadings)
      }
      if (innerImgs.length > 0) {
        innerImgs.forEach(img => handleImageBoundary(img))
      }
      current.paragraphs.push(...innerParas)
      current.links.push(...innerLinks)
      continue
    }

    // --- <figure> → image + optional caption ---
    if (tag === 'figure') {
      // Check for video inside figure
      const iframe = el.querySelector('iframe')
      const video = el.querySelector('video')
      if (iframe || video) {
        emitSection()
        const videoContent = createEmptyContent()
        const mediaEl = iframe || video
        const src = mediaEl.getAttribute('src') || mediaEl.querySelector('source')?.getAttribute('src') || ''
        if (src) {
          videoContent.videos.push({ src, title: mediaEl.getAttribute('title') || '' })
        }
        sections.push({
          id: `section-${++sectionCounter}`,
          blockType: 'video',
          extractedContent: videoContent,
        })
        continue
      }

      const img = extractSingleImage(el)
      if (img) {
        handleImageBoundary(img)
      }
      continue
    }

    // --- <p> → might contain <img>, CTA link, or just text ---
    if (tag === 'p') {
      const imgEl = el.querySelector('img')
      if (imgEl) {
        const src = getBestImageSrc(imgEl)
        if (src && !src.startsWith('data:')) {
          handleImageBoundary({
            src,
            alt: imgEl.getAttribute('alt') || '',
            caption: '',
            className: imgEl.className || '',
          })
          continue
        }
      }

      // Check for CTA-style links
      const linkEl = el.querySelector('a')
      if (linkEl && el.textContent.trim() === linkEl.textContent.trim()) {
        const cls = linkEl.className || ''
        if (cls.includes('button') || cls.includes('btn') || cls.includes('cta') || cls.includes('wp-block-button')) {
          current.links.push({
            href: linkEl.getAttribute('href') || '',
            text: linkEl.textContent.trim(),
          })
          continue
        }
      }

      const text = el.textContent.trim()
      if (text) {
        current.paragraphs.push({ text, html: el.innerHTML })
      }
      continue
    }

    // --- Lists ---
    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.querySelectorAll(':scope > li'))
        .map(li => li.innerHTML.trim())
        .filter(Boolean)
      if (items.length > 0) {
        current.lists.push({ type: tag, items, html: el.innerHTML })
      }
      continue
    }

    // --- Standalone images ---
    if (tag === 'img') {
      const src = getBestImageSrc(el)
      if (src && !src.startsWith('data:')) {
        handleImageBoundary({
          src,
          alt: el.getAttribute('alt') || '',
          caption: '',
          className: el.className || '',
        })
      }
      continue
    }

    // --- Blockquote ---
    if (tag === 'blockquote') {
      const text = el.textContent.trim()
      if (text) {
        current.paragraphs.push({
          text,
          html: `<blockquote>${el.innerHTML}</blockquote>`,
        })
      }
      continue
    }

    // --- Standalone <a> links ---
    if (tag === 'a') {
      const href = el.getAttribute('href') || ''
      const text = el.textContent.trim()
      if (href && text) {
        current.links.push({ href, text })
      }
      continue
    }
  }

  // Emit any remaining accumulated content
  emitSection()

  return sections

  // --- Helper functions ---

  function handleImageBoundary(img) {
    const hasExistingImages = current.images.length > 0
    const hasTextAfterImages = current.paragraphs.length > 0 && hasExistingImages

    if (hasTextAfterImages) {
      emitSection()
    }

    current.images.push(img)

    // Cap at 6 images per section
    if (current.images.length >= 6) {
      emitSection()
    }
  }

  function emitSection() {
    if (!hasContent(current)) return

    const content = {
      headings: current.headings,
      paragraphs: current.paragraphs,
      images: current.images,
      links: current.links,
      lists: current.lists,
      videos: current.videos,
      hotspots: [],
    }

    const blockType = determineBlockType(content, current.columnHint)

    sections.push({
      id: `section-${++sectionCounter}`,
      blockType,
      extractedContent: content,
      _columnHint: current.columnHint,
    })

    current = createEmptyAccumulator()
  }
}

// ===================================================================
// WPBakery / Visual Composer row processing
// ===================================================================

/**
 * Check if a wpb_row is a full-width wrapper (single medium-12 column).
 * Returns the inner wpb_wrapper element, or null if not a wrapper.
 */
function getFullWidthWrapperEl(rowEl) {
  const columns = rowEl.querySelectorAll(':scope > .wpb_column, :scope > [class*="vc_column_container"]')
  if (columns.length !== 1) return null
  const cls = columns[0].className || ''
  if (!cls.includes('medium-12')) return null
  return columns[0].querySelector('.wpb_wrapper') || null
}

/**
 * Process a WPBakery row div.
 * Extracts images, text, buttons, and determines column layout.
 */
function processWpbRow(rowEl) {
  const images = extractImagesFromElement(rowEl)
  const paragraphs = extractParagraphsFromElement(rowEl)
  const headings = extractHeadingsFromElement(rowEl)
  const links = extractButtonsFromElement(rowEl)
  const lists = extractListsFromElement(rowEl)
  const videos = extractVideosFromElement(rowEl)

  if (images.length === 0 && paragraphs.length === 0 && headings.length === 0 &&
      links.length === 0 && lists.length === 0 && videos.length === 0) {
    return null
  }

  // Determine column layout from WPBakery column classes
  const columnHint = detectColumnLayout(rowEl)

  return { images, paragraphs, headings, links, lists, videos, columnHint }
}

/**
 * Detect column layout from WPBakery / VC column classes.
 * medium-6 = 2 cols, medium-4 = 3 cols, medium-3 = 4 cols, medium-12 = 1 col
 * Returns the number of columns (0 if unknown).
 */
function detectColumnLayout(rowEl) {
  const columns = rowEl.querySelectorAll(
    '[class*="wpb_column"], [class*="vc_column_container"], [class*="wp-block-column"]'
  )
  if (columns.length <= 1) return 0

  // Check the first column's width class
  const firstCol = columns[0]
  const cls = firstCol.className || ''

  // WPBakery: medium-N where N is the column span out of 12
  const mediumMatch = cls.match(/medium-(\d+)/)
  if (mediumMatch) {
    const span = parseInt(mediumMatch[1])
    if (span > 0 && span <= 12) {
      return Math.round(12 / span)
    }
  }

  // VC: vc_col-sm-N
  const vcMatch = cls.match(/vc_col-sm-(\d+)/)
  if (vcMatch) {
    const span = parseInt(vcMatch[1])
    if (span > 0 && span <= 12) {
      return Math.round(12 / span)
    }
  }

  // Fall back to actual column count
  return columns.length
}

// ===================================================================
// Shared helpers
// ===================================================================

function createEmptyAccumulator() {
  return {
    headings: [],
    paragraphs: [],
    images: [],
    links: [],
    lists: [],
    videos: [],
    columnHint: 0,
  }
}

function createEmptyContent() {
  return {
    headings: [],
    paragraphs: [],
    images: [],
    links: [],
    lists: [],
    videos: [],
    hotspots: [],
  }
}

function hasContent(acc) {
  return (
    acc.headings.length > 0 ||
    acc.paragraphs.length > 0 ||
    acc.images.length > 0 ||
    acc.links.length > 0 ||
    acc.lists.length > 0 ||
    acc.videos.length > 0
  )
}

/**
 * Determine the block type based on extracted content.
 * columnHint (from WPBakery/VC layout) overrides image-count heuristics.
 */
function determineBlockType(content, columnHint) {
  const imageCount = content.images.length
  const hasLinks = content.links.length > 0
  const hasHeading = content.headings.length > 0
  const hasBody = content.paragraphs.length > 0 || content.lists.length > 0
  const hasVideo = content.videos.length > 0

  if (hasVideo) return 'video'
  if (imageCount === 0) return 'richText'

  // Use column hint from page builder if available
  if (columnHint >= 2 && imageCount >= 2) {
    if (columnHint === 2 && imageCount === 2) return 'twoUp'
    if (columnHint === 3 && imageCount === 3) return 'threeUp'
    if (columnHint === 2 && imageCount === 4) return 'twoByTwo'
    if (columnHint === 3 && imageCount === 6) return 'threeByTwo'
    if (columnHint === 4 && imageCount === 4) return 'twoByTwo'
  }

  // Single image: use attachment class to distinguish full-width vs one-up
  if (imageCount === 1) {
    const imgClass = content.images[0]?.className || ''
    if (imgClass.includes('attachment-full')) return 'fullWidth'
    if (imgClass.includes('attachment-medium')) return 'oneUp'
    // Fallback: no attachment class — use content heuristic
    if (!hasLinks && !hasHeading && !hasBody) return 'fullWidth'
    return 'oneUp'
  }
  if (imageCount === 2) return 'twoUp'
  if (imageCount === 3) return 'threeUp'
  if (imageCount === 4) return 'twoByTwo'
  if (imageCount >= 5) return 'threeByTwo'

  return 'richText'
}

function extractHrColor(el) {
  const style = el.getAttribute('style') || ''
  const colorMatch = style.match(/border(?:-top)?(?:-color)?:\s*([^;]+)/)
    || style.match(/color:\s*([^;]+)/)
    || style.match(/background(?:-color)?:\s*([^;]+)/)
  return colorMatch ? colorMatch[1].trim() : '#191c1f'
}

function extractSingleImage(container) {
  const img = container.querySelector('img')
  if (!img) return null
  const src = getBestImageSrc(img)
  if (!src || src.startsWith('data:')) return null
  const captionEl = container.querySelector('figcaption')
    || container.querySelector('[class*="caption"]')
  return {
    src,
    alt: img.getAttribute('alt') || '',
    caption: captionEl?.textContent?.trim() || '',
    className: img.className || '',
  }
}

function extractImagesFromElement(container) {
  const images = []
  const imgEls = container.querySelectorAll('img')
  imgEls.forEach(img => {
    const src = getBestImageSrc(img)
    if (src && !src.startsWith('data:')) {
      const figure = img.closest('figure')
      const captionEl = figure?.querySelector('figcaption')
        || figure?.querySelector('[class*="caption"]')
        || img.parentElement?.closest('[class*="single_image"]')?.querySelector('figcaption')
      images.push({
        src,
        alt: img.getAttribute('alt') || '',
        caption: captionEl?.textContent?.trim() || '',
        className: img.className || '',
      })
    }
  })
  return images
}

function extractParagraphsFromElement(container) {
  const paragraphs = []
  container.querySelectorAll('p').forEach(p => {
    if (p.querySelector('img') && p.textContent.trim() === '') return
    const text = p.textContent.trim()
    if (text) {
      paragraphs.push({ text, html: p.innerHTML })
    }
  })
  return paragraphs
}

/**
 * Extract button/CTA links from an element.
 * Handles: WPBakery <a class="btn ...">, Gutenberg wp-block-button, and generic button links.
 */
function extractButtonsFromElement(container) {
  const links = []
  const seen = new Set()
  container.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || ''
    const text = a.textContent.trim()
    if (!href || !text) return
    const key = href + '|' + text
    if (seen.has(key)) return
    seen.add(key)

    const cls = a.className || ''
    const role = a.getAttribute('role') || ''
    const isButton = cls.includes('btn') || cls.includes('button') || cls.includes('cta') ||
                     cls.includes('wp-block-button') || role === 'button'

    if (isButton) {
      links.push({ href, text })
    }
  })
  return links
}

function extractLinksFromElement(container) {
  const links = []
  container.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || ''
    const text = a.textContent.trim()
    if (href && text) {
      links.push({ href, text })
    }
  })
  return links
}

function extractHeadingsFromElement(container) {
  const headings = []
  container.querySelectorAll('h2, h3, h4, h5, h6').forEach(h => {
    const text = h.textContent.trim()
    if (text) {
      const origLevel = parseInt(h.tagName[1])
      // Remap: h3 → h2, h4 → h2; h5/h6 stay as-is
      const level = (origLevel === 3 || origLevel === 4) ? 2 : origLevel
      headings.push({ level, text, html: h.innerHTML })
    }
  })
  return headings
}

function extractListsFromElement(container) {
  const lists = []
  container.querySelectorAll('ul, ol').forEach(el => {
    const items = Array.from(el.querySelectorAll(':scope > li'))
      .map(li => li.innerHTML.trim())
      .filter(Boolean)
    if (items.length > 0) {
      lists.push({ type: el.tagName.toLowerCase(), items, html: el.innerHTML })
    }
  })
  return lists
}

function extractVideosFromElement(container) {
  const videos = []
  container.querySelectorAll('iframe, video').forEach(el => {
    const src = el.getAttribute('src') || el.querySelector('source')?.getAttribute('src') || ''
    if (src) {
      videos.push({ src, title: el.getAttribute('title') || '' })
    }
  })
  return videos
}
