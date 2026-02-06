import React from 'react'
import { Square, Trash2 } from 'lucide-react'
import { FIGMA_BLOCKS } from '../../constants'

export function MappedSectionsList({ sections, onRemove }) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600 p-6">
        <Square size={32} className="mb-3 opacity-30" />
        <p className="text-sm text-center">Draw boxes on the preview to map sections</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-800">
      {sections.map((selection, idx) => {
        const block = FIGMA_BLOCKS[selection.blockType]
        return (
          <div key={selection.id} className="p-3 flex items-center gap-3">
            <span className="text-xs text-zinc-600 w-4">{idx + 1}</span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: block.color + '20' }}
            >
              {React.createElement(block.icon, { size: 14, style: { color: block.color } })}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{block.label}</p>
            </div>
            <button onClick={() => onRemove(selection.id)} className="text-zinc-600 hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
