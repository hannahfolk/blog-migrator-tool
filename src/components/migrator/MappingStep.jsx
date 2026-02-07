import { useRef, useState, useCallback, useEffect } from 'react'
import { MousePointer2, Move, ArrowRight, Command } from 'lucide-react'
import { PREVIEW_CSS } from '../../constants'
import { extractContentFromRect } from '../../utils'
import { SelectionOverlay } from './SelectionOverlay'
import { MappedSectionsList } from './MappedSectionsList'
import { BlockPickerModal } from './BlockPickerModal'
import { EditSectionModal } from './EditSectionModal'

// Auto-scroll settings
const SCROLL_ZONE_SIZE = 60 // pixels from edge to trigger scroll
const SCROLL_SPEED = 15 // pixels per frame

export function MappingStep({
  inputHtml,
  selections,
  setSelections,
  onReset,
  onGenerate
}) {
  const [pendingSelections, setPendingSelections] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState(null)
  const [currentRect, setCurrentRect] = useState(null)
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingSection, setEditingSection] = useState(null)

  const previewRef = useRef(null)
  const previewContainerRef = useRef(null)
  const autoScrollRef = useRef(null)

  // Store refs for the drawing state to use in global event handlers
  const isDrawingRef = useRef(false)
  const drawStartRef = useRef(null)
  const currentRectRef = useRef(null)
  const isMultiSelectModeRef = useRef(false)

  // Keep refs in sync with state
  useEffect(() => {
    isDrawingRef.current = isDrawing
  }, [isDrawing])

  useEffect(() => {
    drawStartRef.current = drawStart
  }, [drawStart])

  useEffect(() => {
    currentRectRef.current = currentRect
  }, [currentRect])

  useEffect(() => {
    isMultiSelectModeRef.current = isMultiSelectMode
  }, [isMultiSelectMode])

  // Track cmd/ctrl key state
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        setIsMultiSelectMode(true)
      }
    }

    const handleKeyUp = (e) => {
      // Check if neither meta nor ctrl is pressed
      if (!e.metaKey && !e.ctrlKey) {
        setIsMultiSelectMode(false)
        // Show modal if there are pending selections and not currently drawing
        if (pendingSelections.length > 0 && !isDrawingRef.current) {
          setShowModal(true)
        }
      }
    }

    // Also handle when window loses focus (user releases key outside window)
    const handleBlur = () => {
      setIsMultiSelectMode(false)
      if (pendingSelections.length > 0 && !isDrawingRef.current) {
        setShowModal(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [pendingSelections.length])

  // Auto-scroll function
  const performAutoScroll = useCallback((clientY) => {
    if (!previewContainerRef.current || !isDrawingRef.current) return

    const container = previewContainerRef.current
    const containerRect = container.getBoundingClientRect()

    // Check if mouse is near top or bottom edge
    const distanceFromTop = clientY - containerRect.top
    const distanceFromBottom = containerRect.bottom - clientY

    let scrollAmount = 0

    if (distanceFromTop < SCROLL_ZONE_SIZE && distanceFromTop > -100) {
      // Near top - scroll up
      scrollAmount = -SCROLL_SPEED * (1 - distanceFromTop / SCROLL_ZONE_SIZE)
    } else if (distanceFromBottom < SCROLL_ZONE_SIZE && distanceFromBottom > -100) {
      // Near bottom - scroll down
      scrollAmount = SCROLL_SPEED * (1 - distanceFromBottom / SCROLL_ZONE_SIZE)
    }

    if (scrollAmount !== 0) {
      container.scrollTop += scrollAmount
    }

    return scrollAmount !== 0
  }, [])

  // Global mouse handlers for drawing - allows dragging outside the container
  useEffect(() => {
    if (!isDrawing) {
      // Clean up auto-scroll when not drawing
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current)
        autoScrollRef.current = null
      }
      return
    }

    let lastClientY = 0

    const autoScrollLoop = () => {
      if (isDrawingRef.current && performAutoScroll(lastClientY)) {
        // Update the rectangle based on new scroll position
        if (drawStartRef.current && previewContainerRef.current) {
          const rect = previewContainerRef.current.getBoundingClientRect()
          const scrollLeft = previewContainerRef.current.scrollLeft
          const scrollTop = previewContainerRef.current.scrollTop

          // Recalculate using the stored mouse position
          const x = lastClientY // We need X too, storing Y only for scroll
          // This will be updated properly in mousemove
        }
      }
      if (isDrawingRef.current) {
        autoScrollRef.current = requestAnimationFrame(autoScrollLoop)
      }
    }

    const handleGlobalMouseMove = (e) => {
      if (!isDrawingRef.current || !drawStartRef.current || !previewContainerRef.current) return

      lastClientY = e.clientY

      // Perform auto-scroll
      performAutoScroll(e.clientY)

      const rect = previewContainerRef.current.getBoundingClientRect()
      const scrollLeft = previewContainerRef.current.scrollLeft
      const scrollTop = previewContainerRef.current.scrollTop
      const x = e.clientX - rect.left + scrollLeft
      const y = e.clientY - rect.top + scrollTop

      const newRect = {
        x: Math.min(drawStartRef.current.x, x),
        y: Math.min(drawStartRef.current.y, y),
        width: Math.abs(x - drawStartRef.current.x),
        height: Math.abs(y - drawStartRef.current.y)
      }

      setCurrentRect(newRect)
      currentRectRef.current = newRect
    }

    const handleGlobalMouseUp = (e) => {
      if (!isDrawingRef.current) return

      // Stop auto-scroll
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current)
        autoScrollRef.current = null
      }

      const rect = currentRectRef.current

      if (rect && rect.width > 20 && rect.height > 20) {
        // Extract content from the selection area
        // Pass the scrollable container - it contains the preview content
        const extractedContent = extractContentFromRect(
          previewContainerRef.current,
          rect
        )

        const newSelection = {
          id: Date.now(),
          rect: rect,
          extractedContent
        }

        // Check if cmd/ctrl is currently held
        const isHoldingModifier = e.metaKey || e.ctrlKey

        if (isHoldingModifier) {
          // Add to pending selections, don't show modal yet
          setPendingSelections(prev => [...prev, newSelection])
        } else {
          // Single selection mode - add to pending and show modal immediately
          setPendingSelections(prev => [...prev, newSelection])
          setShowModal(true)
        }
      }

      setIsDrawing(false)
      setDrawStart(null)
      setCurrentRect(null)
      isDrawingRef.current = false
      drawStartRef.current = null
      currentRectRef.current = null
    }

    // Start auto-scroll loop
    autoScrollRef.current = requestAnimationFrame(autoScrollLoop)

    // Add global listeners
    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current)
      }
    }
  }, [isDrawing, performAutoScroll])

  const handleMouseDown = useCallback((e) => {
    // Only start drawing if clicking directly in the container (not on existing selections)
    if (!previewContainerRef.current) return

    const rect = previewContainerRef.current.getBoundingClientRect()
    const scrollLeft = previewContainerRef.current.scrollLeft
    const scrollTop = previewContainerRef.current.scrollTop
    const x = e.clientX - rect.left + scrollLeft
    const y = e.clientY - rect.top + scrollTop

    setIsDrawing(true)
    setDrawStart({ x, y })
    setCurrentRect({ x, y, width: 0, height: 0 })

    isDrawingRef.current = true
    drawStartRef.current = { x, y }
    currentRectRef.current = { x, y, width: 0, height: 0 }
  }, [])

  const handleBlockSelect = useCallback((blockType) => {
    if (pendingSelections.length === 0) return

    // Apply the block type to all pending selections
    const newSelections = pendingSelections.map(sel => ({
      ...sel,
      blockType
    }))

    setSelections(prev => [...prev, ...newSelections])
    setPendingSelections([])
    setShowModal(false)
  }, [pendingSelections, setSelections])

  const handleModalClose = useCallback(() => {
    // Clear pending selections when closing without selecting
    setPendingSelections([])
    setShowModal(false)
  }, [])

  const handleRemoveSelection = useCallback((id) => {
    setSelections(prev => prev.filter(s => s.id !== id))
  }, [setSelections])

  const handleRemovePendingSelection = useCallback((id) => {
    setPendingSelections(prev => {
      const newPending = prev.filter(s => s.id !== id)
      // If no more pending selections, close modal
      if (newPending.length === 0) {
        setShowModal(false)
      }
      return newPending
    })
  }, [])

  const handleUpdateRect = useCallback((id, newRect) => {
    setSelections(prev => prev.map(s => s.id === id ? { ...s, rect: newRect } : s))
  }, [setSelections])

  const handleEditSection = useCallback((section) => {
    setEditingSection(section)
  }, [])

  const handleSaveEdit = useCallback((updatedSection) => {
    setSelections(prev => prev.map(s => s.id === updatedSection.id ? updatedSection : s))
    setEditingSection(null)
  }, [setSelections])

  return (
    <div className="h-full">
      <div className="max-w-[1800px] mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={onReset} className="text-zinc-500 hover:text-white text-sm">← Start Over</button>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <MousePointer2 size={14} />
              <span>Draw boxes • Drag corners to resize</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className={`flex items-center gap-2 text-sm transition-colors ${isMultiSelectMode ? 'text-indigo-400' : 'text-zinc-500'}`}>
              <Command size={14} />
              <span>Hold ⌘/Ctrl for multi-select</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pendingSelections.length > 0 && (
              <span className="text-sm text-indigo-400">{pendingSelections.length} pending</span>
            )}
            <span className="text-sm text-zinc-500">{selections.length} section{selections.length !== 1 ? 's' : ''}</span>
            <button
              onClick={onGenerate}
              disabled={selections.length === 0}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Generate HTML
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Draw boxes to select sections
              </h3>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg">
                <Move size={12} className="text-zinc-500" />
                <span className="text-xs text-zinc-500">Drag corners to adjust • Auto-scrolls near edges</span>
              </div>
            </div>

            <div
              ref={previewContainerRef}
              className={`bg-zinc-900 border rounded-xl overflow-auto h-[calc(100vh-280px)] relative select-none transition-colors ${
                isMultiSelectMode ? 'border-indigo-500/50' : 'border-zinc-800'
              }`}
              style={{ cursor: 'crosshair' }}
              onMouseDown={handleMouseDown}
            >
              <div
                ref={previewRef}
                className="p-6 bg-white text-black min-h-full prose prose-sm max-w-none"
                style={{ pointerEvents: 'none' }}
                dangerouslySetInnerHTML={{ __html: PREVIEW_CSS + inputHtml }}
              />
              <div className="absolute inset-0 pointer-events-none">
                <SelectionOverlay
                  selections={selections}
                  pendingSelections={pendingSelections}
                  currentRect={currentRect}
                  onUpdateRect={handleUpdateRect}
                  onDelete={handleRemoveSelection}
                  onDeletePending={handleRemovePendingSelection}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Mapped Sections</h3>
              {selections.length > 0 && (
                <button onClick={() => setSelections([])} className="text-xs text-zinc-600 hover:text-red-400">Clear All</button>
              )}
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[calc(100vh-280px)] overflow-y-auto">
              <MappedSectionsList sections={selections} onRemove={handleRemoveSelection} onEdit={handleEditSection} />
            </div>
          </div>
        </div>
      </div>

      {showModal && pendingSelections.length > 0 && (
        <BlockPickerModal
          selectionCount={pendingSelections.length}
          onSelect={handleBlockSelect}
          onClose={handleModalClose}
        />
      )}

      {editingSection && (
        <EditSectionModal
          selection={editingSection}
          onSave={handleSaveEdit}
          onClose={() => setEditingSection(null)}
        />
      )}
    </div>
  )
}
