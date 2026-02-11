import { useState } from 'react'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { BLOG_CSS, PREVIEW_CSS } from '../../constants'
import { copyToClipboard } from '../../utils'

export function BuilderOutput({ generatedHtml, sectionCount, onBack }) {
  const [activeTab, setActiveTab] = useState('html')
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [copiedCss, setCopiedCss] = useState(false)

  const handleCopy = async (type) => {
    const text = type === 'html' ? generatedHtml : BLOG_CSS
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
      <div className="max-w-[1800px] mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Editor
          </button>
          <span className="text-sm text-zinc-400">{sectionCount} sections generated</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
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
              <pre className="p-4 text-xs text-zinc-400 overflow-auto h-full font-mono whitespace-pre-wrap">
                {activeTab === 'html' ? generatedHtml : BLOG_CSS}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Output Preview</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[calc(100vh-320px)]">
              <div
                className="p-6 bg-white text-black overflow-auto h-full prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: PREVIEW_CSS + generatedHtml }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <h3 className="font-medium text-sm mb-2 text-zinc-300">Next Steps:</h3>
          <ol className="text-sm text-zinc-500 space-y-1 list-decimal list-inside">
            <li>Copy the <span className="text-indigo-400">CSS</span> and add it to your Shopify theme stylesheet</li>
            <li>Copy the <span className="text-indigo-400">HTML</span></li>
            <li>In Shopify, go to your blog article editor and click <span className="text-indigo-400">"Show HTML"</span></li>
            <li>Paste the HTML and save</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
