import React, { useState, useRef, useCallback } from 'react'
import { Square, Trash2, Pencil, GripVertical, Plus } from 'lucide-react'
import { FIGMA_BLOCKS } from '../../constants'

export function MappedSectionsList({ sections, onRemove, onEdit, onReorder, onAddDivider }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const listRef = useRef(null)

  const handleDragStart = useCallback((e, idx) => {
    setDragIndex(idx)
    e.dataTransfer.effectAllowed = 'move'
    // Required for Firefox
    e.dataTransfer.setData('text/plain', String(idx))
  }, [])

  const handleDragOver = useCallback((e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragIndex === null) return

    // Determine if we should drop above or below this item
    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const targetIndex = e.clientY < midY ? idx : idx + 1

    setDropIndex(targetIndex)
  }, [dragIndex])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    if (dragIndex !== null && dropIndex !== null && onReorder) {
      // Adjust target index if dragging downward
      const adjustedTarget = dropIndex > dragIndex ? dropIndex - 1 : dropIndex
      if (adjustedTarget !== dragIndex) {
        onReorder(dragIndex, adjustedTarget)
      }
    }
    setDragIndex(null)
    setDropIndex(null)
  }, [dragIndex, dropIndex, onReorder])

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDropIndex(null)
  }, [])

  if (sections.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 p-6">
          <Square size={32} className="mb-3 opacity-30" />
          <p className="text-sm text-center">Draw boxes on the preview to map sections</p>
        </div>
        {onAddDivider && (
          <div className="p-3 border-t border-zinc-800">
            <button
              onClick={onAddDivider}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Plus size={14} />
              <span>Add Divider</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {sections.map((selection, idx) => {
          const block = FIGMA_BLOCKS[selection.blockType]
          if (!block) return null

          const isDragging = dragIndex === idx
          const showDropBefore = dropIndex === idx && dragIndex !== idx && dragIndex !== idx - 1
          const showDropAfter = dropIndex === idx + 1 && dragIndex !== idx && dragIndex !== idx + 1

          return (
            <React.Fragment key={selection.id}>
              {showDropBefore && (
                <div className="h-0.5 bg-indigo-500 mx-3" />
              )}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`p-3 flex items-center gap-3 hover:bg-zinc-800/50 cursor-pointer transition-all group border-b border-zinc-800 ${
                  isDragging ? 'opacity-30' : ''
                }`}
                onClick={() => onEdit && onEdit(selection)}
              >
                <div
                  className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing shrink-0"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <GripVertical size={14} />
                </div>
                <span className="text-xs text-zinc-600 w-4 shrink-0">{idx + 1}</span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: block.color + '20' }}
                >
                  {React.createElement(block.icon, { size: 14, style: { color: block.color } })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{block.label}</p>
                  <p className="text-xs text-zinc-500 truncate max-w-[150px]">
                    {selection.blockType === 'hr'
                      ? (selection.hrColor || '#191c1f')
                      : (selection.extractedContent?.headings?.[0]?.text ||
                         selection.extractedContent?.paragraphs?.[0]?.text?.slice(0, 40) ||
                         selection.extractedContent?.images?.[0]?.alt ||
                         'Click to edit')}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit && onEdit(selection)
                    }}
                    className="text-zinc-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(selection.id)
                    }}
                    className="text-zinc-600 hover:text-red-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {showDropAfter && (
                <div className="h-0.5 bg-indigo-500 mx-3" />
              )}
            </React.Fragment>
          )
        })}
      </div>
      {onAddDivider && (
        <div className="p-3 border-t border-zinc-800 shrink-0">
          <button
            onClick={onAddDivider}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Plus size={14} />
            <span>Add Divider</span>
          </button>
        </div>
      )}
    </div>
  )
}
