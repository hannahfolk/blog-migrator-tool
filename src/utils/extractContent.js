import { convertFontWeightToClasses, processLinks } from './generateBuilderHtml'

/**
 * Rewrite blog.fashionphile.com URLs to /blogs/academy paths.
 */
function rewriteBlogUrl(url) {
  if (!url) return url
  const match = url.match(/^https?:\/\/blog\.fashionphile\.com\/?(.*)$/i)
  if (!match) return url
  const path = match[1].replace(/^\/|\/$/g, '')
  return path ? `/blogs/academy/${path}` : '/blogs/academy'
}

/**
 * Convert <strong> and <b> tags to <span class="fp-font-weight--medium">.
 * Also runs convertFontWeightToClasses for inline style conversion.
 * Used in migrator output so that bold text uses utility classes instead of semantic tags.
 */
function cleanInlineHtml(html) {
  if (!html) return html
  let cleaned = convertFontWeightToClasses(html)
  cleaned = cleaned
    .replace(/<strong(?=[\s>])([^>]*)>/gi, '<span class="fp-font-weight--medium"$1>')
    .replace(/<\/strong>/gi, '</span>')
    .replace(/<b(?=[\s>])([^>]*)>/gi, '<span class="fp-font-weight--medium"$1>')
    .replace(/<\/b>/gi, '</span>')

  // Fix inline <img> tags with malformed src attributes (double =, missing quotes)
  cleaned = cleaned.replace(/<img\s+[^>]*>/gi, (imgTag) => {
    return imgTag.replace(/\bsrc\s*=\s*=?\s*([^"'\s>]+)=?(?=[\s>\/])/gi, (m, url) => {
      if (/^["']/.test(url)) return m
      return `src="${url}"`
    })
  })

  // Rewrite blog.fashionphile.com links to /blogs/academy
  cleaned = cleaned.replace(/href="https?:\/\/blog\.fashionphile\.com\/?([^"]*)"/gi, (match, path) => {
    const trimmed = path.replace(/^\/|\/$/g, '')
    if (!trimmed) return 'href="/blogs/academy"'
    return `href="/blogs/academy/${trimmed}"`
  })

  return cleaned
}

/**
 * Get the highest-resolution image URL from an <img> element.
 * Checks srcset, data-src/data-lazy-src (lazy loading), and falls back to src.
 */
export function getBestImageSrc(img) {
  // Check srcset for the largest available image
  const srcset = img.getAttribute('srcset')
  if (srcset) {
    const candidates = srcset.split(',').map(entry => {
      const parts = entry.trim().split(/\s+/)
      const url = parts[0]
      const descriptor = parts[1] || ''
      // Parse width descriptor (e.g. "800w") or pixel density (e.g. "2x")
      let size = 0
      if (descriptor.endsWith('w')) {
        size = parseInt(descriptor)
      } else if (descriptor.endsWith('x')) {
        size = parseFloat(descriptor) * 1000 // weight density higher
      }
      return { url, size }
    }).filter(c => c.url)

    if (candidates.length > 0) {
      // Pick the largest
      candidates.sort((a, b) => b.size - a.size)
      const best = candidates[0].url
      if (best && !best.startsWith('data:')) return best
    }
  }

  // Check common lazy-load attributes
  const lazySrc = img.getAttribute('data-src')
    || img.getAttribute('data-lazy-src')
    || img.getAttribute('data-original')
    || img.getAttribute('data-full-src')
  if (lazySrc && !lazySrc.startsWith('data:')) return lazySrc

  // Fall back to src
  return img.getAttribute('src') || ''
}

/**
 * Extract content from DOM elements within a given rectangle
 * The rect coordinates are relative to the container's scrollable content
 */
