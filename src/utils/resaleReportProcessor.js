import { getBestImageSrc } from './extractContent'
import { slugify } from './slugify'

/**
 * Detect whether a URL is a resale report page.
 * Resale reports live at paths containing "resale-report".
 */
export function isResaleReportUrl(url) {
  if (!url) return false
  try {
    const path = new URL(url).pathname.toLowerCase()
    return /resale-report/i.test(path)
  } catch {
    return /resale-report/i.test(String(url).toLowerCase())
  }
}

/**
 * Detect whether a parsed document is a resale-report style page.
 * These pages don't have .entry-content; instead they use a
 * .page.type-page.hentry wrapper with WPBakery rows directly inside.
 */
export function isResaleReportDocument(doc) {
  return !!doc.querySelector('.page.type-page.hentry')
}

/**
 * Build a map of `vc_custom_XXXX` class names → inline style declaration.
 * WPBakery emits these as <style> rules in the head.
 * Returns { 'vc_custom_123': { backgroundImage: 'url(...)', ... }, ... }
 */
function collectVcCustomStyles(doc) {
  const map = {}
  const styleEls = doc.querySelectorAll('style')
  const ruleRe = /\.(vc_custom_\d+)\s*\{([^}]*)\}/g
  styleEls.forEach(el => {
    const css = el.textContent || ''
    let m
    while ((m = ruleRe.exec(css)) !== null) {
      const key = m[1]
      const body = m[2]
      const props = {}
      body.split(';').forEach(decl => {
        const colon = decl.indexOf(':')
        if (colon === -1) return
        const prop = decl.slice(0, colon).trim()
        const value = decl.slice(colon + 1).replace(/!important/i, '').trim()
        if (prop && value) props[prop] = value
      })
      map[key] = props
    }
  })
  return map
}

/**
 * Extract the first vc_custom_* class from an element and look up its style.
 */
function getVcCustomStyle(el, vcStyles) {
  const cls = el.className || ''
  const matches = cls.match(/vc_custom_\d+/g) || []
  for (const key of matches) {
    if (vcStyles[key]) return vcStyles[key]
  }
  return null
}

/**
 * Find the URL inside `url(...)` from a CSS value.
 */
function urlFromCssValue(value) {
  if (!value) return ''
  const m = value.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i)
  return m ? m[1] : ''
}

/**
 * Walk every direct child wpb_row of a wrapper, also handling rows
 * nested inside a single wrapper column (.medium-12 with vc_inner rows).
 * Returns a flat list of "logical" rows that we can classify.
 *
 * Hero rows (with .rr-heading) are kept as-is so we can pull the
 * background-image from the outermost vc_custom class.
 */
function flattenRows(wrapper) {
  const rows = []
  // Iterate ALL direct children of the wrapper so we can surface non-wpb_row
  // siblings that still contain meaningful content. WPBakery sometimes emits
  // raw-code blocks (sliders, hotspots) as direct children of the page wrapper,
  // not wrapped in a wpb_row of their own.
  const children = Array.from(wrapper.children)

  for (const child of children) {
    const cls = child.className || ''
    const isRow = cls.includes('wpb_row')

    if (!isRow) {
      // Surface as a row if it contains a recognizable standalone content block.
      const hasSlider = !!child.querySelector?.('.slider-container, .slider')
      const hasHotspot = !!child.querySelector?.('[class*="hotspot-container"]')
      if (hasSlider || hasHotspot) {
        rows.push({ row: child, parent: null })
      }
      continue
    }

    if (child.querySelector('.rr-heading')) {
      rows.push({ row: child, parent: null })
      continue
    }
    const rowChildren = Array.from(child.children)
    const onlyColumn = rowChildren.length === 1 && rowChildren[0].classList?.contains('medium-12')
    const innerWrapper = onlyColumn ? rowChildren[0].querySelector(':scope > .vc_column-inner > .wpb_wrapper') : null
    const innerRows = innerWrapper
      ? Array.from(innerWrapper.children).filter(c => (c.className || '').includes('wpb_row'))
      : []
    const innerSliders = innerWrapper
      ? Array.from(innerWrapper.children).filter(c => !((c.className || '').includes('wpb_row')) && c.querySelector?.('.slider-container, .slider, [class*="hotspot-container"]'))
      : []

    if (innerRows.length > 0) {
      // Walk innerWrapper children in order so sliders/hotspots between rows
      // are emitted at the correct position.
      if (innerWrapper) {
        for (const el of Array.from(innerWrapper.children)) {
          const elCls = el.className || ''
          if (elCls.includes('wpb_row')) {
            rows.push({ row: el, parent: child })
          } else if (el.querySelector?.('.slider-container, .slider, [class*="hotspot-container"]')) {
            rows.push({ row: el, parent: child })
          }
        }
      }
    } else if (innerSliders.length > 0) {
      // Single-column wrapper that contains sliders/hotspots without nested rows.
      innerSliders.forEach(el => rows.push({ row: el, parent: child }))
    } else {
      rows.push({ row: child, parent: null })
    }
  }
  return rows
}

