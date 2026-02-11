import { FIGMA_BLOCKS } from '../constants'

/**
 * Sanitize contenteditable HTML output:
 * - <b> → <strong>, <i> → <em>
 * - <div> → <p> (common contenteditable artifact)
 * - Strip inline styles
 * - Normalize whitespace
 */
export function sanitizeBodyHtml(html) {
  if (!html || !html.trim()) return ''

  let cleaned = html
    // Replace <b> with <strong>
    .replace(/<b(\s|>)/gi, '<strong$1')
    .replace(/<\/b>/gi, '</strong>')
    // Replace <i> with <em>
    .replace(/<i(\s|>)/gi, '<em$1')
    .replace(/<\/i>/gi, '</em>')
    // Replace <div> with <p> (contenteditable wraps lines in divs)
    .replace(/<div(\s|>)/gi, '<p$1')
    .replace(/<\/div>/gi, '</p>')
    // Strip inline styles
    .replace(/\s*style="[^"]*"/gi, '')
    // Strip class attributes (contenteditable shouldn't add BEM classes to body content)
    .replace(/\s*class="[^"]*"/gi, '')
    // Collapse multiple <br> into paragraph breaks
    .replace(/(<br\s*\/?>){2,}/gi, '</p><p>')
    // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/gi, '')
    // Trim
    .trim()

  // If the content doesn't start with a block element, wrap in <p>
  if (cleaned && !/^<(p|h[1-6]|ul|ol|blockquote|hr)/i.test(cleaned)) {
    cleaned = `<p>${cleaned}</p>`
  }

  return cleaned
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Generate HTML for a single builder section.
 * Uses exact BEM class names matching blogCss.js.
 */
export function generateBuilderSectionHtml(section) {
  const block = FIGMA_BLOCKS[section.blockType]
  if (!block) return ''

  const prefix = block.prefix

  // Hotspot is a standalone section with its own structure (no heading/body)
  if (section.blockType === 'hotspot') {
    return generateHotspotSectionHtml(section, prefix)
  }

  const parts = []

  parts.push(`<section class="${prefix}">`)

  // Heading
  if (section.heading && section.heading.trim()) {
    parts.push(`  <h2 class="${prefix}__heading">${escapeHtml(section.heading.trim())}</h2>`)
  }

  // Body
  const bodyHtml = sanitizeBodyHtml(section.body || '')
  if (bodyHtml) {
    parts.push(`  <div class="${prefix}__body">`)
    // Indent body content
    const indented = bodyHtml.split('\n').map(line => `    ${line}`).join('\n')
    parts.push(indented)
    parts.push(`  </div>`)
  }

  // Type-specific content
  switch (section.blockType) {
    case 'fullWidth':
      if (section.images?.[0]?.src) {
        parts.push(`  <figure class="${prefix}__figure">`)
        parts.push(`    <img class="${prefix}__image" src="${escapeHtml(section.images[0].src)}" alt="${escapeHtml(section.images[0].alt || '')}">`)
        parts.push(`  </figure>`)
      }
      break

    case 'oneUp':
      if (section.images?.[0]?.src) {
        parts.push(`  <figure class="${prefix}__figure">`)
        parts.push(`    <img class="${prefix}__image" src="${escapeHtml(section.images[0].src)}" alt="${escapeHtml(section.images[0].alt || '')}">`)
        if (section.images[0].label) {
          parts.push(`    <figcaption class="${prefix}__label">${escapeHtml(section.images[0].label)}</figcaption>`)
        }
        parts.push(`  </figure>`)
      }
      break

    case 'twoUp':
    case 'threeUp':
    case 'twoByTwo':
    case 'threeByTwo': {
      const images = section.images || []
      const ctas = (section.ctas || []).filter(c => c?.text && c?.href)
      const hasPerImageCtas = ctas.length > 1

      if (images.some(img => img.src)) {
        parts.push(`  <div class="${prefix}__grid">`)
        images.forEach((img, i) => {
          if (img.src) {
            parts.push(`    <figure class="${prefix}__item">`)
            parts.push(`      <img class="${prefix}__image" src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || '')}">`)
            if (img.label) {
              parts.push(`      <figcaption class="${prefix}__label">${escapeHtml(img.label)}</figcaption>`)
            }
            if (hasPerImageCtas && ctas[i]) {
              parts.push(`      <a class="${prefix}__cta-btn" href="${escapeHtml(ctas[i].href)}">${escapeHtml(ctas[i].text)}</a>`)
            }
            parts.push(`    </figure>`)
          }
        })
        parts.push(`  </div>`)
      }
      // Single CTA spans full width
      if (ctas.length === 1) {
        parts.push(`  <div class="${prefix}__cta">`)
        parts.push(`    <a class="${prefix}__cta-btn" href="${escapeHtml(ctas[0].href)}">${escapeHtml(ctas[0].text)}</a>`)
        parts.push(`  </div>`)
      }
      break
    }

    case 'video':
      if (section.videoUrl) {
        parts.push(`  <div class="${prefix}__wrapper">`)
        parts.push(`    <iframe`)
        parts.push(`      class="${prefix}__iframe"`)
        parts.push(`      src="${escapeHtml(section.videoUrl)}"`)
        parts.push(`      title="${escapeHtml(section.videoTitle || 'Video')}"`)
        parts.push(`      frameborder="0"`)
        parts.push(`      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`)
        parts.push(`      allowfullscreen>`)
        parts.push(`    </iframe>`)
        parts.push(`  </div>`)
      }
      break

    case 'richText':
      // No extra fields beyond heading + body
      break

  }

  parts.push(`</section>`)

  return parts.join('\n')
}

function generateHotspotSectionHtml(section, prefix) {
  const hotspotImg = section.hotspotImage
  if (!hotspotImg?.src) return ''

  const validItems = (section.hotspots || []).filter(
    (item) => item.href && item.label
  )
  if (validItems.length === 0) return ''

  const linkCount = validItems.length
  const parts = []

  parts.push(`<section class="${prefix} ${prefix}--${linkCount}-link${linkCount !== 1 ? 's' : ''}">`)
  parts.push(`  <figure class="${prefix}__inner">`)
  parts.push(`    <img src="${escapeHtml(hotspotImg.src)}" alt="${escapeHtml(hotspotImg.alt || '')}" class="${prefix}__image">`)

  validItems.forEach((item, index) => {
    parts.push(`    <a class="${prefix}__item" href="${escapeHtml(item.href)}" style="left: ${item.left}; top: ${item.top};">`)
    parts.push(`      <span class="${prefix}__marker">${index + 1}</span>`)
    parts.push(`      <span class="${prefix}__label">${escapeHtml(item.label)}</span>`)
    parts.push(`    </a>`)
  })

  parts.push(`  </figure>`)
  parts.push(`</section>`)

  return parts.join('\n')
}
