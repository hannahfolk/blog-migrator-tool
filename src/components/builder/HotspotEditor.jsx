import { useRef, useCallback, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { ShopifyImageInput } from './ShopifyImageInput'

export function HotspotEditor({ hotspotImage, hotspots, onChange }) {
  const imageRef = useRef(null)
  const [dragging, setDragging] = useState(null) // index of hotspot being dragged

  const updateImage = (field, value) => {
    onChange({
      hotspotImage: { ...hotspotImage, [field]: value },
      hotspots,
    })
  }

  const updateHotspots = (newHotspots) => {
    onChange({ hotspotImage, hotspots: newHotspots })
  }

  const updateHotspot = (index, field, value) => {
    const updated = hotspots.map((h, i) =>
      i === index ? { ...h, [field]: value } : h
    )
    updateHotspots(updated)
  }

  const removeHotspot = (index) => {
    updateHotspots(hotspots.filter((_, i) => i !== index))
  }

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
    // Don't place a new hotspot if we just finished dragging
    if (dragging !== null) return
    // Don't place if clicking on an existing marker
    if (e.target.closest('[data-hotspot-marker]')) return

    const pos = getPercentPosition(e)
    updateHotspots([...hotspots, { ...pos, label: '', href: '' }])
  }, [hotspots, dragging, getPercentPosition])

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
      onChange({ hotspotImage, hotspots: updated })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      // Delay clearing dragging state so the click handler doesn't fire
      requestAnimationFrame(() => setDragging(null))
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [hotspots, hotspotImage, onChange, getPercentPosition])

  const inputClass =
    'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500'

  return (
    <div className="space-y-4">
      {/* Image URL + Alt */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
          Hotspot Image
        </label>
        <div className="space-y-2 bg-zinc-800/50 rounded-lg p-3">
          <ShopifyImageInput
            value={hotspotImage?.src || ''}
            onChange={(src) => updateImage('src', src)}
            onLocalPreview={(src, previewSrc) => {
              onChange({
                hotspotImage: { ...hotspotImage, src, _previewSrc: previewSrc },
                hotspots,
              })
            }}
          />
          <div>
            <label className="block text-[10px] font-medium text-zinc-500 mb-1">
              Alt text {hotspotImage?.src && <span className="text-red-400">*</span>}
            </label>
            <input
              type="text"
              value={hotspotImage?.alt || ''}
              onChange={(e) => updateImage('alt', e.target.value)}
              placeholder="Alt text"
              className={`${inputClass} ${hotspotImage?.src && !hotspotImage?.alt?.trim() ? '!border-red-500' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Interactive image area */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
          Click image to place hotspots
        </label>
        {hotspotImage?.src ? (
          <div
            className="relative bg-zinc-800 rounded-lg overflow-hidden cursor-crosshair select-none"
            onClick={handleImageClick}
          >
            <img
              ref={imageRef}
              src={hotspotImage._previewSrc || hotspotImage.src}
              alt={hotspotImage.alt || ''}
              className="w-full block"
              draggable={false}
            />
            {/* Hotspot markers overlaid on image */}
            {hotspots.map((hotspot, index) => (
              <div
                key={index}
                data-hotspot-marker
                onMouseDown={(e) => handleMarkerMouseDown(e, index)}
                className="absolute flex items-center justify-center w-7 h-7 -ml-3.5 -mt-3.5 rounded-full bg-white text-zinc-900 text-xs font-bold shadow-lg cursor-grab active:cursor-grabbing ring-2 ring-orange-500 hover:ring-orange-400 transition-shadow"
                style={{
                  left: hotspot.left,
                  top: hotspot.top,
                }}
                title={`Hotspot ${index + 1}${hotspot.label ? `: ${hotspot.label}` : ''} — drag to move`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-800/50 border border-dashed border-zinc-700 rounded-lg p-8 text-center text-sm text-zinc-500">
            Enter an image URL above to start placing hotspots
          </div>
        )}
      </div>

      {/* Hotspot items list */}
      {hotspots.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
            Hotspot Items ({hotspots.length})
          </label>
          <div className="space-y-2">
            {hotspots.map((hotspot, index) => (
              <div
                key={index}
                className="bg-zinc-800/50 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-xs text-zinc-500">
                    ({hotspot.left}, {hotspot.top})
                  </span>
                  <button
                    onClick={() => removeHotspot(index)}
                    className="ml-auto p-1 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Remove hotspot"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={hotspot.label}
                  onChange={(e) => updateHotspot(index, 'label', e.target.value)}
                  placeholder="Label (e.g. Shop this look)"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={hotspot.href}
                  onChange={(e) => updateHotspot(index, 'href', e.target.value)}
                  placeholder="Link URL (e.g. https://...)"
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