/**
 * Skip a row if it's purely structural / empty.
 */
function isEmptyRow(row) {
  const text = (row.textContent || '').trim()
  const hasMedia = !!row.querySelector('img, iframe, video, .slider-container, .thb-hotspot-container')
  return !text && !hasMedia
}

/**
 * Drop the mobile-duplicate hero row.
 * The page emits two heroes (#hero-d desktop + #hero-m mobile);
 * we only want one. Same-titled heroes are also deduped.
 */
function isHeroDuplicate(row, sections) {
  if (!row.querySelector('.rr-heading')) return false
  return sections.some(s => s.blockType === 'resaleHero')
}

/**
 * Pull the title text from a row's first heading.
 */
function firstHeadingText(row) {
  const h = row.querySelector('h1, h2, h3, h4, h5, h6')
  return h?.textContent?.trim() || ''
}

/**
 * The origin of the page currently being processed (e.g. https://blog.fashionphile.com).
 * Set at the top of processResaleReport so the URL-resolving helpers can read it.
 */
let pageOrigin = ''

/**
 * Resolve a URL against the current page origin.
 * - Absolute http(s) URLs are left alone.
 * - Protocol-relative URLs (//host/path) get https: prepended.
 * - Site-absolute paths (/wp-content/...) get the page origin prepended.
 * Without this, relative WP image URLs break when the HTML is pasted into Shopify.
 */
function absolutize(url) {
  if (!url) return url
  if (/^(data:|https?:|mailto:|tel:)/i.test(url)) return url
  if (url.startsWith('//')) return 'https:' + url
  if (url.startsWith('/')) return pageOrigin ? pageOrigin + url : url
  return url
}

/**
 * Resolve the best image src for an <img>, falling back to plain src,
 * and absolutize the result against the page origin.
 */
function imgSrc(img) {
  return absolutize(getBestImageSrc(img) || img.getAttribute('src') || '')
}

/**
 * Convert raw inline HTML (from a <p> element etc.) into clean output:
 * - rewrite blog.fashionphile.com → /blogs/academy on hrefs
 * - absolutize relative src= attributes (img/iframe) so embedded media works in Shopify
 * - strip tracking attributes
 */
function cleanInline(html) {
  if (!html) return ''
  let out = html
  out = out.replace(/href="https?:\/\/blog\.fashionphile\.com\/?([^"]*)"/gi, (_, path) => {
    const trimmed = path.replace(/^\/|\/$/g, '')
    return trimmed ? `href="/blogs/academy/${trimmed}"` : 'href="/blogs/academy"'
  })
  // Absolutize relative src= URLs (root-relative or protocol-relative)
  out = out.replace(/\bsrc="(\/[^/"][^"]*|\/\/[^"]+)"/gi, (_, src) => `src="${absolutize(src)}"`)
  out = out.replace(/\s+rel="[^"]*"/gi, '')
  out = out.replace(/\s+target="_self"/gi, '')
  return out.trim()
}

