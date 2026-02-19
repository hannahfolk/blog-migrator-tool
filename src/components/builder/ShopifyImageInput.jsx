import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { SHOPIFY_CDN } from '../../constants/shopifyCdn'
import { useBuilderEnv } from '../../utils/useBuilderEnv'

function transformFilenameForProd(filename) {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot > 0) {
    const stem = filename.substring(0, lastDot).replace(/\./g, '_')
    const ext = filename.substring(lastDot)
    return stem + ext
  }
  return filename
}

export function ShopifyImageInput({ value, onChange, onLocalPreview }) {
  const [env, setEnv] = useBuilderEnv()
  const fileRef = useRef(null)

  const base = SHOPIFY_CDN[env]

  // Extract filename from current value
  const getFilename = () => {
    if (!value) return ''
    for (const cdnBase of Object.values(SHOPIFY_CDN)) {
      if (value.startsWith(cdnBase)) {
        return value.slice(cdnBase.length)
      }
    }
    return value
  }

  const filename = getFilename()

  const handleFilenameChange = (newFilename) => {
    onChange(newFilename ? base + newFilename : '')
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    let name = file.name
    if (env === 'production') {
      name = transformFilenameForProd(name)
    }
    const cdnUrl = base + name
    const previewUrl = URL.createObjectURL(file)
    if (onLocalPreview) {
      onLocalPreview(cdnUrl, previewUrl)
    } else {
      onChange(cdnUrl)
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-zinc-900 rounded-md overflow-hidden text-xs border border-zinc-700">
          <button
            type="button"
            onClick={() => setEnv('production')}
            className={`px-2 py-1 font-medium transition-colors ${env === 'production' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Production
          </button>
          <button
            type="button"
            onClick={() => setEnv('staging')}
            className={`px-2 py-1 font-medium transition-colors ${env === 'staging' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Staging
          </button>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Upload size={12} />
          Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <div className="flex items-stretch bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden focus-within:border-indigo-500">
        <span className="px-2 py-2 text-[10px] text-zinc-500 bg-zinc-800 border-r border-zinc-700 flex items-center whitespace-nowrap shrink-0">
          {base}
        </span>
        <input
          type="text"
          value={filename}
          onChange={(e) => handleFilenameChange(e.target.value)}
          placeholder="filename.jpg"
          className="flex-1 bg-transparent px-2 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none min-w-0"
        />
      </div>
    </div>
  )
}
