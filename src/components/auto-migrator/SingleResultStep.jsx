import { useState, useRef } from 'react'
import { Copy, Check, Download, RotateCcw } from 'lucide-react'
import { BLOG_CSS, PREVIEW_CSS } from '../../constants'
import { copyToClipboard } from '../../utils'
import { downloadCsv } from '../../utils/csvExport'

function getHandle(url) {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '')
    return path.split('/').pop() || 'single'
  } catch {
    return 'single'
  }
}

export function SingleResultStep({ result, onStartOver }) {
  const [activeTab, setActiveTab] = useState('html')
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [copiedCss, setCopiedCss] = useState(false)
  const [env, setEnv] = useState('staging')
  const [editableHtml, setEditableHtml] = useState(result.html || '')
  const outputPreviewRef = useRef(null)
  const handle = getHandle(result.url)

  const handleCopy = async (type) => {
    const text = type === 'html' ? editableHtml : BLOG_CSS
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

      {/* Section badges */}
      {result.sections?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {result.sections.map(s => (
            <span key={s.id} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
              {s.blockType}
            </span>
          ))}
        </div>
      )}

      {/* Two-column layout: code + preview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: HTML/CSS editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'html' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'css' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                CSS
              </button>
            </div>
            <button
              onClick={() => handleCopy(activeTab)}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              {(activeTab === 'html' ? copiedHtml : copiedCss) ? (
                <>
                  <Check size={14} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy {activeTab.toUpperCase()}
                </>
              )}
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[calc(100vh-320px)]">
            {activeTab === 'html' ? (
              <textarea
                value={editableHtml}
                onChange={(e) => setEditableHtml(e.target.value)}
                className="w-full h-full p-4 text-xs text-zinc-400 bg-zinc-900 overflow-auto font-mono whitespace-pre-wrap resize-none focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                spellCheck={false}
              />
            ) : (
              <pre className="p-4 text-xs text-zinc-400 overflow-auto h-full font-mono whitespace-pre-wrap">
                {BLOG_CSS}
              </pre>
            )}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Output Preview</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[calc(100vh-320px)]">
            <div
              ref={outputPreviewRef}
              className="p-6 bg-white text-black overflow-auto h-full prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: PREVIEW_CSS + editableHtml }}
            />
          </div>
        </div>
      </div>

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
    </div>
  )
}
