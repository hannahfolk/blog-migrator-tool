import { ChevronDown, ChevronRight, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function PostDetailRow({ post, index }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(post.html).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const statusColor = post.error ? 'text-red-400' : 'text-green-400'
  const statusText = post.error ? 'Error' : `${post.sections.length} sections`

  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      {/* Row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left"
      >
        {expanded
          ? <ChevronDown size={14} className="text-zinc-500 flex-shrink-0" />
          : <ChevronRight size={14} className="text-zinc-500 flex-shrink-0" />
        }
        <span className="text-zinc-500 text-sm w-8 flex-shrink-0">{index + 1}</span>
        <span className="font-medium truncate flex-1">{post.title}</span>
        <span className={`text-xs ${statusColor} flex-shrink-0`}>{statusText}</span>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-zinc-500 hover:text-zinc-300 flex-shrink-0"
        >
          <ExternalLink size={14} />
        </a>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4">
          {post.error ? (
            <p className="text-sm text-red-400 bg-red-500/5 rounded-lg p-3">{post.error}</p>
          ) : (
            <>
              {/* Section summary */}
              <div className="flex flex-wrap gap-2 mb-3">
                {post.sections.map(s => (
                  <span
                    key={s.id}
                    className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded"
                  >
                    {s.blockType}
                  </span>
                ))}
              </div>

              {/* HTML preview */}
              <div className="relative">
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 flex items-center gap-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-2 py-1 rounded transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-400 overflow-x-auto max-h-80 overflow-y-auto">
                  <code>{post.html || '(no output)'}</code>
                </pre>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
