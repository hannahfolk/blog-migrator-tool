import { useState, useCallback, useRef } from 'react'
import { AddSectionButton } from './AddSectionButton'
import { SectionEditor } from './SectionEditor'
import { BuilderPreview } from './BuilderPreview'
import { BuilderOutput } from './BuilderOutput'
import { generateBuilderSectionHtml } from '../../utils/generateBuilderHtml'
import { useLocalStorage } from '../../utils'

let nextId = Date.now()

function createSection(blockType) {
  return {
    id: `section-${nextId++}`,
    blockType,
    heading: '',
    body: '',
    images: [],
    ctas: [],
    videoUrl: '',
    videoTitle: '',
    hotspots: [],
    hotspotImage: { src: '', alt: '' },
  }
}

export function BuilderPage() {
  const [sections, setSections] = useLocalStorage('builder:sections', [])
  const [showOutput, setShowOutput] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState('')

  // Ensure nextId is always higher than any existing section id
  const initialized = useRef(false)
  if (!initialized.current && sections.length > 0) {
    const maxId = Math.max(...sections.map(s => parseInt(s.id.replace('section-', '')) || 0))
    if (maxId >= nextId) nextId = maxId + 1
    initialized.current = true
  }

  const addSection = useCallback((blockType) => {
    setSections(prev => [...prev, createSection(blockType)])
  }, [])

  const handleGenerate = () => {
    const html = sections
      .map(section => generateBuilderSectionHtml(section))
      .filter(Boolean)
      .join('\n\n')
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
              {sections.length > 0 && (
                <button
                  onClick={handleGenerate}
                  className="bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Generate HTML
                </button>
              )}
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