function escapeAttr(s) {
  return String(s || '').replace(/"/g, '&quot;')
}

// ===================================================================
// Row classifiers — each returns a section descriptor or null.
// ===================================================================

/**
 * Hero: row with id="hero-d" (or hero-m) containing an h1 inside an h5.rr-heading + h1.
 * Background image comes from the row's vc_custom class.
 */
function classifyHero(row, vcStyles) {
  const eyebrow = row.querySelector('.rr-heading')?.textContent?.trim() || ''
  const title = row.querySelector('h1')?.textContent?.trim() || ''
  if (!eyebrow && !title) return null

  // Walk up the DOM to find the first vc_custom class with a background image.
  let bgImage = ''
  let cur = row
  while (cur && !bgImage) {
    const style = getVcCustomStyle(cur, vcStyles)
    if (style) {
      bgImage = urlFromCssValue(style['background-image'] || style['background'])
    }
    cur = cur.parentElement
  }

  return {
    blockType: 'resaleHero',
    extractedContent: { eyebrow, title, bgImage },
  }
}

/**
 * Author byline w/ circular avatar.
 * Detected by an <img> whose inline style contains `border-radius: 50%`.
 * Extracts:
 *   - body: any paragraphs that appear BEFORE the avatar paragraph
 *   - image: the circular img src/alt
 *   - authorName: text content of paragraphs AFTER the avatar paragraph
 */
function classifyAuthor(row) {
  const allImgs = Array.from(row.querySelectorAll('img'))
  const circularImg = allImgs.find(img => /border-radius:\s*50%/i.test(img.getAttribute('style') || ''))
  if (!circularImg) return null

  // The circular image lives inside a <p>; find that wrapper so we can
  // separate "before" (intro) and "after" (name + title) paragraphs.
  const avatarP = circularImg.closest('p') || circularImg.parentElement
  const allPs = Array.from(row.querySelectorAll('p'))
  const avatarIdx = allPs.indexOf(avatarP)

  const introPs = avatarIdx > 0 ? allPs.slice(0, avatarIdx) : []
  const afterPs = avatarIdx >= 0 ? allPs.slice(avatarIdx + 1) : []

  const bodyHtml = introPs
    .map(p => p.innerHTML.trim())
    .filter(Boolean)
    .map(html => `<p>${cleanInline(html)}</p>`)
    .join('\n')

  const afterTexts = afterPs.map(p => p.textContent.trim()).filter(Boolean)
  const authorName = afterTexts[0] || ''
  const authorTitle = afterTexts.slice(1).join(' ').trim()

  return {
    blockType: 'resaleAuthor',
    extractedContent: {
      bodyHtml,
      image: { src: imgSrc(circularImg), alt: circularImg.getAttribute('alt') || '' },
      authorName,
      authorTitle,
    },
  }
}

/**
 * Slider: row that contains a `.slider-container > .slider > .slides > .slide` structure.
 */
function classifySlider(row) {
  const sliderEl = row.querySelector('.slider-container, .slider')
  if (!sliderEl) return null

  const slideEls = sliderEl.querySelectorAll('.slide')
  if (slideEls.length === 0) return null

  const slides = Array.from(slideEls).map(slide => {
    const img = slide.querySelector('img')
    const titleEl = slide.querySelector('.title')
    const descEl = slide.querySelector('.item-desc, .desc')
    const titleAnchor = titleEl?.querySelector('a')

    const titleText = titleEl?.textContent?.trim() || ''
    // The title looks like "1. Speedy" — split rank from label
    const rankMatch = titleText.match(/^(\d+)\.\s*(.*)$/)
    const rank = rankMatch ? rankMatch[1] : ''
    const label = rankMatch ? rankMatch[2] : titleText

    return {
      src: img ? imgSrc(img) : '',
      alt: img?.getAttribute('alt') || '',
      rank,
      label,
      href: titleAnchor?.getAttribute('href') || '',
      desc: descEl?.textContent?.trim() || '',
    }
  })

  return {
    blockType: 'resaleSlider',
    extractedContent: { slides },
  }
}

/**
 * Image+Text: 2-column row where one column has an image (no caption/text)
 * and the other has heading + body + (optional eyebrow) + (optional ordered list).
 */
function classifyImageText(row) {
  const allCols = Array.from(row.querySelectorAll(':scope > .wpb_column'))
  // Drop empty gutter columns (e.g. medium-1 spacer between image and text)
  const cols = allCols.filter(col => {
    const text = (col.textContent || '').trim()
    return text || col.querySelector('img, iframe, video')
  })
  if (cols.length !== 2) return null

  const colData = cols.map(col => {
    const img = col.querySelector('img')
    const headings = Array.from(col.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    const paragraphs = Array.from(col.querySelectorAll('p'))
    const list = col.querySelector('ol, ul')
    const text = (col.textContent || '').trim()
    return { col, img, headings, paragraphs, list, text }
  })

  const imgIdx = colData.findIndex(c => c.img && c.headings.length === 0 && c.paragraphs.length === 0)
  const txtIdx = colData.findIndex(c => c.headings.length > 0 || c.paragraphs.length > 0)
  if (imgIdx === -1 || txtIdx === -1 || imgIdx === txtIdx) return null

  const imgCol = colData[imgIdx]
  const txtCol = colData[txtIdx]

  const heading = txtCol.headings.find(h => h.tagName.match(/^H[1-3]$/i)) || txtCol.headings[0]
  // Eyebrow = small heading (h4/h5/h6) sitting between body and list
  const eyebrowEl = txtCol.headings.find(h => h.tagName.match(/^H[4-6]$/i) && h !== heading)

  return {
    blockType: 'resaleImageText',
    extractedContent: {
      image: { src: imgSrc(imgCol.img), alt: imgCol.img.getAttribute('alt') || '' },
      heading: { text: heading?.textContent?.trim() || '', html: heading?.innerHTML || '' },
      paragraphs: txtCol.paragraphs.map(p => ({ html: p.innerHTML.trim() })),
      eyebrow: eyebrowEl?.textContent?.trim() || '',
      listHtml: txtCol.list?.outerHTML || '',
      imagePosition: imgIdx === 0 ? 'left' : 'right',
    },
  }
}

/**
 * Three-column image row (e.g. Balenciaga / Loewe / Celine info graphics).
 * Each column has a single linked image and nothing else.
 */
function classifyThreeUpImages(row) {
  const cols = Array.from(row.querySelectorAll(':scope > .wpb_column'))
  if (cols.length !== 3) return null

  const items = cols.map(col => {
    const img = col.querySelector('img')
    if (!img) return null
    const anchor = img.closest('a')
    return {
      src: imgSrc(img),
      alt: img.getAttribute('alt') || '',
      href: anchor?.getAttribute('href') || '',
    }
  })

  if (items.some(i => !i)) return null
  // Only treat as three-up if there's no heading/body in the row
  if (row.querySelector('h1, h2, h3, h4, h5, h6, p')) return null

  return {
    blockType: 'threeUp',
    extractedContent: {
      headings: [],
      paragraphs: [],
      images: items.map(i => ({ src: i.src, alt: i.alt, caption: '', className: '' })),
      links: items.filter(i => i.href).map(i => ({ href: i.href, text: i.alt })),
      lists: [],
      videos: [],
      hotspots: [],
      tables: [],
    },
  }
}

/**
 * Hotspot row: contains thb-hotspot-container.
 */
function classifyHotspot(row) {
  const container = row.querySelector('[class*="hotspot-container"]')
  if (!container) return null
  const img = container.querySelector('img')
  if (!img) return null

  const markers = Array.from(container.querySelectorAll('div')).filter(el => {
    const style = el.getAttribute('style') || ''
    const cls = el.className || ''
    const hasPosition = /left:/.test(style) && /top:/.test(style)
    const isHotspotMarker =
      (cls.includes('thb-hotspot') && !cls.includes('thb-hotspot-')) ||
      cls.includes('hotspot__item')
    return hasPosition && isHotspotMarker
  })

  if (markers.length === 0) return null

  const items = markers.map((marker, index) => {
    const style = marker.getAttribute('style') || ''
    const left = (style.match(/left:\s*([\d.]+%?)/) || [])[1] || '0%'
    const top = (style.match(/top:\s*([\d.]+%?)/) || [])[1] || '0%'
    const labelEl =
      marker.querySelector('[class*="tooltip"] h6') ||
      marker.querySelector('[class*="tooltip"]') ||
      marker.querySelector('[class*="label"]')
    return {
      href: '#',
      left,
      top,
      marker: String(index + 1),
      label: labelEl?.textContent?.trim() || '',
    }
  })

  // Look in the same row for an <ol> with hrefs — associate them with hotspot items
  const ol = row.querySelector('ol')
  if (ol) {
    const olLinks = Array.from(ol.querySelectorAll('li')).map(li => {
      const a = li.querySelector('a')
      return { href: a?.getAttribute('href') || '#', text: a?.textContent?.trim() || li.textContent?.trim() || '' }
    })
    items.forEach((item, i) => {
      if (olLinks[i]) {
        item.href = olLinks[i].href
        if (!item.label) item.label = olLinks[i].text
      }
    })
  }

  return {
    blockType: 'fullWidth',
    extractedContent: {
      headings: [], paragraphs: [], images: [], links: [], lists: [], videos: [],
      hotspots: [{
        image: { src: imgSrc(img), alt: img.getAttribute('alt') || '', title: img.getAttribute('title') || '' },
        items,
      }],
      tables: [],
    },
  }
}

/**
 * Five-up circular images row (textiles).
 */
function classifyMultiUpImages(row) {
  const cols = Array.from(row.querySelectorAll(':scope > .wpb_column'))
  if (cols.length < 2 || cols.length > 6) return null

  const items = []
  for (const col of cols) {
    const imgs = col.querySelectorAll('img')
    if (imgs.length !== 1) return null
    const img = imgs[0]
    const anchor = img.closest('a')
    const captionEl = col.querySelector('figcaption, .wpb_caption_text')
    items.push({
      src: imgSrc(img),
      alt: img.getAttribute('alt') || '',
      href: anchor?.getAttribute('href') || '',
      caption: captionEl?.textContent?.trim() || '',
    })
  }

  if (row.querySelector('h1, h2, h3, h4, h5, h6, p')) return null

  const blockTypeByCount = { 2: 'twoUp', 3: 'threeUp', 4: 'fourUp', 5: 'fiveUp', 6: 'threeByTwo' }
  const blockType = blockTypeByCount[items.length]
  if (!blockType) return null

  return {
    blockType,
    extractedContent: {
      headings: [],
      paragraphs: [],
      images: items.map(i => ({ src: i.src, alt: i.alt, caption: i.caption, className: '' })),
      links: items.filter(i => i.href).map(i => ({ href: i.href, text: i.alt })),
      lists: [],
      videos: [],
      hotspots: [],
      tables: [],
    },
  }
}

/**
 * Plain rich text: heading + body content with no images/sliders/hotspots.
 * Detect a `show_container` wrapper to enable show-more toggle.
 */
function classifyRichText(row) {
  const hasMedia = !!row.querySelector('img, iframe, video, .slider-container, [class*="hotspot-container"]')
  if (hasMedia) return null

  const headingEl = row.querySelector('h1, h2, h3, h4, h5, h6')
  const showContainer = row.querySelector('.show_container')
  const paragraphEls = Array.from(row.querySelectorAll('p'))
  if (!headingEl && paragraphEls.length === 0) return null

  let bodyHtml = ''
  let showMore = false

  if (showContainer) {
    showMore = true
    const excerptEl = showContainer.querySelector('.js-excerpt') || showContainer.querySelector('.content')
    if (excerptEl) {
      // The .js-excerpt is one big <p> with <br><br> separators — split into paragraphs.
      const inner = excerptEl.innerHTML.trim()
      const segments = inner.split(/<br\s*\/?>\s*<br\s*\/?>/gi)
      bodyHtml = segments
        .map(seg => seg.replace(/<br\s*\/?>/gi, ' ').trim())
        .filter(Boolean)
        .map(seg => `<p>${cleanInline(seg)}</p>`)
        .join('\n')
    }
  } else {
    bodyHtml = paragraphEls
      .map(p => p.innerHTML.trim())
      .filter(Boolean)
      .map(html => `<p>${cleanInline(html)}</p>`)
      .join('\n')
  }

  const headingText = headingEl?.textContent?.trim() || ''
  const headingTag = headingEl?.tagName?.toLowerCase() || 'h2'
  const headingAlign = (headingEl?.getAttribute('style') || '').match(/text-align:\s*([a-z]+)/i)?.[1] || ''
  const align = /text-align:\s*center/i.test(headingEl?.getAttribute('style') || '') ||
    /text-align:\s*center/i.test(paragraphEls[0]?.getAttribute('style') || '')
    ? 'center'
    : 'left'

  return {
    blockType: 'resaleRichText',
    extractedContent: {
      heading: { text: headingText, tag: headingTag, html: headingEl?.innerHTML || '' },
      bodyHtml,
      align,
      showMore,
    },
  }
}

// ===================================================================
// HTML generators
// ===================================================================

function generateHeroHtml(content, prefix) {
  const bg = content.bgImage ? ` style="background-image: url('${escapeAttr(content.bgImage)}');"` : ''
  return `<div class="${prefix}"${bg}>
  <div class="${prefix}__overlay">
    ${content.eyebrow ? `<p class="${prefix}__eyebrow">${escapeAttr(content.eyebrow)}</p>` : ''}
    ${content.title ? `<h1 class="${prefix}__title">${escapeAttr(content.title)}</h1>` : ''}
  </div>
</div>`
}

let toggleCounter = 0
function generateRichTextHtml(content, prefix) {
  const tag = content.heading?.tag || 'h2'
  const headingHtml = content.heading?.text
    ? `<${tag} class="${prefix}__heading">${escapeAttr(content.heading.text)}</${tag}>`
    : ''
  const alignClass = content.align === 'center' ? ` ${prefix}--center` : ''

  if (!content.showMore) {
    return `<div class="${prefix}${alignClass} fp-container--full-width">
  <div class="fp-container">
    ${headingHtml}
    <div class="${prefix}__body">
      ${content.bodyHtml || ''}
    </div>
  </div>
</div>`
  }

  toggleCounter++
  const toggleId = `rr-show-${toggleCounter}`
  return `<div class="${prefix}${alignClass} ${prefix}--show-more fp-container--full-width">
  <div class="fp-container">
    ${headingHtml}
    <input type="checkbox" id="${toggleId}" class="${prefix}__toggle" aria-hidden="true">
    <div class="${prefix}__body">
      ${content.bodyHtml || ''}
    </div>
    <label for="${toggleId}" class="${prefix}__more">
      <span class="${prefix}__more-text">Show more</span>
      <span class="${prefix}__less-text">Show less</span>
    </label>
  </div>
</div>`
}

function generateSliderHtml(content, prefix) {
  const slideCount = (content.slides || []).length
  const dots = slideCount > 0
    ? `  <div class="${prefix}__dots" role="tablist">
${Array.from({ length: slideCount }, (_, i) =>
  `    <button type="button" class="${prefix}__dot${i === 0 ? ` ${prefix}__dot--active` : ''}" data-slide-index="${i}" aria-label="Go to slide ${i + 1}"></button>`
).join('\n')}
  </div>`
    : ''

  const slidesHtml = (content.slides || []).map(s => {
    const linked = s.href
      ? `<a class="${prefix}__title-link" href="${escapeAttr(s.href)}">${escapeAttr(s.label)}</a>`
      : escapeAttr(s.label)
    return `    <li class="${prefix}__slide">
      <div class="${prefix}__image-wrapper">
        <img class="${prefix}__image" src="${escapeAttr(s.src)}" alt="${escapeAttr(s.alt)}">
      </div>
      <p class="${prefix}__title">${s.rank ? `${escapeAttr(s.rank)}. ` : ''}${linked}</p>
      ${s.desc ? `<p class="${prefix}__desc">${escapeAttr(s.desc)}</p>` : ''}
    </li>`
  }).join('\n')

  return `<div class="${prefix} fp-container--full-width">
  <div class="fp-container">
    <ul class="${prefix}__track">
${slidesHtml}
    </ul>
${dots}
  </div>
</div>`
}

function generateImageTextHtml(content, prefix) {
  const positionClass = content.imagePosition === 'right' ? ` ${prefix}--image-right` : ` ${prefix}--image-left`
  const headingTag = 'h2'
  const eyebrow = content.eyebrow
    ? `<p class="${prefix}__eyebrow">${escapeAttr(content.eyebrow)}</p>`
    : ''
  const list = content.listHtml
    ? `<div class="${prefix}__list">${cleanInline(content.listHtml)}</div>`
    : ''
  const paragraphs = (content.paragraphs || []).map(p => `<p>${cleanInline(p.html)}</p>`).join('\n        ')

  return `<div class="${prefix}${positionClass} fp-container--full-width">
  <div class="fp-container ${prefix}__inner">
    <div class="${prefix}__image">
      <img src="${escapeAttr(content.image?.src || '')}" alt="${escapeAttr(content.image?.alt || '')}">
    </div>
    <div class="${prefix}__content">
      <${headingTag} class="${prefix}__heading">${escapeAttr(content.heading?.text || '')}</${headingTag}>
      <div class="${prefix}__body">
        ${paragraphs}
      </div>
      ${eyebrow}
      ${list}
    </div>
  </div>
</div>`
}

function generateThreeUpHtml(content, prefix) {
  const items = (content.images || []).map((img, i) => {
    const link = (content.links || [])[i]
    const inner = `<img class="${prefix}__image" src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt)}">`
    const wrapped = link?.href
      ? `<a class="${prefix}__link" href="${escapeAttr(link.href)}">${inner}</a>`
      : inner
    return `      <figure class="${prefix}__item">
        ${wrapped}
      </figure>`
  }).join('\n')

  return `<div class="${prefix} fp-container--full-width">
  <div class="fp-container">
    <div class="${prefix}__grid">
${items}
    </div>
  </div>
</div>`
}

function generateMultiUpHtml(content, prefix) {
  const items = (content.images || []).map((img, i) => {
    const link = (content.links || [])[i]
    const captionHtml = img.caption
      ? `\n        <figcaption class="${prefix}__label">${escapeAttr(img.caption)}</figcaption>`
      : ''
    const imgEl = `<img class="${prefix}__image" src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt)}">`
    const wrapped = link?.href
      ? `<a class="${prefix}__link" href="${escapeAttr(link.href)}">${imgEl}</a>`
      : imgEl
    return `      <figure class="${prefix}__item">
        ${wrapped}${captionHtml}
      </figure>`
  }).join('\n')

  return `<div class="${prefix} fp-container--full-width">
  <div class="fp-container">
    <div class="${prefix}__grid">
${items}
    </div>
  </div>
</div>`
}

function generateAuthorHtml(content, prefix) {
  const { bodyHtml, image, authorName, authorTitle } = content
  return [
    `<div class="${prefix} fp-container--full-width">`,
    `  <div class="fp-container">`,
    bodyHtml ? `    <div class="${prefix}__intro">\n${bodyHtml}\n    </div>` : '',
    image?.src ? `    <figure class="${prefix}__figure">` : '',
    image?.src ? `      <img class="${prefix}__avatar" src="${escapeAttr(image.src)}" alt="${escapeAttr(image.alt || '')}">` : '',
    image?.src ? `    </figure>` : '',
    authorName ? `    <p class="${prefix}__name">${escapeAttr(authorName)}</p>` : '',
    authorTitle ? `    <p class="${prefix}__title">${escapeAttr(authorTitle)}</p>` : '',
    `  </div>`,
    `</div>`,
  ].filter(Boolean).join('\n')
}

function generateHotspotSectionHtml(content, prefix) {
  const hotspot = content.hotspots[0]
  const items = hotspot.items.map(item => {
    const labelHtml = item.label
      ? `<span class="blog__hotspot__label">${escapeAttr(item.label)}</span>`
      : ''
    return `      <a class="blog__hotspot__item" href="${escapeAttr(item.href)}" style="left: ${item.left}; top: ${item.top};">
        <span class="blog__hotspot__marker">${escapeAttr(item.marker)}</span>
        ${labelHtml}
      </a>`
  }).join('\n')

  return `<div class="${prefix} fp-container--full-width">
  <div class="fp-container">
    <div class="blog__hotspot__inner">
      <img class="blog__hotspot__image" src="${escapeAttr(hotspot.image.src)}" alt="${escapeAttr(hotspot.image.alt)}">
${items}
    </div>
  </div>
</div>`
}

/**
 * Inject `data-section-id="..."` and `data-section-type="..."` onto the first
 * opening tag of a section's rendered HTML. Used so the auto-migrator UI can
 * scroll/highlight/style individual sections.
 */
function tagSection(html, section) {
  if (!html) return html
  const attrs = `data-section-id="${section.id}" data-section-type="${section.blockType}"`
  return html.replace(/^<(\w+)([^>]*)>/, `<$1 ${attrs}$2>`)
}

/**
 * Inject inline styles (background-color, padding-top, padding-bottom) into
 * elements bearing `data-section-id="..."` based on the provided styleMap.
 *
 * styleMap shape: { [sectionId]: { bg?: '#hex', paddingTop?: '64px', paddingBottom?: '64px' } }
 *
 * Properties absent from the per-section entry are omitted from the output.
 * Existing values for the same properties on the element are stripped first
 * so calling repeatedly doesn't accumulate stale declarations.
 */
export function applySectionStyles(html, styleMap) {
  if (!html || !styleMap || Object.keys(styleMap).length === 0) return html
  return html.replace(
    /<(\w+)([^>]*\bdata-section-id="([^"]+)"[^>]*)>/g,
    (match, tag, attrs, id) => {
      const s = styleMap[id]
      if (!s) return match
      const decls = []
      if (s.bg) decls.push(`background-color: ${s.bg}`)
      if (s.paddingTop != null && s.paddingTop !== '') decls.push(`padding-top: ${s.paddingTop}`)
      if (s.paddingBottom != null && s.paddingBottom !== '') decls.push(`padding-bottom: ${s.paddingBottom}`)
      if (decls.length === 0) return match
      const newStyle = decls.join('; ') + ';'

      if (/\sstyle="/i.test(attrs)) {
        const updated = attrs.replace(/\sstyle="([^"]*)"/i, (_, style) => {
          const cleaned = style
            .replace(/background-color\s*:\s*[^;]+;?\s*/gi, '')
            .replace(/padding-top\s*:\s*[^;]+;?\s*/gi, '')
            .replace(/padding-bottom\s*:\s*[^;]+;?\s*/gi, '')
            .trim()
          const sep = cleaned && !cleaned.endsWith(';') ? ' ' : ''
          const body = cleaned ? `${cleaned}${sep}${newStyle}` : newStyle
          return ` style="${body}"`
        })
        return `<${tag}${updated}>`
      }
      return `<${tag}${attrs} style="${newStyle}">`
    }
  )
}

