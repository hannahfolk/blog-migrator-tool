import { useState, useEffect, useRef } from 'react'
import { Copy, Check, Download, RotateCcw, X, Monitor, Tablet, Smartphone } from 'lucide-react'
import { BLOG_CSS, RESALE_CSS, PREVIEW_CSS, RESALE_PREVIEW_CSS, rewriteImageCdnForOutput } from '../../constants'
import { copyToClipboard } from '../../utils'
import { downloadCsv, transformHtmlImages } from '../../utils/csvExport'
import { applySectionStyles } from '../../utils/resaleReportProcessor'
import { initSliders } from '../../utils/sliderInteractivity'

function getHandle(url) {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '')
    return path.split('/').pop() || 'single'
  } catch {
    return 'single'
  }
}

/**
 * Pick the friendliest available label for a section tag:
 * heading > h2/h3 title > author name > hero title > block type.
 * Truncates long labels and falls back to the block type when there is no
 * usable text.
 */
function getSectionLabel(s) {
  const c = s.extractedContent || {}
  let label = ''
  if (s.blockType === 'resaleHero') {
    label = c.title || c.eyebrow || ''
  } else if (s.blockType === 'resaleAuthor') {
    label = c.authorName || ''
  } else if (c.heading?.text) {
    label = c.heading.text
  } else if (c.headings?.[0]?.text) {
    label = c.headings[0].text
  }
  label = (label || '').trim()
  if (!label) return s.blockType
  return label.length > 32 ? label.slice(0, 30) + '…' : label
}

