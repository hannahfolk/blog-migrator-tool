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
    rawHtml: ''
  }

  // Get container's position for offset calculations
  const containerBounds = containerEl.getBoundingClientRect()

  // Selection bounds in document/scroll coordinates
  const selTop = selectionRect.y
  const selBottom = selectionRect.y + selectionRect.height
  const selLeft = selectionRect.x
  const selRight = selectionRect.x + selectionRect.width

  // Find all relevant elements
  const allElements = containerEl.querySelectorAll('h1, h2, h3, h4, h5, h6, p, img, a, ul, ol, iframe, video, figure, figcaption, blockquote')

  // Check each element to see if its center is within the selection
  allElements.forEach(el => {
    const elRect = el.getBoundingClientRect()

    // Convert element bounds to container-relative coordinates (accounting for scroll)
    const elTop = elRect.top - containerBounds.top + containerEl.scrollTop
    const elBottom = elRect.bottom - containerBounds.top + containerEl.scrollTop
    const elLeft = elRect.left - containerBounds.left + containerEl.scrollLeft
    const elRight = elRect.right - containerBounds.left + containerEl.scrollLeft

    // Check if element's center point is within selection bounds
    const elCenterY = (elTop + elBottom) / 2
    const elCenterX = (elLeft + elRight) / 2

    const isWithinSelection = (
      elCenterY >= selTop &&
      elCenterY <= selBottom &&
      elCenterX >= selLeft &&
      elCenterX <= selRight
    )

    if (!isWithinSelection) return

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

    // Images (including those in figures)
    if (tagName === 'img') {
      const src = el.getAttribute('src') || ''
      // Skip placeholder/data URI images
      if (src && !src.startsWith('data:')) {
        content.images.push({
          src,
          alt: el.getAttribute('alt') || ''
        })
      }
    }

    // Figures - extract image and caption
    if (tagName === 'figure') {
      const img = el.querySelector('img')
      const caption = el.querySelector('figcaption')
      if (img) {
        const src = img.getAttribute('src') || ''
        if (src && !src.startsWith('data:')) {
          content.images.push({
            src,
            alt: img.getAttribute('alt') || caption?.textContent?.trim() || ''
          })
        }
      }
    }

    // Links (standalone, not within other elements we're capturing)
    if (tagName === 'a' && !el.closest('p') && !el.closest('li')) {
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
 * Generate HTML output from extracted content based on block type
 * Only includes elements that were actually found - no placeholders
 */
export function generateSectionHtml(selection, blockType, blockConfig) {
  const content = selection.extractedContent || {}
  const prefix = blockConfig.prefix

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
  const hasParagraphs = content.paragraphs?.length > 0
  const hasLists = content.lists?.length > 0

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

  if (blockType === 'fullWidth') {
    if (images.length > 0) {
      const img = images[0]
      html += `
  <figure class="${prefix}__figure">
    <img class="${prefix}__image" src="${img.src}" alt="${img.alt || ''}">
  </figure>`
    }
  }

  if (blockType === 'oneUp') {
    if (images.length > 0) {
      const img = images[0]
      html += `
  <figure class="${prefix}__figure">
    <img class="${prefix}__image" src="${img.src}" alt="${img.alt || ''}">`
      if (img.alt) {
        html += `
    <figcaption class="${prefix}__label">${img.alt}</figcaption>`
      }
      html += `
  </figure>`
    }
  }

  if (['twoUp', 'threeUp', 'threeByTwo'].includes(blockType)) {
    const expectedCount = blockType === 'twoUp' ? 2 : blockType === 'threeUp' ? 3 : 6

    if (images.length > 0) {
      html += `
  <div class="${prefix}__grid">`

      // Use available images, up to the expected count
      const imagesToUse = images.slice(0, expectedCount)
      imagesToUse.forEach((img, i) => {
        html += `
    <figure class="${prefix}__item">
      <img class="${prefix}__image" src="${img.src}" alt="${img.alt || ''}">`
        if (img.alt) {
          html += `
      <figcaption class="${prefix}__label">${img.alt}</figcaption>`
        }
        html += `
    </figure>`
      })

      html += `
  </div>`
    }

    // Add CTA if block supports it and we found a link
    if (blockConfig.hasCTA && content.links?.length > 0) {
      const ctaLink = content.links[0]
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

  // Rich text doesn't need any additional elements beyond heading and body

  html += `
</section>`

  return html
}
