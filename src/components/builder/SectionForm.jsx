import { FIGMA_BLOCKS } from '../../constants'
import { RichTextEditor } from './RichTextEditor'
import { HotspotEditor } from './HotspotEditor'
import { ImageHotspots } from './ImageHotspots'

function ImageField({ image, index, onChange, showLabel = true }) {
  return (
    <div className="space-y-2 bg-zinc-800/50 rounded-lg p-3">
      <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
        Image {index + 1}
      </div>
      <input
        type="text"
        value={image.src || ''}
        onChange={(e) => onChange({ ...image, src: e.target.value })}
        placeholder="Image URL"
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
      />
      <input
        type="text"
        value={image.alt || ''}
        onChange={(e) => onChange({ ...image, alt: e.target.value })}
        placeholder="Alt text"
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
      />
      {showLabel && (
        <input
          type="text"
          value={image.label || ''}
          onChange={(e) => onChange({ ...image, label: e.target.value })}
          placeholder="Image label"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
        />
      )}
      <ImageHotspots
        src={image.src || ''}
        alt={image.alt || ''}
        hotspots={image.hotspots || []}
        onChange={(hotspots) => onChange({ ...image, hotspots })}
      />
    </div>
  )
}

export function SectionForm({ section, onChange }) {
  const block = FIGMA_BLOCKS[section.blockType]
  if (!block) return null

  const updateField = (field, value) => {
    onChange({ ...section, [field]: value })
  }

  const updateImage = (index, imageData) => {
    const images = [...(section.images || [])]
    images[index] = imageData
    onChange({ ...section, images })
  }

  const updateCta = (index, field, value) => {
    const ctas = [...(section.ctas || [])]
    ctas[index] = { ...(ctas[index] || {}), [field]: value }
    onChange({ ...section, ctas })
  }

  const showLabel = section.blockType !== 'fullWidth'

  return (
    <div className="space-y-4 p-4">
      {/* Heading */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
          Section Heading <span className="normal-case font-normal text-zinc-600">(renders as h2)</span>
        </label>
        <input
          type="text"
          value={section.heading || ''}
          onChange={(e) => updateField('heading', e.target.value)}
          placeholder="Enter heading text"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
          Body Content
        </label>
        <RichTextEditor
          value={section.body || ''}
          onChange={(html) => updateField('body', html)}
          placeholder="Type body content here..."
        />
      </div>

      {/* Images */}
      {block.hasImages && (
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
            {block.imageCount === 1 ? 'Image' : `Images (${block.imageCount})`}
          </label>
          <div className="space-y-3">
            {Array.from({ length: block.imageCount }, (_, i) => (
              <ImageField
                key={i}
                image={section.images?.[i] || {}}
                index={i}
                onChange={(img) => updateImage(i, img)}
                showLabel={showLabel}
              />
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      {block.hasCTA && (
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
            {block.imageCount > 1
              ? `Calls to Action (${block.imageCount})`
              : 'Call to Action'}
          </label>
          <div className="space-y-3">
            {Array.from({ length: block.imageCount }, (_, i) => (
              <div key={i} className="space-y-2 bg-zinc-800/50 rounded-lg p-3">
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Button {i + 1}
                </div>
                <input
                  type="text"
                  value={section.ctas?.[i]?.text || ''}
                  onChange={(e) => updateCta(i, 'text', e.target.value)}
                  placeholder="Button text (e.g. Shop Now)"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={section.ctas?.[i]?.href || ''}
                  onChange={(e) => updateCta(i, 'href', e.target.value)}
                  placeholder="Button URL (e.g. https://...)"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video */}
      {section.blockType === 'video' && (
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
            Video
          </label>
          <div className="space-y-2 bg-zinc-800/50 rounded-lg p-3">
            <input
              type="text"
              value={section.videoUrl || ''}
              onChange={(e) => updateField('videoUrl', e.target.value)}
              placeholder="YouTube embed URL (e.g. https://www.youtube.com/embed/...)"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={section.videoTitle || ''}
              onChange={(e) => updateField('videoTitle', e.target.value)}
              placeholder="Video title"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Hotspot */}
      {section.blockType === 'hotspot' && (
        <HotspotEditor
          hotspotImage={section.hotspotImage || { src: '', alt: '' }}
          hotspots={section.hotspots || []}
          onChange={({ hotspotImage, hotspots }) => {
            onChange({ ...section, hotspotImage, hotspots })
          }}
        />
      )}
    </div>
  )
}
