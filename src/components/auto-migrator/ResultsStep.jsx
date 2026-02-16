import { useState } from 'react'
import { Download, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'
import { PostDetailRow } from './PostDetailRow'
import { downloadCsv } from '../../utils/csvExport'

export function ResultsStep({ results, onStartOver }) {
  const [env, setEnv] = useState('staging')
  const successCount = results.filter(r => !r.error).length
  const errorCount = results.filter(r => r.error).length

  return (
    <div className="max-w-4xl mx-auto">
      {/* Summary header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Scraping Complete</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-green-400">
              <CheckCircle size={14} />
              {successCount} processed
            </span>
            {errorCount > 0 && (
              <span className="flex items-center gap-1.5 text-red-400">
                <AlertCircle size={14} />
                {errorCount} errors
              </span>
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
            onClick={() => downloadCsv(results, env)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Download size={14} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-800/50 text-xs text-zinc-500 uppercase tracking-wider font-medium border-b border-zinc-800">
          <span className="w-5" /> {/* chevron space */}
          <span className="w-8">#</span>
          <span className="flex-1">Title</span>
          <span className="w-24 text-right">Status</span>
          <span className="w-5" /> {/* link space */}
        </div>

        {/* Rows */}
        {results.map((post, i) => (
          <PostDetailRow key={i} post={post} index={i} />
        ))}

        {results.length === 0 && (
          <div className="text-center text-zinc-500 py-8">No results</div>
        )}
      </div>
    </div>
  )
}
