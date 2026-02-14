import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { FIGMA_BLOCKS, BLOG_CSS, HTML_TEMPLATES, PREVIEW_HTML } from '../../constants'
import { copyToClipboard } from '../../utils'

export function SectionCard({ id, sectionKey, section }) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')
  const Icon = section.icon
  const html = HTML_TEMPLATES[sectionKey]
  const previewHtml = PREVIEW_HTML[sectionKey]

  const getSectionCss = () => {
    const lines = BLOG_CSS.split('\n')
    const startMarkers = {
      fullWidth: 'FULL WIDTH SECTION',
      oneUp: '1-UP SECTION',
      twoUp: '2-UP SECTION',
      threeUp: '3-UP SECTION',
      video: 'VIDEO SECTION',
      twoByTwo: '2 x 2 SECTION',
      threeByTwo: '3 x 2 SECTION',
      richText: 'RICH TEXT SECTION',
      hotspot: 'HOTSPOT SECTION',
      authorByline: 'AUTHOR BYLINE SECTION',
    }

    const marker = startMarkers[sectionKey]
    let inSection = false
    let css = []

    for (const line of lines) {
      if (line.includes(marker)) {
        inSection = true
      } else if (inSection && line.includes('/* ----') && line.includes('SECTION')) {
        break
      }

      if (inSection) {
        css.push(line)
      }
    }

    return css.join('\n')
  }

  const sectionCss = getSectionCss()

  const handleCopy = async () => {
    const textToCopy = activeTab === 'css' ? sectionCss : html
    const success = await copyToClipboard(textToCopy)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div id={id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden scroll-mt-4">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: section.color + '20' }}
        >
          <Icon size={20} style={{ color: section.color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{section.label}</h3>
          <p className="text-xs text-zinc-500">{section.description}</p>
        </div>
        <div className="text-xs text-zinc-600 font-mono">{section.prefix}__*</div>
      </div>

      {/* Class List */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Classes:</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            '',
            ...(!['hr', 'authorByline', 'hotspot'].includes(sectionKey) ? ['__heading', '__body'] : []),
            ...(sectionKey === 'fullWidth' ? ['__figure', '__image'] : []),
            ...(sectionKey === 'oneUp' ? ['__figure', '__image', '__label'] : []),
            ...(sectionKey === 'twoUp' ? ['__grid', '__item', '__image', '__label', '__cta', '__cta-btn'] : []),
            ...(sectionKey === 'threeUp' ? ['__grid', '__item', '__image', '__label', '__cta', '__cta-btn'] : []),
            ...(sectionKey === 'video' ? ['__wrapper', '__iframe'] : []),
            ...(sectionKey === 'twoByTwo' ? ['__grid', '__item', '__image', '__label', '__cta', '__cta-btn'] : []),
            ...(sectionKey === 'threeByTwo' ? ['__grid', '__item', '__image', '__label', '__cta', '__cta-btn'] : []),
            ...(sectionKey === 'hotspot' ? ['__inner', '__image', '__item', '__marker', '__label'] : []),
            ...(sectionKey === 'authorByline' ? ['__text', '__prefix', '__title'] : []),
          ].map((suffix, idx) => (
            <code
              key={idx}
              className="text-[11px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded font-mono"
            >
              {section.prefix}{suffix}
            </code>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('html')}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'html' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          HTML
        </button>
        <button
          onClick={() => setActiveTab('css')}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'css' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          CSS
        </button>
        {activeTab !== 'preview' && (
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 border-l border-zinc-800"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'preview' && (
          <div className="bg-white rounded-lg p-6 overflow-auto">
            <style>{BLOG_CSS}</style>
            <div
              className="text-black"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        )}

        {activeTab === 'html' && (
          <pre className="bg-zinc-800 rounded-lg p-4 text-xs text-zinc-300 overflow-auto max-h-[400px] font-mono whitespace-pre-wrap">
            {html}
          </pre>
        )}

        {activeTab === 'css' && (
          <pre className="bg-zinc-800 rounded-lg p-4 text-xs text-zinc-300 overflow-auto max-h-[400px] font-mono whitespace-pre-wrap">
            {sectionCss}
          </pre>
        )}
      </div>
    </div>
  )
}
