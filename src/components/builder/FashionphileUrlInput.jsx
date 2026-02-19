import { useBuilderEnv } from '../../utils/useBuilderEnv'

export const FASHIONPHILE_BASE = {
  production: 'https://www.fashionphile.com/',
  staging: 'https://www.staging.fashionphile.com/',
}

export function FashionphileUrlInput({ value, onChange }) {
  const [env, setEnv] = useBuilderEnv()

  const base = FASHIONPHILE_BASE[env]

  const getPath = () => {
    if (!value) return ''
    for (const urlBase of Object.values(FASHIONPHILE_BASE)) {
      if (value.startsWith(urlBase)) {
        return value.slice(urlBase.length)
      }
    }
    return value
  }

  const path = getPath()

  const handlePathChange = (newPath) => {
    onChange(newPath ? base + newPath : '')
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
      </div>
      <div className="flex items-stretch bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden focus-within:border-indigo-500">
        <span className="px-2 py-2 text-[10px] text-zinc-500 bg-zinc-800 border-r border-zinc-700 flex items-center whitespace-nowrap shrink-0">
          {base}
        </span>
        <input
          type="text"
          value={path}
          onChange={(e) => handlePathChange(e.target.value)}
          placeholder="shop/brands/louis-vuitton"
          className="flex-1 bg-transparent px-2 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none min-w-0"
        />
      </div>
    </div>
  )
}
