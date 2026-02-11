import { useRef, useCallback, useState } from 'react'
import { Trash2, Target } from 'lucide-react'

const MAX_HOTSPOTS = 10

const inputClass =
  'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500'

export function ImageHotspots({ src, alt, hotspots = [], onChange }) {
  const imageRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const getPercentPosition = useCallback((e) => {
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    return {
      left: `${Math.max(0, Math.min(100, x)).toFixed(1)}%`,
      top: `${Math.max(0, Math.min(100, y)).toFixed(1)}%`,
    }
  }, [])

  const handleImageClick = useCallback((e) => {
    if (dragging !== null) return
    if (e.target.closest('[data-hotspot-marker]')) return
    if (hotspots.length >= MAX_HOTSPOTS) return

    const pos = getPercentPosition(e)
    onChange([...hotspots, { ...pos, label: '', href: '' }])
  }, [hotspots, dragging, getPercentPosition, onChange])

  const handleMarkerMouseDown = useCallback((e, index) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(index)

    const handleMouseMove = (moveEvent) => {
      if (!imageRef.current) return
      const pos = getPercentPosition(moveEvent)
      const updated = hotspots.map((h, i) =>
        i === index ? { ...h, ...pos } : h
      )
      onChange(updated)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      requestAnimationFrame(() => setDragging(null))
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [hotspots, onChange, getPercentPosition])

  const updateHotspot = (index, field, value) => {
    onChange(hotspots.map((h, i) => i === index ? { ...h, [field]: value } : h))
  }

  const removeHotspot = (index) => {
    onChange(hotspots.filter((_, i) => i !== index))
  }

  if (!src) return null

  return (
    <div className="space-y-2 mt-2">
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-1.5 text-xs transition-colors ${
          hotspots.length > 0 ? 'text-orange-400 hover:text-orange-300' : 'text-zinc-500 hover:text-zinc-400'
        }`}
      >
        <Target size={12} />
        {expanded ? 'Hide hotspots' : `Hotspots${hotspots.length > 0 ? ` (${hotspots.length})` : ''}`}
      </button>

      {expanded && (
        <div className="space-y-2">
          {/* Clickable image */}
          <div
            className="relative bg-zinc-800 rounded-lg overflow-hidden cursor-crosshair select-none"
            onClick={handleImageClick}
          >
            <img
              ref={imageRef}
              src={src}
              alt={alt || ''}
              className="w-full block"
              draggable={false}
            />
            {hotspots.map((hotspot, index) => (
              <div
                key={index}
                data-hotspot-marker
                onMouseDown={(e) => handleMarkerMouseDown(e, index)}
                className="absolute flex items-center justify-center w-6 h-6 -ml-3 -mt-3 rounded-full bg-white text-zinc-900 text-[10px] font-bold shadow-lg cursor-grab active:cursor-grabbing ring-2 ring-orange-500 hover:ring-orange-400 transition-shadow"
                style={{ left: hotspot.left, top: hotspot.top }}
                title={`Hotspot ${index + 1}${hotspot.label ? `: ${hotspot.label}` : ''} — drag to move`}
              >
                {index + 1}
              </div>
            ))}
            {hotspots.length >= MAX_HOTSPOTS && (
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-center text-xs text-zinc-300 py-1">
                Max {MAX_HOTSPOTS} hotspots reached
              </div>
            )}
          </div>

          {/* Hotspot items list */}
          {hotspots.length > 0 && (
            <div className="space-y-2">
              {hotspots.map((hotspot, index) => (
                <div key={index} className="bg-zinc-900/50 rounded-lg p-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      ({hotspot.left}, {hotspot.top})
                    </span>
                    <button
                      onClick={() => removeHotspot(index)}
                      className="ml-auto p-0.5 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Remove hotspot"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={hotspot.label}
                    onChange={(e) => updateHotspot(index, 'label', e.target.value)}
                    placeholder="Label"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={hotspot.href}
                    onChange={(e) => updateHotspot(index, 'href', e.target.value)}
                    placeholder="Link URL"
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
