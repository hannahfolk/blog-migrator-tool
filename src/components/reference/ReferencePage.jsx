import { useState, useEffect } from 'react'
import { Copy, Check, ArrowUp } from 'lucide-react'
import { FIGMA_BLOCKS, BLOG_CSS } from '../../constants'
import { copyToClipboard } from '../../utils'
import { SectionCard } from './SectionCard'

export function ReferencePage() {
  const [copiedAll, setCopiedAll] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {Object.entries(FIGMA_BLOCKS).map(([key, section]) => {
          const Icon = section.icon
          return (
            <button
              key={key}
              onClick={() => document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center hover:border-zinc-600 transition-colors cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: section.color + '20' }}
              >
                <Icon size={18} style={{ color: section.color }} />
              </div>
              <p className="text-sm font-medium text-white">{section.label}</p>
            </button>
          )
        })}
      </div>

      {/* Section Cards */}
      <div className="space-y-6">
        {Object.entries(FIGMA_BLOCKS).map(([key, section]) => (
          <SectionCard key={key} id={`section-${key}`} sectionKey={key} section={section} />
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
      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 flex items-center gap-2 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-all ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp size={14} />
        Back to Top
      </button>
    </div>
  )
}