export function extractContentFromRect(containerEl, selectionRect) {
  if (!containerEl) return null

  const content = {
    headings: [],
    paragraphs: [],
    images: [],
    links: [],
    lists: [],
    videos: [],
    hotspots: [], // Hotspot sections with image + clickable areas
    rawHtml: ''
  }

  // Use the first child (preview content div) for content queries
  // to avoid matching SelectionOverlay elements (which are siblings)
  const contentEl = containerEl.firstElementChild || containerEl

  // Get container's position for offset calculations
  const containerBounds = containerEl.getBoundingClientRect()

  // Selection bounds in document/scroll coordinates
  const selTop = selectionRect.y
  const selBottom = selectionRect.y + selectionRect.height
  const selLeft = selectionRect.x
  const selRight = selectionRect.x + selectionRect.width

  // Helper to check if element center is within selection
  const isElementInSelection = (el) => {
    const elRect = el.getBoundingClientRect()
    const elTop = elRect.top - containerBounds.top + containerEl.scrollTop
    const elBottom = elRect.bottom - containerBounds.top + containerEl.scrollTop
    const elLeft = elRect.left - containerBounds.left + containerEl.scrollLeft
    const elRight = elRect.right - containerBounds.left + containerEl.scrollLeft
    const elCenterY = (elTop + elBottom) / 2
    const elCenterX = (elLeft + elRight) / 2
    return (
      elCenterY >= selTop &&
      elCenterY <= selBottom &&
      elCenterX >= selLeft &&
      elCenterX <= selRight
    )
  }

  // Lenient overlap check — any overlap between element and selection
  const doesElementOverlap = (el) => {
    const elRect = el.getBoundingClientRect()
    const elTop = elRect.top - containerBounds.top + containerEl.scrollTop
    const elBottom = elRect.bottom - containerBounds.top + containerEl.scrollTop
    const elLeft = elRect.left - containerBounds.left + containerEl.scrollLeft
    const elRight = elRect.right - containerBounds.left + containerEl.scrollLeft
    return (
      elTop < selBottom &&
      elBottom > selTop &&
      elLeft < selRight &&
      elRight > selLeft
    )
  }

  // First, check for hotspot sections
  const hotspotSections = contentEl.querySelectorAll('[class*="hotspot"]')
  const processedHotspotImages = new Set() // Track images we've already added as hotspots
  const processedHotspotElements = new Set() // Track elements we've already processed

  hotspotSections.forEach(section => {
    if (!isElementInSelection(section)) return

    // Find the outermost hotspot container for this element
    let hotspotContainer = section
    let parent = section.parentElement
    while (parent && parent !== containerEl) {
      if (parent.className && parent.className.includes && parent.className.includes('hotspot')) {
        hotspotContainer = parent
      }
      parent = parent.parentElement
    }

    // Skip if we've already processed this container
    if (processedHotspotElements.has(hotspotContainer)) return
    processedHotspotElements.add(hotspotContainer)

    const img = hotspotContainer.querySelector('img')

    // Look for hotspot markers - can be <a> tags or <div> tags with position styles
    // Pattern 1: <a class="blog__hotspot__item"> with position styles
    // Pattern 2: <div class="thb-hotspot"> with position styles (WordPress theme)
    const hotspotMarkers = Array.from(hotspotContainer.querySelectorAll('a, div')).filter(el => {
      const style = el.getAttribute('style') || ''
      const className = el.className || ''

      // Must have position styles
      const hasPositionStyle = style.includes('left:') && style.includes('top:')
      if (!hasPositionStyle) return false

      // Must be a hotspot item class, not a child element like tooltip/content
      const isHotspotItem = className.includes('hotspot__item') ||
                            (className.includes('thb-hotspot') && !className.includes('thb-hotspot-'))
      const isNotContainer = !className.includes('container')

      // Make sure it's not nested inside another hotspot marker
      const parentWithPosition = el.parentElement?.closest('[style*="left:"][style*="top:"]')
      const isNotNested = !parentWithPosition || parentWithPosition === hotspotContainer

      return isHotspotItem && isNotContainer && isNotNested
    })

    if (img && hotspotMarkers.length > 0) {
      const imgSrc = getBestImageSrc(img)

      // Skip if we've already added this image as a hotspot
      if (processedHotspotImages.has(imgSrc)) return

      // Try to find links from a preceding ordered list (WordPress pattern)
      // The list is often in a separate row/container, so we need to traverse up
      let precedingLinks = []

      // Find the row-level container (look for common wrapper patterns)
      let rowContainer = hotspotContainer
      while (rowContainer && rowContainer !== containerEl) {
        const className = rowContainer.className || ''
        if (className.includes('row') || className.includes('wpb_row') || className.includes('vc_row')) {
          break
        }
        rowContainer = rowContainer.parentElement
      }

      // Search previous siblings at the row level
      if (rowContainer && rowContainer !== containerEl) {
        let prevRow = rowContainer.previousElementSibling
        for (let i = 0; i < 5 && prevRow; i++) {
          const ol = prevRow.querySelector('ol')
          if (ol) {
            precedingLinks = Array.from(ol.querySelectorAll('li a')).map(a => ({
              href: a.getAttribute('href') || '#',
              text: a.textContent?.trim() || ''
            }))
            break
          }
          prevRow = prevRow.previousElementSibling
        }

        // If not found above, try looking below
        if (precedingLinks.length === 0) {
          let nextRow = rowContainer.nextElementSibling
          for (let i = 0; i < 5 && nextRow; i++) {
            const ol = nextRow.querySelector('ol')
            if (ol) {
              precedingLinks = Array.from(ol.querySelectorAll('li a')).map(a => ({
                href: a.getAttribute('href') || '#',
                text: a.textContent?.trim() || ''
              }))
              break
            }
            nextRow = nextRow.nextElementSibling
          }
        }
      }

      const hotspotData = {
        image: {
          src: imgSrc,
          alt: img.getAttribute('alt') || '',
          title: img.getAttribute('title') || ''
        },
        items: []
      }

      hotspotMarkers.forEach((marker, index) => {
        const style = marker.getAttribute('style') || ''
        const leftMatch = style.match(/left:\s*([\d.]+%?)/)
        const topMatch = style.match(/top:\s*([\d.]+%?)/)

        // Look for marker number - can be in various places
        const markerContent = marker.querySelector('[class*="content"]') || marker.querySelector('[class*="marker"]')
        // Look for label/tooltip - can be in various places
        const labelEl = marker.querySelector('[class*="tooltip"] h6') ||
                        marker.querySelector('[class*="tooltip"]') ||
                        marker.querySelector('[class*="label"]')

        // Get href from marker itself, or from preceding links list
        let href = marker.getAttribute('href')
        if (!href || href === '#') {
          // Try to match by index to preceding links
          if (precedingLinks[index]) {
            href = precedingLinks[index].href
          } else {
            href = '#'
          }
        }

        hotspotData.items.push({
          href,
          left: leftMatch ? leftMatch[1] : '0%',
          top: topMatch ? topMatch[1] : '0%',
          marker: markerContent?.textContent?.trim() || '',
          label: labelEl?.textContent?.trim() || ''
        })
      })

      if (hotspotData.image.src && hotspotData.items.length > 0) {
        content.hotspots.push(hotspotData)
        processedHotspotImages.add(hotspotData.image.src)
      }
    }
  })

  // Also check for images that have sibling/nearby hotspot links (different structure)
  const figures = contentEl.querySelectorAll('figure')
  figures.forEach(figure => {
    if (!isElementInSelection(figure)) return

    // Skip if already captured as a hotspot section
    if (figure.closest('[class*="hotspot"]')) return

    const img = figure.querySelector('img')
    const hotspotLinks = figure.querySelectorAll('a[style*="left:"][style*="top:"]')

    if (img && hotspotLinks.length > 0) {
      const hotspotData = {
        image: {
          src: getBestImageSrc(img),
          alt: img.getAttribute('alt') || '',
          title: img.getAttribute('title') || ''
        },
        items: []
      }

      hotspotLinks.forEach(link => {
        const style = link.getAttribute('style') || ''
        const leftMatch = style.match(/left:\s*([\d.]+%?)/)
        const topMatch = style.match(/top:\s*([\d.]+%?)/)

        hotspotData.items.push({
          href: link.getAttribute('href') || '#',
          left: leftMatch ? leftMatch[1] : '0%',
          top: topMatch ? topMatch[1] : '0%',
          marker: '',
          label: link.textContent?.trim() || ''
        })
      })

      if (hotspotData.image.src && hotspotData.items.length > 0) {
        content.hotspots.push(hotspotData)
        processedHotspotImages.add(hotspotData.image.src)
      }
    }
  })

  // Extract author byline elements — split by <br> to handle bare text nodes
  const authorBylineEls = contentEl.querySelectorAll('.article-author')
  const processedAuthorEls = new Set()
  authorBylineEls.forEach(authorEl => {
    if (!doesElementOverlap(authorEl)) return
    processedAuthorEls.add(authorEl)
    // Split innerHTML by <br> to get each line (handles bare text nodes)
    const lines = authorEl.innerHTML.split(/<br\s*\/?>/).map(line => {
      const temp = document.createElement('div')
      temp.innerHTML = line.trim()
      return temp.textContent.trim()
    }).filter(Boolean)
    lines.forEach(line => {
      content.paragraphs.push({ text: line, html: line })
    })
  })

  // Find all relevant elements (excluding those already in hotspots)
  const allElements = contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6, p, img, a, ul, ol, iframe, video, figure, figcaption, blockquote')

  // Check each element to see if its center is within the selection
  allElements.forEach(el => {
    if (!isElementInSelection(el)) return

    // Skip elements that are part of a hotspot section
    if (el.closest('[class*="hotspot"]')) return

    // Skip elements inside an already-processed author byline
    if (el.closest('.article-author') && processedAuthorEls.size > 0) return

    const tagName = el.tagName.toLowerCase()

    // Skip if this element is a child of another element we'll process
    // (avoid duplicates from nested structures)
    if (el.closest('figure') && tagName !== 'figure' && tagName !== 'img' && tagName !== 'figcaption') {
      return
    }

    // Headings
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      const text = el.textContent.trim()
      if (text) {
        content.headings.push({
          level: parseInt(tagName[1]),
          text,
          html: el.innerHTML
        })
      }
    }

    // Paragraphs
    if (tagName === 'p') {
      const text = el.textContent.trim()
      if (text) {
        content.paragraphs.push({
          text,
          html: el.innerHTML
        })
      }
    }

    // Blockquotes
    if (tagName === 'blockquote') {
      const text = el.textContent.trim()
      if (text) {
        content.paragraphs.push({
          text,
          html: `<blockquote>${cleanInlineHtml(el.innerHTML)}</blockquote>`
        })
      }
    }

    // Images - skip if inside a <figure> (the figure handler captures it with its caption)
    if (tagName === 'img' && !el.closest('figure')) {
      const src = getBestImageSrc(el)
      // Skip placeholder/data URI images and images already in hotspots
      if (src && !src.startsWith('data:') && !processedHotspotImages.has(src)) {
        // Look for a caption sibling — an adjacent element with a class ending in "caption"
        const captionSibling = el.nextElementSibling?.className?.match(/caption/i)
          ? el.nextElementSibling
          : el.parentElement?.querySelector('[class$="caption"], [class*="caption"]')
        content.images.push({
          src,
          alt: el.getAttribute('alt') || '',
          caption: captionSibling?.textContent?.trim() || ''
        })
      }
    }

    // Figures - extract image and caption (skip if hotspot)
    if (tagName === 'figure') {
      // Check if this figure has hotspot links
      const hasHotspots = el.querySelectorAll('a[style*="left:"][style*="top:"]').length > 0
      if (hasHotspots) return

      const img = el.querySelector('img')
      const captionEl = el.querySelector('figcaption') || el.querySelector('[class$="caption"], [class*="caption"]')
      if (img) {
        const src = getBestImageSrc(img)
        // Skip images already processed as hotspots
        if (src && !src.startsWith('data:') && !processedHotspotImages.has(src)) {
          content.images.push({
            src,
            alt: img.getAttribute('alt') || '',
            caption: captionEl?.textContent?.trim() || ''
          })
        }
      }
    }

    // Links (standalone, not within other elements we're capturing, not hotspot links)
    if (tagName === 'a' && !el.closest('p') && !el.closest('li')) {
      // Skip hotspot-style positioned links
      const style = el.getAttribute('style') || ''
      if (style.includes('left:') && style.includes('top:')) return

      const href = el.getAttribute('href') || ''
      const text = el.textContent.trim()
      if (href && text) {
        content.links.push({ href, text })
      }
    }

    // Lists
    if (tagName === 'ul' || tagName === 'ol') {
      const items = Array.from(el.querySelectorAll(':scope > li'))
        .map(li => li.innerHTML.trim())
        .filter(html => html)
      if (items.length > 0) {
        content.lists.push({
          type: tagName,
          items,
          html: el.innerHTML
        })
      }
    }

    // Videos/iframes
    if (tagName === 'iframe') {
      const src = el.getAttribute('src') || ''
      if (src) {
        content.videos.push({
          src,
          title: el.getAttribute('title') || ''
        })
      }
    }

    if (tagName === 'video') {
      const src = el.getAttribute('src') || el.querySelector('source')?.getAttribute('src') || ''
      if (src) {
        content.videos.push({
          src,
          title: el.getAttribute('title') || ''
        })
      }
    }
  })

  // Supplemental pass: capture text from non-standard elements (span, div, etc.)
  // that the standard tag-based queries above missed.
  // Intentionally exclude content.links — link text (e.g. author names in <a> tags)
  // should still be captured as paragraph text.
  const alreadyCaptured = new Set()
  content.headings.forEach(h => alreadyCaptured.add(h.text))
  content.paragraphs.forEach(p => alreadyCaptured.add(p.text))

  const extraSelector = 'span, div, small, label, a'
  const extraEls = contentEl.querySelectorAll(extraSelector)
  extraEls.forEach(el => {
    if (!isElementInSelection(el)) return
    if (el.closest('[class*="hotspot"]')) return
    // Skip elements inside an already-processed author byline
    if (el.closest('.article-author') && processedAuthorEls.size > 0) return
    // Skip wrappers that contain block-level children
    if (el.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol, figure, img, iframe, video')) return
    // Skip if this element is a parent of another matched extra element with text
    // (prefer the leaf text, not the wrapper)
    const childExtra = el.querySelector(extraSelector)
    if (childExtra && isElementInSelection(childExtra) && childExtra.textContent.trim() === el.textContent.trim()) return
    const text = el.textContent.trim()
    if (!text) return
    // Skip if already captured as a paragraph or heading
    if (alreadyCaptured.has(text)) return
    // Skip if this text is a substring of already captured text
    let isSubstring = false
    for (const captured of alreadyCaptured) {
      if (captured.includes(text)) { isSubstring = true; break }
    }
    if (isSubstring) return
    alreadyCaptured.add(text)
    content.paragraphs.push({ text, html: el.innerHTML })
  })

  return content
}

