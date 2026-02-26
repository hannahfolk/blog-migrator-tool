import { Download } from 'lucide-react'
import { BLOG_CSS_EXPORT } from '../constants'

export function CssPage() {
  const handleDownload = () => {
    const blob = new Blob([BLOG_CSS_EXPORT], { type: 'text/css;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'blog-css.css'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Blog CSS</h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Download size={14} />
          Download CSS
        </button>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[calc(100vh-180px)]">
        <pre className="p-4 text-xs text-zinc-400 overflow-auto h-full font-mono whitespace-pre-wrap">
          {BLOG_CSS_EXPORT}
        </pre>
      </div>
    </div>
  )
}
