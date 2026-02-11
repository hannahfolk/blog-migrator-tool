import React, { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { FIGMA_BLOCKS } from '../../constants'

export function EditSectionModal({ selection, onSave, onClose }) {
  const [blockType, setBlockType] = useState(selection?.blockType || 'fullWidth')
  const [editedContent, setEditedContent] = useState(selection?.extractedContent || {})

  useEffect(() => {
    if (selection) {
      setBlockType(selection.blockType)
      setEditedContent(selection.extractedContent || {})
    }
  }, [selection])

  const handleSave = () => {
    onSave({
      ...selection,
      blockType,
      extractedContent: editedContent
    })
  }

  const updateHeading = (index, value) => {
    setEditedContent(prev => ({
      ...prev,
      headings: prev.headings?.map((h, i) => i === index ? { ...h, text: value } : h) || []
    }))
  }

  const updateParagraph = (index, value) => {
    setEditedContent(prev => ({
      ...prev,
      paragraphs: prev.paragraphs?.map((p, i) => i === index ? { ...p, text: value, html: value } : p) || []
    }))
  }

  const updateImageAlt = (index, value) => {
    setEditedContent(prev => ({
      ...prev,
      images: prev.images?.map((img, i) => i === index ? { ...img, alt: value } : img) || []
    }))
  }

  const updateImageCaption = (index, value) => {
    setEditedContent(prev => ({
      ...prev,
      images: prev.images?.map((img, i) => i === index ? { ...img, caption: value } : img) || []
    }))
  }

  if (!selection) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="font-medium">Edit Section</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Block Type Selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Block Type</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(FIGMA_BLOCKS).map(([key, block]) => (
                <button
                  key={key}
                  onClick={() => setBlockType(key)}
                  className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                    blockType === key
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  {React.createElement(block.icon, {
                    size: 18,
                    style: { color: blockType === key ? block.color : '#71717a' }
                  })}
                  <span className="text-xs">{block.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Headings */}
          {editedContent.headings?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Headings</label>
              {editedContent.headings.map((heading, idx) => (
                <div key={idx} className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-zinc-500">H{heading.level}</span>
                  </div>
                  <input
                    type="text"
                    value={heading.text}
                    onChange={(e) => updateHeading(idx, e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Paragraphs */}
          {editedContent.paragraphs?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Paragraphs</label>
              {editedContent.paragraphs.map((para, idx) => (
                <textarea
                  key={idx}
                  value={para.text}
                  onChange={(e) => updateParagraph(idx, e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 mb-2 resize-none"
                />
              ))}
            </div>
          )}

          {/* Images */}
          {editedContent.images?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Images</label>
              {editedContent.images.map((img, idx) => (
                <div key={idx} className="flex gap-3 mb-3 p-3 bg-zinc-800/50 rounded-lg">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Alt Text</label>
                      <input
                        type="text"
                        value={img.alt}
                        onChange={(e) => updateImageAlt(idx, e.target.value)}
                        placeholder="Image description for accessibility"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Caption</label>
                      <input
                        type="text"
                        value={img.caption || ''}
                        onChange={(e) => updateImageCaption(idx, e.target.value)}
                        placeholder="Visible caption text"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <p className="text-xs text-zinc-600 truncate">{img.src}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hotspots */}
          {editedContent.hotspots?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Hotspots</label>
              {editedContent.hotspots.map((hotspot, idx) => (
                <div key={idx} className="p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex gap-3 mb-2">
                    <img
                      src={hotspot.image.src}
                      alt={hotspot.image.alt}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm font-medium">Hotspot Image</p>
                      <p className="text-xs text-zinc-500">{hotspot.items.length} clickable areas</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {hotspot.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center font-bold">
                          {item.marker || itemIdx + 1}
                        </span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lists */}
          {editedContent.lists?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Lists</label>
              {editedContent.lists.map((list, idx) => (
                <div key={idx} className="p-3 bg-zinc-800/50 rounded-lg mb-2">
                  <p className="text-xs text-zinc-500 mb-2">{list.type === 'ul' ? 'Unordered' : 'Ordered'} list</p>
                  <ul className="text-sm space-y-1">
                    {list.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <span className="text-zinc-500">{list.type === 'ul' ? '•' : `${itemIdx + 1}.`}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Videos */}
          {editedContent.videos?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Videos</label>
              {editedContent.videos.map((video, idx) => (
                <div key={idx} className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-sm">{video.title || 'Embedded Video'}</p>
                  <p className="text-xs text-zinc-500 truncate">{video.src}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