/**
 * Generate hotspot HTML
 */
function generateHotspotHtml(hotspot) {
  const linkCount = hotspot.items.length
  let html = `<div class="blog__hotspot blog__hotspot--${linkCount}-link${linkCount !== 1 ? 's' : ''}">
  <figure class="blog__hotspot__inner">
    <img src="${hotspot.image.src}" alt="${hotspot.image.alt || ''}"${hotspot.image.title ? ` title="${hotspot.image.title}"` : ''} class="blog__hotspot__image">`

  hotspot.items.forEach((item, index) => {
    html += `
    <a class="blog__hotspot__item" href="${rewriteBlogUrl(item.href)}" style="left: ${item.left}; top: ${item.top};">
      <span class="blog__hotspot__marker fp-font-weight--bold">${item.marker || index + 1}</span>
      <span class="blog__hotspot__label fp-font-weight--semibold">${item.label}</span>
    </a>`
  })

  html += `
  </figure>
</div>`

  return html
}

/**
 * Generate HTML output from extracted content based on block type
 * Only includes elements that were actually found - no placeholders
 */
export function generateSectionHtml(selection, blockType, blockConfig) {
  const content = selection.extractedContent || {}
  const prefix = blockConfig.prefix

  // Author byline — simple text section
  if (blockType === 'authorByline') {
    const paras = content.paragraphs || []
    let html = `<div class="${prefix}">`
    if (paras[0]) {
      const raw = paras[0].html || paras[0].text
      // Wrap "By:" prefix in a grey span, keep author name black
      const bylineHtml = raw.replace(/^(By:\s*)/i, `<span class="${prefix}__prefix">$1</span>`)
      html += `\n  <p class="${prefix}__text">${bylineHtml}</p>`
    }
    if (paras[1]) {
      html += `\n  <p class="${prefix}__title">${paras[1].html || paras[1].text}</p>`
    }
    html += `\n</div>`
    return html
  }

  // HR is a simple divider
  if (blockType === 'hr') {
    const color = selection.hrColor || '#191c1f'
    return `<hr class="${prefix}" style="border: none; border-top: 1px solid ${color};">`
  }

  // Check if we have meaningful text content
  const hasHeadings = content.headings?.length > 0
  const hasParagraphs = content.paragraphs?.length > 0
  const hasLists = content.lists?.length > 0
  const hasTextContent = hasHeadings || hasParagraphs || hasLists

  // Only generate pure hotspot HTML if hotspot is the ONLY content
  // (no headings, paragraphs, or lists alongside it)
  if (content.hotspots?.length > 0 && !hasTextContent) {
    return processLinks(content.hotspots.map(hotspot => generateHotspotHtml(hotspot)).join('\n\n'))
  }

  // Start building the section
  let html = `<div class="${prefix}">`

  // Add heading only if found — use the first heading and preserve its original tag
  const heading = content.headings?.[0]

  if (heading) {
    const tag = `h${heading.level}`
    const rawHtml = heading.html || ''
    const hasStrong = /<strong[\s>]/i.test(rawHtml) || /<b(?=[\s>])/i.test(rawHtml)
    const weightClass = hasStrong ? 'fp-font-weight--medium' : 'fp-font-weight--semibold'
    // If heading had <strong>, strip strong/b; otherwise preserve inline HTML (em, a, etc.)
    const headingContent = hasStrong
      ? rawHtml.replace(/<strong[^>]*>/gi, '').replace(/<\/strong>/gi, '').replace(/<b(?=[\s>])[^>]*>/gi, '').replace(/<\/b>/gi, '')
      : cleanInlineHtml(rawHtml) || heading.text
    html += `
  <${tag} class="${prefix}__heading ${weightClass}">${headingContent}</${tag}>`
  }

  // Extra headings beyond the first (e.g. h5 subheading after an h4 section header)
  const extraHeadings = content.headings?.slice(1) || []
  const hasExtraHeadings = extraHeadings.length > 0

  // Add body content only if paragraphs, lists, or extra headings were found
  if (hasParagraphs || hasLists || hasExtraHeadings) {
    html += `
  <div class="${prefix}__body">`

    // Add extra headings as subheadings inside the body
    if (hasExtraHeadings) {
      extraHeadings.forEach(h => {
        const subTag = `h${h.level}`
        html += `
    <${subTag}>${cleanInlineHtml(h.html || h.text)}</${subTag}>`
      })
    }

    // Add paragraphs
    if (hasParagraphs) {
      content.paragraphs.forEach(p => {
        html += `
    <p>${cleanInlineHtml(p.html || p.text)}</p>`
      })
    }

    // Add lists
    if (hasLists) {
      content.lists.forEach(list => {
        html += `
    <${list.type}>`
        list.items.forEach(item => {
          html += `
      <li>${cleanInlineHtml(item)}</li>`
        })
        html += `
    </${list.type}>`
      })
    }

    html += `
  </div>`
  }

  // Handle different block types for images/media
  const images = content.images || []
  const hotspots = content.hotspots || []

  const blendStyle = (img) => img.blendDarken ? ' style="mix-blend-mode: darken;"' : ''

  // For fullWidth and oneUp, prefer hotspots if available, otherwise use regular images
  if (blockType === 'fullWidth') {
    if (hotspots.length > 0) {
      // Include hotspot HTML within the section
      hotspots.forEach(hotspot => {
        html += '\n' + generateHotspotHtml(hotspot)
      })
    } else if (images.length > 0) {
      const img = images[0]
      html += `
  <figure class="${prefix}__figure">
    <img class="${prefix}__image" src="${img.src}" alt="${img.alt || ''}"${blendStyle(img)}>
  </figure>`
    }
  }

  if (blockType === 'oneUp') {
    if (hotspots.length > 0) {
      // Include hotspot HTML within the section
      hotspots.forEach(hotspot => {
        html += '\n' + generateHotspotHtml(hotspot)
      })
    } else if (images.length > 0) {
      const img = images[0]
      const captionText = img.caption || ''
      const links = content.links || []
      html += `
  <figure class="${prefix}__figure">
    <img class="${prefix}__image" src="${img.src}" alt="${img.alt || ''}"${blendStyle(img)}>`
      if (captionText) {
        html += `
    <figcaption class="${prefix}__label">${captionText}</figcaption>`
      }
      if (links.length > 0) {
        html += `
    <a class="${prefix}__cta-btn fp-font-weight--semibold" href="${rewriteBlogUrl(links[0].href)}">${links[0].text}</a>`
      }
      html += `
  </figure>`
    }
  }

  if (['twoUp', 'threeUp', 'fourUp', 'fiveUp', 'twoByTwo', 'threeByTwo'].includes(blockType)) {
    const expectedCounts = { twoUp: 2, threeUp: 3, fourUp: 4, fiveUp: 5, twoByTwo: 4, threeByTwo: 6 }
    const expectedCount = expectedCounts[blockType]
    const links = content.links || []

    if (images.length > 0) {
      html += `
  <div class="${prefix}__grid">`

      // Use available images, up to the expected count
      const imagesToUse = images.slice(0, expectedCount)
      // Check if we have individual CTAs for each image
      const hasIndividualCTAs = blockConfig.hasCTA && links.length >= imagesToUse.length

      imagesToUse.forEach((img, i) => {
        const captionText = img.caption || ''
        html += `
    <figure class="${prefix}__item">
      <img class="${prefix}__image" src="${img.src}" alt="${img.alt || ''}"${blendStyle(img)}>`
        if (captionText) {
          html += `
      <figcaption class="${prefix}__label">${captionText}</figcaption>`
        }
        // Add individual CTA if we have one for each image
        if (hasIndividualCTAs && links[i]) {
          html += `
      <a class="${prefix}__cta-btn fp-font-weight--semibold" href="${rewriteBlogUrl(links[i].href)}">${links[i].text}</a>`
        }
        html += `
    </figure>`
      })

      html += `
  </div>`
    }

    // Add single shared CTA if block supports it and we have exactly 1 link
    if (blockConfig.hasCTA && links.length === 1) {
      const ctaLink = links[0]
      html += `
  <div class="${prefix}__cta">
    <a class="${prefix}__cta-btn fp-font-weight--semibold" href="${rewriteBlogUrl(ctaLink.href)}">${ctaLink.text}</a>
  </div>`
    }
  }

  if (blockType === 'video') {
    const videos = content.videos || []
    if (videos.length > 0) {
      const video = videos[0]
      html += `
  <div class="${prefix}__wrapper">
    <iframe
      class="${prefix}__iframe"
      src="${video.src}"
      title="${video.title || ''}"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
  </div>`
    }
  }

  // Rich text - include hotspots if present
  if (blockType === 'richText' && hotspots.length > 0) {
    hotspots.forEach(hotspot => {
      html += '\n' + generateHotspotHtml(hotspot)
    })
  }

  html += `
</div>`

  return processLinks(html)
}