export function SingleResultStep({ result, onStartOver }) {
  const [activeTab, setActiveTab] = useState('html')
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [copiedCss, setCopiedCss] = useState(false)
  const [env, setEnv] = useState('staging')
  // Per-section style overrides keyed by section.id:
  // { 'section-3': { bg: '#f5f5f5', paddingTop: '64px', paddingBottom: '64px' } }
  const [sectionStyles, setSectionStyles] = useState({})
  const [modalSection, setModalSection] = useState(null) // section being color-picked
  const [previewSize, setPreviewSize] = useState('desktop') // 'desktop' | 'tablet' | 'mobile'
  const rawHtml = result.html || ''
  const [editableHtml, setEditableHtml] = useState(() =>
    rewriteImageCdnForOutput(transformHtmlImages(rawHtml, 'staging'))
  )
  const outputPreviewRef = useRef(null)
  const handle = getHandle(result.url)

  // Resale reports use a separate CSS bundle (resale-specific blocks
  // plus the shared blog CSS for reused blocks like threeUp/hotspot).
  const isResale = !!result.isResaleReport ||
    result.sections?.some(s => s.blockType?.startsWith('resale'))
  const cssForCopy = isResale ? RESALE_CSS : BLOG_CSS
  const cssForPreview = isResale ? RESALE_PREVIEW_CSS : PREVIEW_CSS
  const cssTabLabel = isResale ? 'RESALE CSS' : 'CSS'

  // Recompute editable HTML when env or per-section styles change.
  // applySectionStyles is a no-op if the styleMap is empty, so non-resale
  // results stay unaffected.
  useEffect(() => {
    const withImages = transformHtmlImages(rawHtml, env)
    const withStyles = applySectionStyles(withImages, sectionStyles)
    setEditableHtml(rewriteImageCdnForOutput(withStyles))
  }, [env, sectionStyles, rawHtml])

  // Wire interactive sliders (clickable dots + active-dot tracking) in the
  // preview pane whenever the rendered HTML or viewport size changes.
  useEffect(() => {
    return initSliders(outputPreviewRef.current)
  }, [editableHtml, previewSize])

  // Click a section tag → scroll the preview to that section AND open
  // the section-style modal for it.
  const handleSectionTagClick = (section) => {
    setModalSection(section)
    requestAnimationFrame(() => {
      const root = outputPreviewRef.current
      if (!root) return
      const target = root.querySelector(`[data-section-id="${section.id}"]`)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleStyleApply = (style) => {
    if (!modalSection) return
    setSectionStyles(prev => {
      const next = { ...prev }
      const hasAny = style && (style.bg || style.paddingTop || style.paddingBottom)
      if (hasAny) next[modalSection.id] = style
      else delete next[modalSection.id]
      return next
    })
    setModalSection(null)
  }

  const handleCopy = async (type) => {
    const text = type === 'html' ? editableHtml : cssForCopy
    const success = await copyToClipboard(text)
    if (success) {
      if (type === 'html') {
        setCopiedHtml(true)
        setTimeout(() => setCopiedHtml(false), 2000)
      } else {
        setCopiedCss(true)
        setTimeout(() => setCopiedCss(false), 2000)
      }
    }
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold mb-1">{result.title || 'Untitled'}</h2>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span>{result.sections?.length || 0} sections</span>
            {result.url && (
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors truncate max-w-sm">
                {result.url}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-800 rounded-lg overflow-hidden text-sm">
            <button
              onClick={() => setEnv('staging')}
              className={`px-3 py-2 font-medium transition-colors ${env === 'staging' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              Staging
            </button>
            <button
              onClick={() => setEnv('production')}
              className={`px-3 py-2 font-medium transition-colors ${env === 'production' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              Production
            </button>
          </div>
          <button
            onClick={onStartOver}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw size={14} />
            Start Over
          </button>
          <button
            onClick={() => downloadCsv([result], env, `blog-migration-${handle}.csv`)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Download size={14} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Section badges — horizontal row above the layout when NOT in desktop mode.
          In desktop mode they render as a vertical sidebar inside the layout below. */}
      {result.sections?.length > 0 && previewSize !== 'desktop' && (
        <div className="flex flex-wrap gap-2 mb-4">
          {result.sections.map(s => {
            const color = sectionStyles[s.id]?.bg
            const label = getSectionLabel(s)
            const hint = `${s.blockType}${isResale ? ' · click to scroll & set background color' : ' · click to scroll'}`
            return (
              <button
                key={s.id}
                onClick={() => handleSectionTagClick(s)}
                className="group flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded transition-colors max-w-[16rem]"
                title={hint}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm border border-zinc-600 flex-shrink-0"
                  style={{ backgroundColor: color || 'transparent' }}
                />
                <span className="truncate">{label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Layout:
          - Desktop: section tags sidebar (left) + (preview on top, HTML editor below) on right
          - Tablet/Mobile: HTML editor (left) + preview (right) with tags above */}
      {(() => {
        const editorPanel = (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('html')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'html' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >HTML</button>
                <button
                  onClick={() => setActiveTab('css')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'css' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >{cssTabLabel}</button>
              </div>
              <button
                onClick={() => handleCopy(activeTab)}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                {(activeTab === 'html' ? copiedHtml : copiedCss) ? (
                  <><Check size={14} />Copied!</>
                ) : (
                  <><Copy size={14} />Copy {activeTab.toUpperCase()}</>
                )}
              </button>
            </div>
            <div className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden ${previewSize === 'desktop' ? 'h-[320px]' : 'h-[calc(100vh-320px)]'}`}>
              {activeTab === 'html' ? (
                <textarea
                  value={editableHtml}
                  onChange={(e) => setEditableHtml(e.target.value)}
                  className="w-full h-full p-4 text-xs text-zinc-400 bg-zinc-900 overflow-auto font-mono whitespace-pre-wrap resize-none focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                  spellCheck={false}
                />
              ) : (
                <pre className="p-4 text-xs text-zinc-400 overflow-auto h-full font-mono whitespace-pre-wrap">
                  {cssForCopy}
                </pre>
              )}
            </div>
          </div>
        )

        const previewPanel = (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Output Preview</h3>
              <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
                {[
                  { key: 'mobile', label: 'Mobile (375)', icon: Smartphone },
                  { key: 'tablet', label: 'Tablet (768)', icon: Tablet },
                  { key: 'desktop', label: 'Desktop (full)', icon: Monitor },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPreviewSize(key)}
                    title={label}
                    aria-label={label}
                    className={`p-1.5 rounded-md transition-colors ${
                      previewSize === key ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  ><Icon size={14} /></button>
                ))}
              </div>
            </div>
            <div className={`bg-white border border-zinc-800 rounded-xl overflow-hidden ${previewSize === 'desktop' ? 'h-[calc(100vh-560px)] min-h-[400px]' : 'h-[calc(100vh-320px)]'}`}>
              <div className="h-full overflow-auto flex justify-center bg-white">
                <div
                  ref={outputPreviewRef}
                  className={`bg-white text-black prose prose-sm max-w-none ${isResale ? 'pb-6' : 'p-6'} w-full`}
                  style={{
                    containerType: 'inline-size',
                    maxWidth: previewSize === 'mobile' ? '375px' : previewSize === 'tablet' ? '768px' : '100%',
                    minHeight: '100%',
                  }}
                  dangerouslySetInnerHTML={{ __html: cssForPreview + editableHtml }}
                />
              </div>
            </div>
          </div>
        )

        const sidebarTags = (
          <div className="space-y-4">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Sections ({result.sections?.length || 0})</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 h-[calc(100vh-260px)] overflow-y-auto space-y-1">
              {result.sections?.map(s => {
                const color = sectionStyles[s.id]?.bg
                const label = getSectionLabel(s)
                const hint = `${s.blockType}${isResale ? ' · click to scroll & set background color' : ' · click to scroll'}`
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSectionTagClick(s)}
                    className="group flex items-center gap-2 text-xs bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 px-2 py-1.5 rounded transition-colors w-full text-left"
                    title={hint}
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-sm border border-zinc-600 flex-shrink-0"
                      style={{ backgroundColor: color || 'transparent' }}
                    />
                    <span className="truncate">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )

        if (previewSize === 'desktop') {
          return (
            <div className="grid grid-cols-[220px_1fr] gap-4">
              {sidebarTags}
              <div className="space-y-6">
                {previewPanel}
                {editorPanel}
              </div>
            </div>
          )
        }
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {editorPanel}
            {previewPanel}
          </div>
        )
      })()}

      {/* Next steps */}
      <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <h3 className="font-medium text-sm mb-2 text-zinc-300">Next Steps:</h3>
        <ol className="text-sm text-zinc-500 space-y-1 list-decimal list-inside">
          <li>Copy the <span className="text-yellow-400">CSS</span> and add it to your Shopify theme stylesheet</li>
          <li>Copy the <span className="text-yellow-400">HTML</span></li>
          <li>In Shopify, go to your blog article editor and click <span className="text-yellow-400">"Show HTML"</span></li>
          <li>Paste the HTML and save</li>
        </ol>
      </div>

      {modalSection && (
        <SectionStyleModal
          section={modalSection}
          currentStyle={sectionStyles[modalSection.id] || {}}
          onApply={handleStyleApply}
          onClose={() => setModalSection(null)}
        />
      )}
    </div>
  )
}

function SectionStyleModal({ section, currentStyle, onApply, onClose }) {
  const [color, setColor] = useState(currentStyle?.bg || '#ffffff')
  const [paddingTop, setPaddingTop] = useState(stripPx(currentStyle?.paddingTop))
  const [paddingBottom, setPaddingBottom] = useState(stripPx(currentStyle?.paddingBottom))

  function normalizeHex(input) {
    let v = input.trim()
    if (!v.startsWith('#')) v = '#' + v
    return v
  }

  function isValidHex(input) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(input.trim())
  }

  const normalized = normalizeHex(color)
  const validHex = isValidHex(normalized)

  function buildStyle() {
    return {
      bg: validHex ? normalized : '',
      paddingTop: paddingTop !== '' ? `${paddingTop}px` : '',
      paddingBottom: paddingBottom !== '' ? `${paddingBottom}px` : '',
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 w-[440px] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Section Style</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {section.blockType} · {section.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
              Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={validHex ? normalized.slice(0, 7) : '#ffffff'}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 rounded-lg border border-zinc-700 bg-transparent cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#f5f5f5"
                className={`flex-1 bg-zinc-800 border rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 ${validHex ? 'border-zinc-700 focus:ring-yellow-500/50' : 'border-red-500 focus:ring-red-500/50'}`}
              />
            </div>
            <div
              className="mt-3 h-12 rounded-lg border border-zinc-700"
              style={{ backgroundColor: validHex ? normalized : 'transparent' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
                Padding Top
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={paddingTop}
                  onChange={(e) => setPaddingTop(e.target.value)}
                  placeholder="64"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-3 pr-8 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">px</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
                Padding Bottom
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={paddingBottom}
                  onChange={(e) => setPaddingBottom(e.target.value)}
                  placeholder="64"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-3 pr-8 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">px</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              onClick={() => onApply({})}
              className="text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Reset all
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="text-xs text-zinc-300 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onApply(buildStyle())}
                disabled={!validHex && color.trim() !== ''}
                className="text-xs font-semibold text-black px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-700 disabled:text-zinc-500 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function stripPx(v) {
  if (!v) return ''
  return String(v).replace(/px$/i, '')
}