// Back-compat alias for callers that pre-date the rename.
export const applyBackgroundColors = applySectionStyles

/**
 * Render a single section's HTML based on its block type.
 * Resale-specific generators are inlined here; other block types
 * fall through to the generic patterns above.
 */
function renderSectionHtml(section) {
  const { blockType, extractedContent } = section
  let html = ''
  switch (blockType) {
    case 'resaleHero':
      html = generateHeroHtml(extractedContent, 'blog__resale-hero'); break
    case 'resaleRichText':
      html = generateRichTextHtml(extractedContent, 'blog__resale-rich-text'); break
    case 'resaleSlider':
      html = generateSliderHtml(extractedContent, 'blog__resale-slider'); break
    case 'resaleImageText':
      html = generateImageTextHtml(extractedContent, 'blog__resale-image-text'); break
    case 'resaleAuthor':
      html = generateAuthorHtml(extractedContent, 'blog__resale-author'); break
    case 'threeUp':
      html = generateThreeUpHtml(extractedContent, 'blog__three-up'); break
    case 'twoUp':
      html = generateMultiUpHtml(extractedContent, 'blog__two-up'); break
    case 'fourUp':
      html = generateMultiUpHtml(extractedContent, 'blog__four-up'); break
    case 'fiveUp':
      html = generateMultiUpHtml(extractedContent, 'blog__five-up'); break
    case 'threeByTwo':
      html = generateMultiUpHtml(extractedContent, 'blog__three-by-two'); break
    case 'fullWidth':
      if (extractedContent.hotspots?.length > 0) {
        html = generateHotspotSectionHtml(extractedContent, 'blog__hotspot')
      }
      break
    default:
      break
  }
  return tagSection(html, section)
}

