import { getBestImageSrc } from './extractContent'

/**
 * Scan the entry-content container to determine whether the article
 * primarily uses h3s or h4s as its main section headings.
 * Returns 'h3' or 'h4'.
 */
function detectArticleHeadingStyle(contentEl) {
  const allHeadings = contentEl.querySelectorAll('h2, h3, h4, h5, h6')
  let h3Count = 0
  let h4Count = 0
  allHeadings.forEach(h => {
    const tag = h.tagName.toLowerCase()
    if (tag === 'h3') h3Count++
    if (tag === 'h4') h4Count++
  })
  // If the article has more h3s (or equal), it's an h3 article; otherwise h4
  return h3Count >= h4Count ? 'h3' : 'h4'
}

/**
 * Remap a heading tag for the auto migrator.
 *
 * The first heading in the first WPBakery row → always a bolded paragraph.
 * After that, remapping depends on the article's heading style:
 *
 * h3 article: h3→h2 (section boundary), h4→h3, h5→h4
 * h4 article: h4→h2 (section boundary), h5→h4  (no h3s in output)
 *
 * Returns { tag, isBoundary, asBoldParagraph }.
 */
function remapHeading(tag, headingCtx) {
  const level = parseInt(tag[1])

  // First heading in the article → bold paragraph
  if (!headingCtx.firstHeadingSeen) {
    headingCtx.firstHeadingSeen = true
    return { tag: null, isBoundary: false, asBoldParagraph: true }
  }

  const style = headingCtx.articleStyle // 'h3' or 'h4'

  if (style === 'h3') {
    // h3 article: h3→h2 (boundary), h4→h3, h5→h4
    if (level === 2) return { tag: 'h2', isBoundary: true, asBoldParagraph: false }
    if (level === 3) return { tag: 'h2', isBoundary: true, asBoldParagraph: false }
    if (level === 4) return { tag: 'h3', isBoundary: false, asBoldParagraph: false }
    if (level === 5) return { tag: 'h4', isBoundary: false, asBoldParagraph: false }
  } else {
    // h4 article: h4→h2 (boundary), h5→h4, no h3s in output
    if (level === 2) return { tag: 'h2', isBoundary: true, asBoldParagraph: false }
    if (level === 3) return { tag: 'h3', isBoundary: false, asBoldParagraph: false }
    if (level === 4) return { tag: 'h2', isBoundary: true, asBoldParagraph: false }
    if (level === 5) return { tag: 'h4', isBoundary: false, asBoldParagraph: false }
  }

  // Fallback for h6 or anything else
  return { tag, isBoundary: false, asBoldParagraph: false }
}

/**
 * Detect and classify sections from a WordPress .entry-content container.
 * Returns an array of section objects compatible with generateSectionHtml.
 *
 * headingCtx is an optional shared context object that tracks heading state
 * across recursive calls (e.g. WPBakery text-column unwrapping).
 */
