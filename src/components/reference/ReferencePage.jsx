import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { FIGMA_BLOCKS, BLOG_CSS } from '../../constants'
import { copyToClipboard } from '../../utils'
import { SectionCard } from './SectionCard'

export function ReferencePage() {
  const [copiedAll, setCopiedAll] = useState(false)

  const handleCopyAllCss = async () => {
    const success = await copyToClipboard(BLOG_CSS)
    if (success) {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Quick Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold text-white">Section Reference</h2>
          <p className="text-sm text-zinc-500">All available Figma blog section types</p>
        </div>
        <button
          onClick={handleCopyAllCss}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {copiedAll ? <Check size={16} /> : <Copy size={16} />}
          {copiedAll ? 'Copied All CSS!' : 'Copy All CSS'}
        </button>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {Object.entries(FIGMA_BLOCKS).map(([key, section]) => {
          const Icon = section.icon
          return (
            <div
              key={key}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: section.color + '20' }}
              >
                <Icon size={18} style={{ color: section.color }} />
              </div>
              <p className="text-sm font-medium text-white">{section.label}</p>
            </div>
          )
        })}
      </div>

      {/* Section Cards */}
      <div className="space-y-6">
        {Object.entries(FIGMA_BLOCKS).map(([key, section]) => (
          <SectionCard key={key} sectionKey={key} section={section} />
        ))}
      </div>

      {/* Naming Convention */}
      <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4">Class Naming Convention</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <code className="text-xs bg-zinc-800 text-indigo-400 px-2 py-1 rounded font-mono whitespace-nowrap">
              blog__[section]
            </code>
            <span className="text-zinc-400">Section container (e.g., <code className="text-zinc-300">blog__two-up</code>)</span>
          </div>
          <div className="flex items-start gap-3">
            <code className="text-xs bg-zinc-800 text-indigo-400 px-2 py-1 rounded font-mono whitespace-nowrap">
              blog__[section]__heading
            </code>
            <span className="text-zinc-400">Section heading (h2)</span>
          </div>
          <div className="flex items-start gap-3">
            <code className="text-xs bg-zinc-800 text-indigo-400 px-2 py-1 rounded font-mono whitespace-nowrap">
              blog__[section]__body
            </code>
            <span className="text-zinc-400">Rich text body container (supports p, ul, ol, h3-h6, blockquote)</span>
          </div>
          <div className="flex items-start gap-3">
            <code className="text-xs bg-zinc-800 text-indigo-400 px-2 py-1 rounded font-mono whitespace-nowrap">
              blog__[section]__grid
            </code>
            <span className="text-zinc-400">Image grid container (for multi-image sections)</span>
          </div>
          <div className="flex items-start gap-3">
            <code className="text-xs bg-zinc-800 text-indigo-400 px-2 py-1 rounded font-mono whitespace-nowrap">
              blog__[section]__cta-btn
            </code>
            <span className="text-zinc-400">Call-to-action button</span>
          </div>
        </div>
      </div>
    </div>
  )
}
