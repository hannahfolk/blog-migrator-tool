import { FIGMA_BLOCKS } from '../constants'

/**
 * Process all links in generated HTML:
 * 1. Rewrite blog.fashionphile.com URLs to relative paths
 * 2. Rewrite sign-in/sign-up links to canonical paths
 * 3. Add target="_blank" rel="noopener noreferrer" to external links
 */
export function processLinks(html) {
  if (!html) return html

  // 1. Rewrite blog domain to relative paths
  let processed = html.replace(
    /href="https?:\/\/blog\.fashionphile\.com\//gi,
    'href="/'
  )

  // 2. Rewrite sign-in / sign-up links
  processed = processed.replace(/href="([^"]*)"/gi, (match, href) => {
    const lower = href.toLowerCase()
    if (/sign[-_]?in|log[-_]?in/i.test(lower)) return 'href="/pages/sign-in"'
    if (/sign[-_]?up|register|create[-_]?account/i.test(lower)) return 'href="/pages/sign-up"'
    return match
  })

  // 3. Add accessibility to external links (absolute http/https URLs)
  processed = processed.replace(/<a\s+([^>]*)>/gi, (match, attrs) => {
    const hrefMatch = attrs.match(/href="([^"]*)"/i)
    if (!hrefMatch) return match
    const href = hrefMatch[1]
    if (!/^https?:\/\//i.test(href)) return match
    let newAttrs = attrs
    if (!/target=/i.test(newAttrs)) newAttrs += ' target="_blank"'
    if (!/rel=/i.test(newAttrs)) newAttrs += ' rel="noopener noreferrer"'
    return `<a ${newAttrs}>`
  })

  return processed
}

const FONT_WEIGHT_MAP = {
  '200': 'light',
  '300': 'light',
  '400': 'regular',
  'normal': 'regular',
  '500': 'medium',
  '600': 'semibold',
  '700': 'bold',
  'bold': 'bold',
}

/**
 * Convert inline font-weight styles to fp-font-weight--* utility classes.
 * Handles tags that have style="font-weight: 400;" (with or without other styles).
 * Strips the font-weight from the style and adds the class.
 */
export function convertFontWeightToClasses(html) {
  if (!html) return html

  return html.replace(/<([a-z][a-z0-9]*)((?:\s+[^>]*?)?)(\s*\/?)>/gi, (match, tag, attrs, selfClose) => {
    // Extract style attribute
    const styleMatch = attrs.match(/\s*style="([^"]*)"/i)
    if (!styleMatch) return match

    const styleStr = styleMatch[1]
    // Look for font-weight in the style
    const fwMatch = styleStr.match(/font-weight:\s*([^;]+)/i)
    if (!fwMatch) return match

    const weightValue = fwMatch[1].trim()
    const className = FONT_WEIGHT_MAP[weightValue]
    if (!className) return match

    const fpClass = `fp-font-weight--${className}`

    // Remove font-weight from style
    let newStyle = styleStr
      .replace(/font-weight:\s*[^;]+;?\s*/i, '')
      .trim()
      .replace(/;\s*$/, '')

    // Remove style attr if empty, otherwise update it
    let newAttrs = attrs
    if (!newStyle) {
      newAttrs = attrs.replace(/\s*style="[^"]*"/i, '')
    } else {
      newAttrs = attrs.replace(/style="[^"]*"/i, `style="${newStyle}"`)
    }

    // Add the class — merge with existing class attr or add new one
    const classMatch = newAttrs.match(/class="([^"]*)"/i)
    if (classMatch) {
      const existing = classMatch[1]
      if (!existing.includes(fpClass)) {
        newAttrs = newAttrs.replace(/class="([^"]*)"/i, `class="${existing} ${fpClass}"`)
      }
    } else {
      newAttrs += ` class="${fpClass}"`
    }

    return `<${tag}${newAttrs}${selfClose}>`
  })
}

