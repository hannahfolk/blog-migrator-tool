import { useRef } from 'react'
import { Sparkles, ArrowRight, Eye } from 'lucide-react'
import { INPUT_PREVIEW_CSS } from '../../constants'

export function InputStep({ inputHtml, setInputHtml, onNext }) {
  const inputPreviewRef = useRef(null)

  return (
    <div className="h-full">
      <div className="max-w-[1800px] mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Paste WordPress HTML</h2>
            <p className="text-sm text-zinc-500">Paste your existing blog HTML to begin mapping</p>
          </div>
          <button
            onClick={onNext}
            disabled={!inputHtml.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Sparkles size={16} />
            Start Mapping
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Input HTML</h3>
              {inputHtml && (
                <button onClick={() => setInputHtml('')} className="text-xs text-zinc-600 hover:text-zinc-400">Clear</button>
              )}
            </div>
            <textarea
              value={inputHtml}
              onChange={(e) => setInputHtml(e.target.value)}
              placeholder="Paste your existing blog post HTML here..."
              className="w-full h-[calc(100vh-280px)] bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Live Preview</h3>
              {inputHtml && <span className="text-xs text-zinc-600">{inputHtml.length.toLocaleString()} chars</span>}
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[calc(100vh-280px)]">
              {!inputHtml ? (
                <div className="h-full flex items-center justify-center text-zinc-600">
                  <div className="text-center">
                    <Eye size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Preview will appear here</p>
                  </div>
                </div>
              ) : (
                <div
                  ref={inputPreviewRef}
                  className="p-6 bg-white text-black overflow-auto h-full prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: INPUT_PREVIEW_CSS + inputHtml }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
