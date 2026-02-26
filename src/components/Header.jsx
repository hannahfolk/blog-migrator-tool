import { Zap, Wand2, Book, PenTool, Code } from 'lucide-react'

export function Header({ activeTab, setActiveTab }) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold">Blog Migration Tool</h1>

            {/* Main Tabs */}
            <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('auto-migrator')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'auto-migrator' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Zap size={16} />
                Auto Migrator
              </button>
              <button
                onClick={() => setActiveTab('migrator')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'migrator' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Wand2 size={16} />
                Migrator
              </button>
              <button
                onClick={() => setActiveTab('reference')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'reference' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Book size={16} />
                Section Reference
              </button>
              <button
                onClick={() => setActiveTab('builder')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'builder' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <PenTool size={16} />
                Post Builder
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'css' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Code size={16} />
                CSS
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
