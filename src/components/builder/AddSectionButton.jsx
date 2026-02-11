import { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { FIGMA_BLOCKS } from '../../constants'

export function AddSectionButton({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSelect = (blockType) => {
    onAdd(blockType)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full justify-center"
      >
        <Plus size={16} />
        Add Section
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl z-30 overflow-hidden">
          {Object.entries(FIGMA_BLOCKS).map(([key, block]) => {
            const Icon = block.icon
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-zinc-700 transition-colors text-left"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: block.color + '20' }}
                >
                  <Icon size={16} style={{ color: block.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white">{block.label}</div>
                  <div className="text-xs text-zinc-400 truncate">{block.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