// ===================================================================
// Main entry point
// ===================================================================

/**
 * Process a resale-report HTML page → return { title, sections, html, ... }.
 * Mirrors the shape of `processPost` so the existing UI can consume it.
 */
export function processResaleReport(pageHtml, postUrl) {
  toggleCounter = 0

  // Capture the page origin so relative image/iframe URLs can be absolutized.
  try {
    pageOrigin = new URL(postUrl).origin
  } catch {
    pageOrigin = ''
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(pageHtml, 'text/html')

  const wrapper = doc.querySelector('.page.type-page.hentry')
    || doc.querySelector('[class*="type-page"][class*="hentry"]')
    || doc.querySelector('article')

  if (!wrapper) {
    return {
      title: doc.querySelector('title')?.textContent?.trim() || 'Untitled',
      url: postUrl, sections: [], html: '', error: 'Resale Report wrapper not found',
      author: '', publishedAt: '', tags: [], imageSrc: '', imageAlt: '', summary: '',
    }
  }

  const vcStyles = collectVcCustomStyles(doc)

  // Title — schema.org / og:title / fallback
  const titleMeta = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
  const docTitle = (titleMeta || doc.querySelector('title')?.textContent || '')
    .replace(/\s*[-–|]\s*Academy by FASHIONPHILE.*$/i, '')
    .trim() || 'Resale Report'

  const summary = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
    || doc.querySelector('meta[name="description"]')?.getAttribute('content')
    || ''

  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || ''

  const publishedAt = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || ''

  const sections = []

  for (const { row } of flattenRows(wrapper)) {
    if (isEmptyRow(row)) continue
    if (isHeroDuplicate(row, sections)) continue

    const result =
      classifyHero(row, vcStyles) ||
      classifyAuthor(row) ||
      classifyHotspot(row) ||
      classifySlider(row) ||
      classifyImageText(row) ||
      classifyThreeUpImages(row) ||
      classifyMultiUpImages(row) ||
      classifyRichText(row)

    if (!result) continue

    sections.push({
      id: `section-${sections.length + 1}`,
      ...result,
    })
  }

  // Build final HTML — group by boundary headings (h2 in resaleRichText starts a new <section>).
  //
  // Visual-only sections (images/sliders/hotspots with no headings or body)
  // that appear immediately before a boundary section get folded into the
  // *next* group rather than staying with the previous one. The WP source
  // commonly puts lead-in imagery as its own row right above the heading row.
  const groups = []
  let current = { heading: '', sections: [] }
  let pendingVisuals = []

  const isBoundary = (s) =>
    s.blockType === 'resaleHero' ||
    (s.blockType === 'resaleRichText' && s.extractedContent.heading?.tag === 'h2' && s.extractedContent.heading?.text)

  const isVisualOnly = (s) => {
    const c = s.extractedContent || {}
    const hasText =
      (c.headings?.length || 0) > 0 ||
      (c.paragraphs?.length || 0) > 0 ||
      (c.lists?.length || 0) > 0 ||
      !!c.heading?.text ||
      !!c.bodyHtml
    if (hasText) return false
    return (
      (c.images?.length || 0) > 0 ||
      (c.hotspots?.length || 0) > 0 ||
      (c.slides?.length || 0) > 0 ||
      s.blockType === 'resaleSlider'
    )
  }

  for (const section of sections) {
    if (isBoundary(section)) {
      if (current.sections.length > 0) groups.push(current)
      current = {
        heading: section.extractedContent.title || section.extractedContent.heading?.text || '',
        sections: [...pendingVisuals, section],
      }
      pendingVisuals = []
    } else if (isVisualOnly(section)) {
      // Defer — this might be a lead-in for the next boundary section.
      pendingVisuals.push(section)
    } else {
      // Non-boundary content (e.g. h3 rich text, image+text). Any deferred
      // visuals belong with the current group, not the next.
      if (pendingVisuals.length > 0) {
        current.sections.push(...pendingVisuals)
        pendingVisuals = []
      }
      current.sections.push(section)
    }
  }
  if (pendingVisuals.length > 0) current.sections.push(...pendingVisuals)
  if (current.sections.length > 0) groups.push(current)

  const slugCounts = {}
  const htmlParts = groups.map(group => {
    const inner = group.sections.map(renderSectionHtml).filter(Boolean).join('\n\n')
    if (!inner) return ''
    if (!group.heading) return `<section>\n${inner}\n</section>`
    let slug = slugify(group.heading)
    if (slugCounts[slug]) {
      slugCounts[slug]++
      slug = `${slug}-${slugCounts[slug]}`
    } else {
      slugCounts[slug] = 1
    }
    return `<section id="${slug}">\n${inner}\n</section>`
  }).filter(Boolean)

  const html = htmlParts.join('\n\n')

  return {
    title: docTitle,
    url: postUrl,
    sections,
    html,
    author: '',
    publishedAt,
    tags: [],
    imageSrc: ogImage,
    imageAlt: '',
    summary,
  }
}
