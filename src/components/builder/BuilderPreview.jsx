import { useMemo } from 'react'
import { PREVIEW_CSS } from '../../constants'
import { generateBuilderSectionHtml } from '../../utils/generateBuilderHtml'

export function BuilderPreview({ sections }) {
  const previewHtml = useMemo(() => {
    if (sections.length === 0) return ''
    return sections
      .map(section => generateBuilderSectionHtml(section))
      .filter(Boolean)
      .join('\n\n')
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
      dangerouslySetInnerHTML={{ __html: PREVIEW_CSS + previewHtml }}
    />
  )
}
