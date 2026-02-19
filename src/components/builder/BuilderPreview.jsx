import { useMemo } from 'react'
import { PREVIEW_CSS } from '../../constants'
import { generateBuilderSectionHtml } from '../../utils/generateBuilderHtml'

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

export function BuilderPreview({ sections }) {
  const previewHtml = useMemo(() => {
    if (sections.length === 0) return ''
    const urlMap = buildPreviewUrlMap(sections)
    const html = sections
      .map(section => generateBuilderSectionHtml(section))
      .filter(Boolean)
      .join('\n\n')
    return replacePreviewUrls(html, urlMap)
  }, [sections])

  if (sections.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
        Preview will appear here as you add sections
      </div>
    )
  }

  return (
    <div
      className="p-6 bg-white text-black overflow-auto h-full prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: '<style>.prose img,.prose figure{margin-top:0;margin-bottom:0;}</style>' + PREVIEW_CSS + previewHtml }}
    />
  )
}
