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
  'Blog: Handle',
  'Blog: Commentable',
]

/**
 * Generate Matrixify-compatible CSV string from scraper results.
 */
export function generateCsv(results) {
  const rows = results.map((r, i) => {
    const handle = urlToHandle(r.url)
    const tagsStr = (r.tags || []).join(', ')
    const published = r.html ? 'true' : 'false'

    return [
      escapeCsvValue(''),                    // ID — leave blank for import
      escapeCsvValue(handle),                // Handle
      escapeCsvValue('MERGE'),               // Command
      escapeCsvValue(r.title),               // Title
      escapeCsvValue(r.author || ''),        // Author
      escapeCsvValue(r.html),                // Body HTML
      escapeCsvValue(r.summary || ''),       // Summary HTML
      escapeCsvValue(tagsStr),               // Tags
      escapeCsvValue('MERGE'),               // Tags Command
      escapeCsvValue(r.publishedAt || ''),   // Created At
      escapeCsvValue(''),                    // Updated At
      escapeCsvValue(published),             // Published
      escapeCsvValue(r.publishedAt || ''),   // Published At
      escapeCsvValue(r.imageSrc || ''),      // Image Src
      escapeCsvValue(''),                    // Image Width
      escapeCsvValue(''),                    // Image Height
      escapeCsvValue(r.imageAlt || ''),      // Image Alt Text
      escapeCsvValue(''),                    // Blog: ID
      escapeCsvValue(''),                    // Blog: Handle
      escapeCsvValue(''),                    // Blog: Commentable
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
export function downloadCsv(results, filename = 'blog-migration.csv') {
  const csv = generateCsv(results)
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
