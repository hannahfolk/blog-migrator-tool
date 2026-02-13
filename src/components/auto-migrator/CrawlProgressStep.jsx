import { Loader2, Square, FileText, AlertTriangle, RotateCcw } from 'lucide-react'

export function CrawlProgressStep({ progress, completedPosts, onStop, onStartOver }) {
  const { phase, message, current, totalPosts } = progress
  const isError = phase === 'error'

  const pct = phase === 'processing' && totalPosts > 0
    ? Math.round((current / totalPosts) * 100)
    : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isError
              ? <AlertTriangle size={20} className="text-red-400" />
              : <Loader2 size={20} className="text-yellow-500 animate-spin" />
            }
            <h3 className="font-semibold text-lg">
              {isError ? 'Error' : phase === 'discovering' ? 'Discovering Posts...' : 'Processing Posts...'}
            </h3>
          </div>
          {isError ? (
            <button
              onClick={onStartOver}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <RotateCcw size={14} />
              Start Over
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Square size={14} />
              Stop
            </button>
          )}
        </div>

        {/* Progress bar */}
        {pct !== null && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-zinc-400 mb-1">
              <span>{current} / {totalPosts} posts</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Current status */}
        <p className="text-sm text-zinc-400 truncate mb-4">{message}</p>

        {/* Completed posts log */}
        {completedPosts.length > 0 && (
          <div className="border-t border-zinc-800 pt-4">
            <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">
              Completed ({completedPosts.length})
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {completedPosts.map((post, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-zinc-400 py-1"
                >
                  <FileText size={12} className={post.error ? 'text-red-400' : 'text-green-400'} />
                  <span className="truncate">{post.title}</span>
                  <span className="text-zinc-600 ml-auto flex-shrink-0">
                    {post.error ? 'Error' : `${post.sections.length} sections`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
