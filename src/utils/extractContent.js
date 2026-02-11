/**
 * Get the highest-resolution image URL from an <img> element.
 * Checks srcset, data-src/data-lazy-src (lazy loading), and falls back to src.
 */
function getBestImageSrc(img) {
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

  // First, check for hotspot sections
  const hotspotSections = containerEl.querySelectorAll('[class*="hotspot"]')
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
  const figures = containerEl.querySelectorAll('figure')
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

  // Find all relevant elements (excluding those already in hotspots)
  const allElements = containerEl.querySelectorAll('h1, h2, h3, h4, h5, h6, p, img, a, ul, ol, iframe, video, figure, figcaption, blockquote')

  // Check each element to see if its center is within the selection
  allElements.forEach(el => {
    if (!isElementInSelection(el)) return

    // Skip elements that are part of a hotspot section
    if (el.closest('[class*="hotspot"]')) return

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
          html: `<blockquote>${el.innerHTML}</blockquote>`
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
        .map(li => li.textContent.trim())
        .filter(text => text)
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

  return content
}

/**
 * Generate hotspot HTML
 */
function generateHotspotHtml(hotspot) {
  const linkCount = hotspot.items.length
  let html = `<section class="blog__hotspot blog__hotspot--${linkCount}-link${linkCount !== 1 ? 's' : ''}">
  <figure class="blog__hotspot__inner">
    <img src="${hotspot.image.src}" alt="${hotspot.image.alt || ''}"${hotspot.image.title ? ` title="${hotspot.image.title}"` : ''} class="blog__hotspot__image">`

  hotspot.items.forEach((item, index) => {
    html += `
    <a class="blog__hotspot__item" href="${item.href}" style="left: ${item.left}; top: ${item.top};">
      <span class="blog__hotspot__marker">${item.marker || index + 1}</span>
      <span class="blog__hotspot__label">${item.label}</span>
    </a>`
  })

  html += `
  </figure>
</section>`

  return html
}

/**
 * Generate HTML output from extracted content based on block type
 * Only includes elements that were actually found - no placeholders
 */
export function generateSectionHtml(selection, blockType, blockConfig) {
  const content = selection.extractedContent || {}
  const prefix = blockConfig.prefix

  // Check if we have meaningful text content
  const hasHeadings = content.headings?.length > 0
  const hasParagraphs = content.paragraphs?.length > 0
  const hasLists = content.lists?.length > 0
  const hasTextContent = hasHeadings || hasParagraphs || hasLists

  // Only generate pure hotspot HTML if hotspot is the ONLY content
  // (no headings, paragraphs, or lists alongside it)
  if (content.hotspots?.length > 0 && !hasTextContent) {
    return content.hotspots.map(hotspot => generateHotspotHtml(hotspot)).join('\n\n')
  }

  // Start building the section
  let html = `<section class="${prefix}">`

  // Add heading only if found (prefer h2, then h1, then any heading)
  const heading = content.headings?.find(h => h.level === 2)
    || content.headings?.find(h => h.level === 1)
    || content.headings?.[0]

  if (heading) {
    html += `
  <h2 class="${prefix}__heading">${heading.text}</h2>`
  }

  // Add body content only if paragraphs or lists were found
  if (hasParagraphs || hasLists) {
    html += `
  <div class="${prefix}__body">`

    // Add paragraphs
    if (hasParagraphs) {
      content.paragraphs.forEach(p => {
        html += `
    <p>${p.html || p.text}</p>`
      })
    }

    // Add lists
    if (hasLists) {
      content.lists.forEach(list => {
        html += `
    <${list.type}>`
        list.items.forEach(item => {
          html += `
      <li>${item}</li>`
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
    <img class="${prefix}__image" src="${img.src}" alt="${img.alt || ''}">
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
      html += `
  <figure class="${prefix}__figure">
    <img class="${prefix}__image" src="${img.src}" alt="${img.alt || ''}">`
      if (captionText) {
        html += `
    <figcaption class="${prefix}__label">${captionText}</figcaption>`
      }
      html += `
  </figure>`
    }
  }

  if (['twoUp', 'threeUp', 'twoByTwo', 'threeByTwo'].includes(blockType)) {
    const expectedCounts = { twoUp: 2, threeUp: 3, twoByTwo: 4, threeByTwo: 6 }
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
      <img class="${prefix}__image" src="${img.src}" alt="${img.alt || ''}">`
        if (captionText) {
          html += `
      <figcaption class="${prefix}__label">${captionText}</figcaption>`
        }
        // Add individual CTA if we have one for each image
        if (hasIndividualCTAs && links[i]) {
          html += `
      <a class="${prefix}__cta-btn" href="${links[i].href}">${links[i].text}</a>`
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
    <a class="${prefix}__cta-btn" href="${ctaLink.href}">${ctaLink.text}</a>
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
</section>`

  return html
}
