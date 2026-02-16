/**
 * Escape a value for CSV: wrap in quotes if it contains commas, quotes, or newlines.
 * Double any internal quotes.
 */
function escapeCsvValue(value) {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Generate a URL handle from a post URL.
 * e.g. "https://blog.example.com/2024/01/my-post/" → "my-post"
 */
function urlToHandle(url) {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '')
    const lastSegment = path.split('/').pop() || ''
    return lastSegment
  } catch {
    return ''
  }
}

const SHOPIFY_CDN = {
  staging: 'https://cdn.shopify.com/s/files/1/0618/5153/3389/files/',
  production: 'https://cdn.shopify.com/s/files/1/0894/3186/7695/files/',
}

/**
 * Extract the filename from a WordPress / wp.com image URL,
 * strip query params and path prefix.
 */
function extractWpFilename(url) {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname
    // Grab everything after the last /
    const filename = path.split('/').pop()
    return filename || null
  } catch {
    return null
  }
}

/**
 * Check if a URL looks like a WordPress image we should transform.
 */
function isWpImageUrl(url) {
  if (!url) return false
  return /wp-content\/uploads\//i.test(url)
    || /^https?:\/\/i\d\.wp\.com\//i.test(url)
}

/**
 * Transform a single WordPress image URL to a Shopify CDN URL.
 * - staging: keeps filename as-is
 * - production: replaces dots in filename stem with underscores
 */
function transformImageUrl(url, env) {
  if (!isWpImageUrl(url)) return url

  const filename = extractWpFilename(url)
  if (!filename) return url

  const base = SHOPIFY_CDN[env] || SHOPIFY_CDN.staging

  if (env === 'production') {
    // Replace dots in the stem with underscores, keep the extension dot
    const lastDot = filename.lastIndexOf('.')
    if (lastDot > 0) {
      const stem = filename.substring(0, lastDot).replace(/\./g, '_')
      const ext = filename.substring(lastDot)
      return base + stem + ext
    }
  }

  return base + filename
}

/**
 * Transform all WordPress image URLs inside an HTML string.
 */
function transformHtmlImages(html, env) {
  if (!html || !env) return html
  // Match src="..." and srcset="..." attribute values
  return html.replace(
    /(?:src|srcset)=["']([^"']+)["']/g,
    (match, url) => {
      if (!isWpImageUrl(url)) return match
      const attr = match.startsWith('src=') ? 'src' : 'srcset'
      const quote = match.charAt(attr.length + 1)
      return `${attr}=${quote}${transformImageUrl(url, env)}${quote}`
    }
  )
}

/**
 * Format a date string to "YYYY-MM-DD HH:MM:SS -0800" (PST).
 * Returns empty string if the input can't be parsed.
 */
function formatDatePST(raw) {
  if (!raw) return ''
  const d = new Date(raw)
  if (isNaN(d.getTime())) return ''

  // Format in America/Los_Angeles timezone
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(d)

  const get = (type) => parts.find(p => p.type === type)?.value || ''
  const date = `${get('year')}-${get('month')}-${get('day')}`
  const time = `${get('hour')}:${get('minute')}:${get('second')}`

  // Determine PST (-0800) vs PDT (-0700)
  const jan = new Date(d.getFullYear(), 0, 1)
  const jul = new Date(d.getFullYear(), 6, 1)
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset())
  const laOffset = new Date(d.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const utc = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }))
  const diffMin = (utc - laOffset) / 60000
  const offsetStr = diffMin === 480 ? '-0800' : '-0700'

  return `${date} ${time} ${offsetStr}`
}

const MATRIXIFY_HEADERS = [
  'ID',
  'Handle',
  'Command',
  'Title',
  'Author',
  'Body HTML',
  'Summary HTML',
  'Tags',
  'Tags Command',
  'Created At',
  'Updated At',
  'Published',
  'Published At',
  'Image Src',
  'Image Width',
  'Image Height',
  'Image Alt Text',
  'Blog: ID',
  'Blog: Title',
  'Blog: Handle',
  'Blog: Commentable',
  'Blog: Created At',
]

/**
 * Generate Matrixify-compatible CSV string from scraper results.
 * @param {Array} results
 * @param {'staging'|'production'} env - Shopify environment for image URL mapping
 */
export function generateCsv(results, env = 'staging') {
  const rows = results.map((r, i) => {
    const handle = urlToHandle(r.url)
    const tagsStr = (r.tags || []).join(', ')
    const published = r.html ? 'true' : 'false'
    const bodyHtml = transformHtmlImages(r.html, env)
    const imageSrc = transformImageUrl(r.imageSrc || '', env)

    return [
      escapeCsvValue(''),                    // ID — leave blank for import
      escapeCsvValue(handle),                // Handle
      escapeCsvValue('MERGE'),               // Command
      escapeCsvValue(r.title),               // Title
      escapeCsvValue(r.author || ''),        // Author
      escapeCsvValue(bodyHtml),              // Body HTML
      escapeCsvValue(r.summary || ''),       // Summary HTML
      escapeCsvValue(tagsStr),               // Tags
      escapeCsvValue('MERGE'),               // Tags Command
      escapeCsvValue(r.publishedAt || ''),   // Created At
      escapeCsvValue(''),                    // Updated At
      escapeCsvValue(published),             // Published
      escapeCsvValue(r.publishedAt || ''),   // Published At
      escapeCsvValue(imageSrc),              // Image Src
      escapeCsvValue(''),                    // Image Width
      escapeCsvValue(''),                    // Image Height
      escapeCsvValue(r.imageAlt || ''),      // Image Alt Text
      escapeCsvValue(''),                    // Blog: ID
      escapeCsvValue('Academy'),             // Blog: Title
      escapeCsvValue('academy'),             // Blog: Handle
      escapeCsvValue('no'),                  // Blog: Commentable
      escapeCsvValue(formatDatePST(r.publishedAt)), // Blog: Created At
    ]
  })

  return [
    MATRIXIFY_HEADERS.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCsv(results, env = 'staging', filename = 'blog-migration.csv') {
  const csv = generateCsv(results, env)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
