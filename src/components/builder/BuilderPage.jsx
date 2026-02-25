import { useState, useCallback, useRef, useEffect } from 'react'
import { AddSectionButton } from './AddSectionButton'
import { SectionEditor } from './SectionEditor'
import { BuilderPreview } from './BuilderPreview'
import { BuilderOutput } from './BuilderOutput'
import { generateGroupedBuilderHtml } from '../../utils/generateBuilderHtml'
import { useLocalStorage } from '../../utils'
import { useBuilderEnv } from '../../utils/useBuilderEnv'
import { SHOPIFY_CDN } from '../../constants/shopifyCdn'
import { FASHIONPHILE_BASE } from './FashionphileUrlInput'

let nextId = Date.now()

function createSection(blockType) {
  return {
    id: `section-${nextId++}`,
    blockType,
    heading: '',
    headingTag: 'h2',
    body: '',
    images: [],
    ctas: [],
    videoUrl: '',
    videoTitle: '',
    hotspots: [],
    hotspotImage: { src: '', alt: '' },
    hrColor: '#191c1f',
    authorName: '',
    authorTitle: '',
  }
}

// Strip _previewSrc from all images so stale blob URLs don't persist in localStorage
function stripPreviewSrcs(sectionList) {
  return sectionList.map(s => {
    const cleaned = { ...s }
    if (cleaned.images?.length) {
      cleaned.images = cleaned.images.map(({ _previewSrc, ...img }) => img)
    }
    if (cleaned.hotspotImage?._previewSrc) {
      const { _previewSrc, ...rest } = cleaned.hotspotImage
      cleaned.hotspotImage = rest
    }
    return cleaned
  })
}

export function BuilderPage() {
  const [rawSections, setRawSections] = useLocalStorage('builder:sections', [])
  const [showOutput, setShowOutput] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [validationError, setValidationError] = useState('')

  // Live sections include _previewSrc (ephemeral blob URLs for current session)
  const [sections, setSectionsState] = useState(() => rawSections)

  // Sync to localStorage without _previewSrc
  const setSections = useCallback((updater) => {
    setSectionsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setRawSections(stripPreviewSrcs(next))
      return next
    })
  }, [setRawSections])

  const [env] = useBuilderEnv()

  // Ensure nextId is always higher than any existing section id
  const initialized = useRef(false)
  if (!initialized.current && sections.length > 0) {
    const maxId = Math.max(...sections.map(s => parseInt(s.id.replace('section-', '')) || 0))
    if (maxId >= nextId) nextId = maxId + 1
    initialized.current = true
  }

  // Swap all URLs when env changes
  const prevEnvRef = useRef(env)
  useEffect(() => {
    if (prevEnvRef.current === env) return
    const oldEnv = prevEnvRef.current
    prevEnvRef.current = env

    setSections(prev => prev.map(section => {
      const updated = { ...section }

      // Swap image CDN URLs
      if (updated.images?.length) {
        updated.images = updated.images.map(img => {
          if (!img.src) return img
          const newImg = { ...img }
          for (const base of Object.values(SHOPIFY_CDN)) {
            if (newImg.src.startsWith(base)) {
              newImg.src = SHOPIFY_CDN[env] + newImg.src.slice(base.length)
              break
            }
          }
          return newImg
        })
      }

      // Swap hotspot image CDN URL
      if (updated.hotspotImage?.src) {
        for (const base of Object.values(SHOPIFY_CDN)) {
          if (updated.hotspotImage.src.startsWith(base)) {
            updated.hotspotImage = {
              ...updated.hotspotImage,
              src: SHOPIFY_CDN[env] + updated.hotspotImage.src.slice(base.length),
            }
            break
          }
        }
      }

      // Swap CTA Fashionphile URLs
      if (updated.ctas?.length) {
        updated.ctas = updated.ctas.map(cta => {
          if (!cta?.href) return cta
          const newCta = { ...cta }
          for (const base of Object.values(FASHIONPHILE_BASE)) {
            if (newCta.href.startsWith(base)) {
              newCta.href = FASHIONPHILE_BASE[env] + newCta.href.slice(base.length)
              break
            }
          }
          return newCta
        })
      }

      return updated
    }))
  }, [env])

  const addSection = useCallback((blockType) => {
    setSections(prev => [...prev, createSection(blockType)])
  }, [])

  const handleGenerate = () => {
    // Validate: all images with a src must have alt text
    for (const section of sections) {
      const images = section.images || []
      for (const img of images) {
        if (img.src && !img.alt?.trim()) {
          setValidationError('All images with a URL must have alt text.')
          return
        }
      }
      if (section.hotspotImage?.src && !section.hotspotImage?.alt?.trim()) {
        setValidationError('All images with a URL must have alt text.')
        return
      }
    }

    setValidationError('')
    const html = generateGroupedBuilderHtml(sections)
    setGeneratedHtml(html)
    setShowOutput(true)
  }

  if (showOutput) {
    return (
      <BuilderOutput
        generatedHtml={generatedHtml}
        sectionCount={sections.length}
        onBack={() => setShowOutput(false)}
      />
    )
  }

  return (
    <div className="h-full">
      <div className="max-w-[1800px] mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left panel: Section editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                Sections ({sections.length})
              </h2>
              <div className="flex items-center gap-3">
                {validationError && (
                  <span className="text-xs text-red-400">{validationError}</span>
                )}
                {sections.length > 0 && (
                  <button
                    onClick={handleGenerate}
                    className="bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Generate HTML
                  </button>
                )}
              </div>
            </div>

            <AddSectionButton onAdd={addSection} />

            <div className="overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              <SectionEditor sections={sections} onChange={setSections} />
            </div>
          </div>

          {/* Right panel: Live preview */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Live Preview</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[calc(100vh-220px)]">
              <BuilderPreview sections={sections} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