/**
 * Sanitize contenteditable HTML output:
 * - <b> → <strong>, <i> → <em>
 * - <div> → <p> (common contenteditable artifact)
 * - Convert font-weight styles to utility classes
 * - Strip remaining inline styles
 * - Normalize whitespace
 */
export function sanitizeBodyHtml(html) {
  if (!html || !html.trim()) return ''

  // Convert font-weight styles to classes before stripping styles
  let cleaned = convertFontWeightToClasses(html)

  cleaned = cleaned
    // Replace <b> with <strong>
    .replace(/<b(\s|>)/gi, '<strong$1')
    .replace(/<\/b>/gi, '</strong>')
    // Replace <i> with <em>
    .replace(/<i(\s|>)/gi, '<em$1')
    .replace(/<\/i>/gi, '</em>')
    // Replace <div> with <p> (contenteditable wraps lines in divs)
    .replace(/<div(\s|>)/gi, '<p$1')
    .replace(/<\/div>/gi, '</p>')
    // Strip remaining inline styles (font-weight already converted to classes)
    .replace(/\s*style="[^"]*"/gi, '')
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

/**
 * Convert a YouTube or Vimeo URL to its embed form.
 * Passes through URLs that are already embed URLs or unrecognized.
 */
function toEmbedUrl(url) {
  if (!url) return url
  let match

  // youtube.com/watch?v=ID
  match = url.match(/(?:youtube\.com\/watch\?.*v=)([\w-]+)/i)
  if (match) return `https://www.youtube.com/embed/${match[1]}`

  // youtu.be/ID
  match = url.match(/youtu\.be\/([\w-]+)/i)
  if (match) return `https://www.youtube.com/embed/${match[1]}`

  // youtube.com/embed/ID — already correct
  if (/youtube\.com\/embed\//i.test(url)) return url

  // vimeo.com/ID
  match = url.match(/vimeo\.com\/(\d+)/i)
  if (match && !/player\.vimeo\.com/i.test(url)) {
    return `https://player.vimeo.com/video/${match[1]}`
  }

  return url
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getValidHotspots(img) {
  return (img.hotspots || []).filter(h => h.href && h.label)
}

function generateImageHotspotHtml(validHotspots, indent) {
  const lines = []
  validHotspots.forEach((item, index) => {
    lines.push(`${indent}<a class="blog__hotspot__item" href="${escapeHtml(item.href)}" style="left: ${item.left}; top: ${item.top};">`)
    lines.push(`${indent}  <span class="blog__hotspot__marker fp-font-weight--bold">${index + 1}</span>`)
    lines.push(`${indent}  <span class="blog__hotspot__label fp-font-weight--semibold">${escapeHtml(item.label)}</span>`)
    lines.push(`${indent}</a>`)
  })
  return lines
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

  // Author byline — simple text section
  if (section.blockType === 'authorByline') {
    const parts = []
    parts.push(`<section class="${prefix}">`)
    if (section.authorName?.trim()) {
      parts.push(`  <p class="${prefix}__text"><span class="${prefix}__prefix">By: </span>${escapeHtml(section.authorName.trim())}</p>`)
    }
    if (section.authorTitle?.trim()) {
      parts.push(`  <p class="${prefix}__title">${escapeHtml(section.authorTitle.trim())}</p>`)
    }
    parts.push(`</section>`)
    return parts.join('\n')
  }

  // HR is a simple divider
  if (section.blockType === 'hr') {
    const color = section.hrColor || '#191c1f'
    return `<hr class="${prefix}" style="border: none; border-top: 1px solid ${color};">`
  }

  const parts = []

  parts.push(`<section class="${prefix}">`)

  // Heading — preserve the original tag level (default to h2 for backwards compat)
  if (section.heading && section.heading.trim()) {
    const tag = section.headingTag || 'h2'
    parts.push(`  <${tag} class="${prefix}__heading fp-font-weight--semibold">${escapeHtml(section.heading.trim())}</${tag}>`)
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
        const fwHotspots = getValidHotspots(section.images[0])
        parts.push(`  <figure class="${prefix}__figure"${fwHotspots.length ? ' style="position: relative;"' : ''}>`)
        parts.push(`    <img class="${prefix}__image" src="${escapeHtml(section.images[0].src)}" alt="${escapeHtml(section.images[0].alt || '')}">`)
        if (fwHotspots.length) parts.push(...generateImageHotspotHtml(fwHotspots, '    '))
        parts.push(`  </figure>`)
      }
      break

    case 'oneUp':
      if (section.images?.[0]?.src) {
        const ouHotspots = getValidHotspots(section.images[0])
        parts.push(`  <figure class="${prefix}__figure"${ouHotspots.length ? ' style="position: relative;"' : ''}>`)
        parts.push(`    <img class="${prefix}__image" src="${escapeHtml(section.images[0].src)}" alt="${escapeHtml(section.images[0].alt || '')}">`)
        if (ouHotspots.length) parts.push(...generateImageHotspotHtml(ouHotspots, '    '))
        if (section.images[0].label) {
          parts.push(`    <figcaption class="${prefix}__label">${escapeHtml(section.images[0].label)}</figcaption>`)
        }
        if (section.ctas?.[0]?.text && section.ctas?.[0]?.href) {
          parts.push(`    <a class="${prefix}__cta-btn fp-font-weight--semibold" href="${escapeHtml(section.ctas[0].href)}">${escapeHtml(section.ctas[0].text)}</a>`)
        }
        parts.push(`  </figure>`)
      }
      break

    case 'twoUp':
    case 'threeUp':
    case 'fourUp':
    case 'fiveUp':
    case 'twoByTwo':
    case 'threeByTwo': {
      const images = section.images || []
      const ctas = (section.ctas || []).filter(c => c?.text && c?.href)
      const hasPerImageCtas = ctas.length > 1

      if (images.some(img => img.src)) {
        parts.push(`  <div class="${prefix}__grid">`)
        images.forEach((img, i) => {
          if (img.src) {
            const imgHotspots = getValidHotspots(img)
            parts.push(`    <figure class="${prefix}__item"${imgHotspots.length ? ' style="position: relative;"' : ''}>`)
            parts.push(`      <img class="${prefix}__image" src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || '')}">`)
            if (imgHotspots.length) parts.push(...generateImageHotspotHtml(imgHotspots, '      '))
            if (img.label) {
              parts.push(`      <figcaption class="${prefix}__label">${escapeHtml(img.label)}</figcaption>`)
            }
            if (hasPerImageCtas && ctas[i]) {
              parts.push(`      <a class="${prefix}__cta-btn fp-font-weight--semibold" href="${escapeHtml(ctas[i].href)}">${escapeHtml(ctas[i].text)}</a>`)
            }
            parts.push(`    </figure>`)
          }
        })
        parts.push(`  </div>`)
      }
      // Single CTA spans full width
      if (ctas.length === 1) {
        parts.push(`  <div class="${prefix}__cta">`)
        parts.push(`    <a class="${prefix}__cta-btn fp-font-weight--semibold" href="${escapeHtml(ctas[0].href)}">${escapeHtml(ctas[0].text)}</a>`)
        parts.push(`  </div>`)
      }
      break
    }

    case 'video':
      if (section.videoUrl) {
        const embedUrl = toEmbedUrl(section.videoUrl)
        parts.push(`  <div class="${prefix}__wrapper">`)
        parts.push(`    <iframe`)
        parts.push(`      class="${prefix}__iframe"`)
        parts.push(`      src="${escapeHtml(embedUrl)}"`)
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

  return processLinks(parts.join('\n'))
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
    parts.push(`      <span class="${prefix}__marker fp-font-weight--bold">${index + 1}</span>`)
    parts.push(`      <span class="${prefix}__label fp-font-weight--semibold">${escapeHtml(item.label)}</span>`)
    parts.push(`    </a>`)
  })

  parts.push(`  </figure>`)
  parts.push(`</section>`)

  return processLinks(parts.join('\n'))
}