export function detectSections(contentEl, headingCtx) {
  if (!contentEl) return []

  // On the initial (non-recursive) call, create heading context
  if (!headingCtx) {
    headingCtx = {
      firstHeadingSeen: false,
      articleStyle: detectArticleHeadingStyle(contentEl),
    }
  }

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
      const result = remapHeading(tag, headingCtx)
      if (result.asBoldParagraph) {
        // Convert to bold paragraph instead of heading
        const text = el.textContent.trim()
        if (text) {
          current.paragraphs.push({
            text,
            html: `<p><strong>${el.innerHTML}</strong></p>`,
          })
        }
        continue
      }
      emitSection()
      const level = parseInt(result.tag[1])
      current.headings.push({
        level,
        text: el.textContent.trim(),
        html: el.innerHTML,
      })
      current._isSectionBoundary = result.isBoundary
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
            const innerSections = detectSections(wrapperEl, headingCtx)
            // If recursion produced a single link-only section, attach to previous section
            if (innerSections.length === 1 && sections.length > 0 && isLinkOnlySection(innerSections[0])) {
              const lastSection = sections[sections.length - 1]
              lastSection.extractedContent.links.push(...innerSections[0].extractedContent.links)
              lastSection.blockType = determineBlockType(lastSection.extractedContent, lastSection._columnHint || 0)
            } else {
              innerSections.forEach(s => { s.id = `section-${++sectionCounter}` })
              sections.push(...innerSections)
            }
            continue
          }
        }

        // Check for hotspot container before processing normally
        const rowHotspots = extractHotspotsFromRow(el)
        if (rowHotspots.length > 0) {
          associateNeighborLinks(rowHotspots, children, i, sections)
          emitSection()
          const hotspotContent = createEmptyContent()
          hotspotContent.hotspots = rowHotspots
          sections.push({
            id: `section-${++sectionCounter}`,
            blockType: 'fullWidth',
            extractedContent: hotspotContent,
          })
          continue
        }

        const rowResult = processWpbRow(el, headingCtx)
        if (rowResult) {
          // If this row only has headings or body text, merge into accumulator
          if (rowResult.images.length === 0 && rowResult.links.length === 0 && rowResult.videos.length === 0) {
            if (rowResult.headings.length > 0) {
              emitSection()
              current.headings.push(...rowResult.headings)
              if (rowResult.headings[0]._isSectionBoundary) {
                current._isSectionBoundary = true
              }
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
            if (rowResult.headings[0]?._isSectionBoundary) {
              current._isSectionBoundary = true
            }
            emitSection()
          }
        }
        continue
      }

      // Gallery block
      if (className.includes('wp-block-gallery') || className.includes('gallery')) {
        const imgs = extractImagesFromElement(el)
        if (imgs.length === 1) {
          // Single-image gallery: treat as individual image, keep with current section
          handleImageBoundary(imgs[0])
        } else if (imgs.length > 1) {
          // Only emit first if current section already has images
          if (current.images.length > 0) {
            emitSection()
          }
          current.images.push(...imgs)
          // Extract gallery column hint (gallery-columns-N)
          const colMatch = className.match(/gallery-columns-(\d+)/)
          if (colMatch) {
            current.columnHint = parseInt(colMatch[1])
          }
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

      // Video wrapper (Gutenberg blocks, Plyr player, embed-youtube, etc.)
      if (className.includes('wp-block-video') || className.includes('wp-block-embed') ||
          className.includes('plyr') || className.includes('embed-youtube') ||
          className.includes('video-container') || className.includes('video-wrapper')) {
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

      // WPBakery text column — recurse into inner wrapper for proper section detection
      if (className.includes('wpb_text_column')) {
        const innerWrapper = el.querySelector(':scope > .wpb_wrapper')
        if (innerWrapper) {
          emitSection()
          const innerSections = detectSections(innerWrapper, headingCtx)
          innerSections.forEach(s => { s.id = `section-${++sectionCounter}` })
          sections.push(...innerSections)
          continue
        }
      }

      // Generic div: check for embedded video (iframe/video) before generic extraction
      const embeddedVideo = el.querySelector('iframe, video')
      if (embeddedVideo) {
        const vSrc = embeddedVideo.getAttribute('src') || embeddedVideo.querySelector('source')?.getAttribute('src') || ''
        if (vSrc && (vSrc.includes('youtube') || vSrc.includes('vimeo') || vSrc.includes('wistia') || embeddedVideo.tagName === 'VIDEO')) {
          emitSection()
          const videoContent = createEmptyContent()
          videoContent.videos.push({ src: vSrc, title: embeddedVideo.getAttribute('title') || '' })
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
      const headingResult = extractHeadingsFromElement(el, headingCtx)
      const innerHeadings = headingResult.headings
      const boldParas = headingResult.boldParagraphs

      if (innerHeadings.length > 0) {
        emitSection()
        current.headings.push(...innerHeadings)
        if (innerHeadings[0]._isSectionBoundary) {
          current._isSectionBoundary = true
        }
      }
      if (boldParas.length > 0) {
        current.paragraphs.push(...boldParas)
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
      hotspots: current.hotspots || [],
    }

    const blockType = determineBlockType(content, current.columnHint)

    const section = {
      id: `section-${++sectionCounter}`,
      blockType,
      extractedContent: content,
      _columnHint: current.columnHint,
    }

    if (current._isSectionBoundary) {
      section._isSectionBoundary = true
    }

    sections.push(section)

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
function processWpbRow(rowEl, headingCtx) {
  const images = extractImagesFromElement(rowEl)
  const paragraphs = extractParagraphsFromElement(rowEl)
  const headingResult = extractHeadingsFromElement(rowEl, headingCtx)
  const headings = headingResult.headings
  // Merge bold paragraphs from heading conversions
  paragraphs.push(...headingResult.boldParagraphs)
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

  // WPBakery fractional: medium-1/N (e.g. medium-1/5)
  const fracMatch = cls.match(/medium-(\d+)\/(\d+)/)
  if (fracMatch) return parseInt(fracMatch[2])

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
    hotspots: [],
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

function isLinkOnlySection(section) {
  const c = section.extractedContent
  return (
    c.links?.length > 0 &&
    c.images?.length === 0 &&
    c.headings?.length === 0 &&
    c.paragraphs?.length === 0 &&
    c.lists?.length === 0 &&
    c.videos?.length === 0
  )
}

function hasContent(acc) {
  return (
    acc.headings.length > 0 ||
    acc.paragraphs.length > 0 ||
    acc.images.length > 0 ||
    acc.links.length > 0 ||
    acc.lists.length > 0 ||
    acc.videos.length > 0 ||
    acc.hotspots?.length > 0
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
    if (columnHint === 4 && imageCount === 4) return 'fourUp'
    if (columnHint === 5 && imageCount === 5) return 'fiveUp'
  }

  // Single image: use layout and attachment class to distinguish full-width vs one-up
  if (imageCount === 1) {
    // Multi-column row with text + image → always oneUp regardless of attachment class
    if (columnHint >= 2 && (hasHeading || hasBody)) return 'oneUp'

    const imgClass = content.images[0]?.className || ''
    if (imgClass.includes('attachment-full')) return 'fullWidth'
    if (imgClass.includes('attachment-medium')) return 'oneUp'
    // Fallback: no attachment class — use content heuristic
    if (!hasLinks && !hasHeading && !hasBody) return 'fullWidth'
    return 'oneUp'
  }
  if (imageCount === 2) return 'twoUp'
  if (imageCount === 3) return 'threeUp'
  if (imageCount === 4) return 'fourUp'
  if (imageCount === 5) return 'fiveUp'
  if (imageCount >= 6) return 'threeByTwo'

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
      const singleImageWrapper = img.closest('.wpb_single_image')
      images.push({
        src,
        alt: img.getAttribute('alt') || '',
        caption: captionEl?.textContent?.trim() || '',
        className: img.className || '',
        blendDarken: !!singleImageWrapper,
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

/**
 * Extract headings from an element, applying heading remapping if headingCtx is provided.
 * Returns { headings, boldParagraphs } when headingCtx is given, otherwise just headings array.
 */
function extractHeadingsFromElement(container, headingCtx) {
  const headings = []
  const boldParagraphs = []
  container.querySelectorAll('h2, h3, h4, h5, h6').forEach(h => {
    const text = h.textContent.trim()
    if (text) {
      const tag = h.tagName.toLowerCase()
      if (headingCtx) {
        const result = remapHeading(tag, headingCtx)
        if (result.asBoldParagraph) {
          boldParagraphs.push({ text, html: `<p><strong>${h.innerHTML}</strong></p>` })
          return
        }
        const level = parseInt(result.tag[1])
        headings.push({ level, text, html: h.innerHTML, _isSectionBoundary: result.isBoundary })
      } else {
        const origLevel = parseInt(tag[1])
        const level = (origLevel === 3 || origLevel === 4) ? 2 : origLevel
        headings.push({ level, text, html: h.innerHTML })
      }
    }
  })
  if (headingCtx) return { headings, boldParagraphs }
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

/**
 * Extract hotspot data from a WPBakery row element.
 * Looks for `thb-hotspot-container` (or generic `hotspot-container`) divs
 * and extracts the image + positioned marker overlays.
 * Returns an array of hotspot data objects matching the shape expected
 * by generateHotspotHtml: { image: { src, alt, title }, items: [{ href, left, top, marker, label }] }
 */
function extractHotspotsFromRow(rowEl) {
  const containers = rowEl.querySelectorAll('[class*="hotspot-container"]')
  if (containers.length === 0) return []

  const hotspots = []

  containers.forEach(container => {
    const img = container.querySelector('img')
    if (!img) return
    const src = getBestImageSrc(img)
    if (!src || src.startsWith('data:')) return

    // Find hotspot markers: div elements with left:/top: position styles
    // and className matching thb-hotspot (but NOT child classes like thb-hotspot-content)
    const markers = Array.from(container.querySelectorAll('div')).filter(el => {
      const style = el.getAttribute('style') || ''
      const className = el.className || ''
      const hasPosition = /left:/.test(style) && /top:/.test(style)
      const isHotspotMarker = (className.includes('thb-hotspot') && !className.includes('thb-hotspot-')) ||
                              className.includes('hotspot__item')
      return hasPosition && isHotspotMarker
    })

    if (markers.length === 0) return

    const hotspotData = {
      image: {
        src,
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || '',
      },
      items: [],
    }

    markers.forEach((marker, index) => {
      const style = marker.getAttribute('style') || ''
      const leftMatch = style.match(/left:\s*([\d.]+%?)/)
      const topMatch = style.match(/top:\s*([\d.]+%?)/)

      const markerContent = marker.querySelector('[class*="content"]') || marker.querySelector('[class*="marker"]')
      const labelEl = marker.querySelector('[class*="tooltip"] h6') ||
                      marker.querySelector('[class*="tooltip"]') ||
                      marker.querySelector('[class*="label"]')

      hotspotData.items.push({
        href: '#',
        left: leftMatch ? leftMatch[1] : '0%',
        top: topMatch ? topMatch[1] : '0%',
        marker: markerContent?.textContent?.trim() || String(index + 1),
        label: labelEl?.textContent?.trim() || '',
      })
    })

    if (hotspotData.items.length > 0) {
      hotspots.push(hotspotData)
    }
  })

  return hotspots
}

/**
 * Associate links from a neighboring <ol> list with hotspot items.
 * Searches backward then forward through sibling elements (up to 5 in each direction).
 * If the <ol> was in a preceding row that already produced a section, removes that section.
 */
function associateNeighborLinks(hotspots, children, currentIndex, sections) {
  let olEl = null
  let olSiblingIndex = -1

  // Search backward first
  for (let j = currentIndex - 1; j >= Math.max(0, currentIndex - 5); j--) {
    const ol = children[j].querySelector('ol')
    if (ol) {
      olEl = ol
      olSiblingIndex = j
      break
    }
  }

  // If not found backward, search forward
  if (!olEl) {
    for (let j = currentIndex + 1; j <= Math.min(children.length - 1, currentIndex + 5); j++) {
      const ol = children[j].querySelector('ol')
      if (ol) {
        olEl = ol
        olSiblingIndex = j
        break
      }
    }
  }

  if (!olEl) return

  // Extract links from <ol> list items
  const olLinks = Array.from(olEl.querySelectorAll('li')).map(li => {
    const a = li.querySelector('a')
    return {
      href: a?.getAttribute('href') || '#',
      text: a?.textContent?.trim() || li.textContent?.trim() || '',
    }
  })

  // Associate links with hotspot items by index across all hotspots
  let linkIndex = 0
  hotspots.forEach(hotspot => {
    hotspot.items.forEach(item => {
      if (olLinks[linkIndex]) {
        item.href = olLinks[linkIndex].href
        if (!item.label) {
          item.label = olLinks[linkIndex].text
        }
        linkIndex++
      }
    })
  })

  // If the <ol> was in a preceding row that already produced a section, remove it.
  // Check if the last section is a list-only richText section from that <ol>.
  if (olSiblingIndex < currentIndex && sections.length > 0) {
    const lastSection = sections[sections.length - 1]
    if (lastSection.blockType === 'richText' &&
        lastSection.extractedContent.lists?.length > 0 &&
        lastSection.extractedContent.headings?.length === 0 &&
        lastSection.extractedContent.images?.length === 0 &&
        lastSection.extractedContent.paragraphs?.length === 0) {
      sections.pop()
    }
  }
}
