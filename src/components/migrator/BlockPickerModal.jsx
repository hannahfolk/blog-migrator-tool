import React from 'react'
import { X } from 'lucide-react'
import { FIGMA_BLOCKS } from '../../constants'

export function BlockPickerModal({ selectionCount = 1, onSelect, onClose }) {
  const isMultiple = selectionCount > 1

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Select Block Type</h3>
            {isMultiple && (
              <p className="text-sm text-indigo-400 mt-1">
                Applying to {selectionCount} selections
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(FIGMA_BLOCKS).map(([key, block]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: block.color + '20' }}
              >
                {React.createElement(block.icon, { size: 20, style: { color: block.color } })}
              </div>
              <div>
                <p className="font-medium text-sm">{block.label}</p>
                <p className="text-xs text-zinc-500 line-clamp-1">{block.description}</p>
              </div>
            </button>
          ))}
        </div>
        {isMultiple && (
          <p className="text-xs text-zinc-500 mt-4 text-center">
            All {selectionCount} sections will be set to the same block type
          </p>
        )}
      </div>
    </div>
  )
}
