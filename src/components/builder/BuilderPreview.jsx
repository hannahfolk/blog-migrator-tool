import { useMemo, useEffect, useRef } from 'react'
import { PREVIEW_CSS } from '../../constants'
import { generateGroupedBuilderHtml } from '../../utils/generateBuilderHtml'
import { initSliders } from '../../utils/sliderInteractivity'

const PROSE_RESET = '<style>.prose img,.prose figure{margin-top:0;margin-bottom:0;}</style>'

function buildPreviewUrlMap(sections) {
  const map = {}
  for (const section of sections) {
    for (const img of section.images || []) {
      if (img.src && img._previewSrc) {
        map[img.src] = img._previewSrc
      }
    }
    if (section.hotspotImage?.src && section.hotspotImage?._previewSrc) {
      map[section.hotspotImage.src] = section.hotspotImage._previewSrc
    }
  }
  return map
}

function replacePreviewUrls(html, urlMap) {
  let result = html
  for (const [cdnUrl, localUrl] of Object.entries(urlMap)) {
    result = result.replaceAll(cdnUrl, localUrl)
  }
  return result
}

export function BuilderPreview({ sections, previewCss = PREVIEW_CSS, fullBleed = false }) {
  const previewHtml = useMemo(() => {
    if (sections.length === 0) return ''
    const urlMap = buildPreviewUrlMap(sections)
    const html = generateGroupedBuilderHtml(sections)
    return replacePreviewUrls(html, urlMap)
  }, [sections])

  const previewRef = useRef(null)

  // Hook up clickable / scroll-tracking dots on any resale sliders inside
  // the preview whenever the rendered HTML changes.
  useEffect(() => {
    return initSliders(previewRef.current)
  }, [previewHtml])

  if (sections.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
        Preview will appear here as you add sections
      </div>
    )
  }

  return (
    <div
      ref={previewRef}
      className={`bg-white text-black overflow-auto h-full prose prose-sm max-w-none ${fullBleed ? 'pb-6' : 'p-6'}`}
      style={{ containerType: 'inline-size' }}
      dangerouslySetInnerHTML={{ __html: PROSE_RESET + previewCss + previewHtml }}
    />
  )
}
