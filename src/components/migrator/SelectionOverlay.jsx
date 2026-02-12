import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { FIGMA_BLOCKS } from '../../constants'

export function SelectionOverlay({
  selections,
  pendingSelections = [],
  currentRect,
  onUpdateRect,
  onDelete,
  onDeletePending
}) {
  const [dragState, setDragState] = useState(null)

  const handleDragStart = (e, selectionId, handle) => {
    e.stopPropagation()
    const selection = selections.find(s => s.id === selectionId)
    if (!selection) return

    setDragState({
      id: selectionId,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      originalRect: { ...selection.rect }
    })
  }

  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragState.startX
      const deltaY = e.clientY - dragState.startY
      const { originalRect, handle } = dragState

      let newRect = { ...originalRect }

      switch (handle) {
        case 'tl':
          newRect.x = originalRect.x + deltaX
          newRect.y = originalRect.y + deltaY
          newRect.width = originalRect.width - deltaX
          newRect.height = originalRect.height - deltaY
          break
        case 'tr':
          newRect.y = originalRect.y + deltaY
          newRect.width = originalRect.width + deltaX
          newRect.height = originalRect.height - deltaY
          break
        case 'bl':
          newRect.x = originalRect.x + deltaX
          newRect.width = originalRect.width - deltaX
          newRect.height = originalRect.height + deltaY
          break
        case 'br':
          newRect.width = originalRect.width + deltaX
          newRect.height = originalRect.height + deltaY
          break
        case 't':
          newRect.y = originalRect.y + deltaY
          newRect.height = originalRect.height - deltaY
          break
        case 'b':
          newRect.height = originalRect.height + deltaY
          break
        case 'l':
          newRect.x = originalRect.x + deltaX
          newRect.width = originalRect.width - deltaX
          break
        case 'r':
          newRect.width = originalRect.width + deltaX
          break
      }

      if (newRect.width < 50) {
        if (handle.includes('l')) {
          newRect.x = originalRect.x + originalRect.width - 50
        }
        newRect.width = 50
      }
      if (newRect.height < 30) {
        if (handle.includes('t')) {
          newRect.y = originalRect.y + originalRect.height - 30
        }
        newRect.height = 30
      }

      onUpdateRect(dragState.id, newRect)
    }

    const handleMouseUp = () => {
      setDragState(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, onUpdateRect])

  const handles = ['tl', 'tr', 'bl', 'br', 't', 'b', 'l', 'r']
  const handleCursors = {
    tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize',
    t: 'ns-resize', b: 'ns-resize', l: 'ew-resize', r: 'ew-resize'
  }
  const handlePositions = {
    tl: { top: -4, left: -4 }, tr: { top: -4, right: -4 },
    bl: { bottom: -4, left: -4 }, br: { bottom: -4, right: -4 },
    t: { top: -4, left: '50%', transform: 'translateX(-50%)' },
    b: { bottom: -4, left: '50%', transform: 'translateX(-50%)' },
    l: { top: '50%', left: -4, transform: 'translateY(-50%)' },
    r: { top: '50%', right: -4, transform: 'translateY(-50%)' }
  }

  return (
    <>
      {/* Confirmed selections with block types */}
      {selections.filter(s => s.rect).map((selection) => {
        const block = FIGMA_BLOCKS[selection.blockType]
        return (
          <div
            key={selection.id}
            className="absolute border-2 rounded-lg"
            style={{
              left: selection.rect.x,
              top: selection.rect.y,
              width: selection.rect.width,
              height: selection.rect.height,
              borderColor: block.color,
              backgroundColor: `${block.color}15`,
              pointerEvents: 'auto'
            }}
          >
            <div
              className="absolute -top-7 left-0 px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1.5"
              style={{ backgroundColor: block.color }}
            >
              {React.createElement(block.icon, { size: 12 })}
              {block.label}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(selection.id) }}
                className="ml-1 hover:bg-white/20 rounded p-0.5"
              >
                <X size={10} />
              </button>
            </div>

            {handles.map((handle) => (
              <div
                key={handle}
                onMouseDown={(e) => handleDragStart(e, selection.id, handle)}
                className="absolute w-3 h-3 bg-white border-2 rounded-sm"
                style={{
                  ...handlePositions[handle],
                  borderColor: block.color,
                  cursor: handleCursors[handle],
                  pointerEvents: 'auto'
                }}
              />
            ))}
          </div>
        )
      })}

      {/* Pending selections (waiting for block type assignment) */}
      {pendingSelections.map((selection, index) => (
        <div
          key={selection.id}
          className="absolute border-2 border-dashed border-indigo-400 rounded-lg bg-indigo-500/20"
          style={{
            left: selection.rect.x,
            top: selection.rect.y,
            width: selection.rect.width,
            height: selection.rect.height,
            pointerEvents: 'auto'
          }}
        >
          <div
            className="absolute -top-7 left-0 px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1.5 bg-indigo-500"
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
              {index + 1}
            </span>
            Pending
            {onDeletePending && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeletePending(selection.id) }}
                className="ml-1 hover:bg-white/20 rounded p-0.5"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Currently drawing rectangle */}
      {currentRect && (
        <div
          className="absolute border-2 border-dashed border-indigo-500 rounded-lg bg-indigo-500/10"
          style={{
            left: currentRect.x,
            top: currentRect.y,
            width: currentRect.width,
            height: currentRect.height,
            pointerEvents: 'none'
          }}
        />
      )}
    </>
  )
}
