import { Globe, Play, Settings } from 'lucide-react'
import { useState } from 'react'
import { normalizeUrl } from '../../utils/autoScraper'

export function UrlInputStep({ blogUrl, setBlogUrl, onStart }) {
  const [maxPosts, setMaxPosts] = useState(600)
  const [delayMs, setDelayMs] = useState(500)
  const [showConfig, setShowConfig] = useState(false)

  const isValid = blogUrl.trim().length > 0

  function handleStart() {
    if (!isValid) return
    const url = normalizeUrl(blogUrl)
    setBlogUrl(url)
    onStart({ blogUrl: url, maxPosts, delayMs })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-2xl mb-4">
          <Globe size={32} className="text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Auto Migrator</h2>
        <p className="text-zinc-400">
          Enter a WordPress blog URL to automatically scrape all posts,
          detect section types, and generate migration-ready HTML.
        </p>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Blog URL
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            value={blogUrl}
            onChange={e => setBlogUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            placeholder="https://blog.example.com"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
          />
          <button
            onClick={handleStart}
            disabled={!isValid}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Play size={16} />
            Start Scraping
          </button>
        </div>

        {/* Optional config toggle */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mt-4 transition-colors"
        >
          <Settings size={12} />
          {showConfig ? 'Hide' : 'Show'} options
        </button>

        {showConfig && (
          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-zinc-800">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Max posts</label>
              <input
                type="number"
                min={1}
                max={600}
                value={maxPosts}
                onChange={e => setMaxPosts(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Delay between requests (ms)</label>
              <input
                type="number"
                min={100}
                max={5000}
                step={100}
                value={delayMs}
                onChange={e => setDelayMs(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
