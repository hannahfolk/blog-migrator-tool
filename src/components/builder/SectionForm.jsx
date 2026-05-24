import { FIGMA_BLOCKS } from '../../constants'
import { RichTextEditor } from './RichTextEditor'
import { HotspotEditor } from './HotspotEditor'
import { ImageHotspots } from './ImageHotspots'
import { ShopifyImageInput } from './ShopifyImageInput'
import { FashionphileUrlInput } from './FashionphileUrlInput'

function ImageField({ image, index, onChange, showLabel = true }) {
  const hasSrc = Boolean(image.src)
  const missingAlt = hasSrc && !image.alt?.trim()

  return (
    <div className="space-y-2 bg-zinc-800/50 rounded-lg p-3">
      <div className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
        Image {index + 1}
      </div>
      <ShopifyImageInput
        value={image.src || ''}
        onChange={(src) => onChange({ ...image, src })}
        onLocalPreview={(src, previewSrc) => onChange({ ...image, src, _previewSrc: previewSrc })}
      />
      <div>
        <label className="block text-[10px] font-medium text-zinc-500 mb-1">
          Alt text {hasSrc && <span className="text-red-400">*</span>}
        </label>
        <input
          type="text"
          value={image.alt || ''}
          onChange={(e) => onChange({ ...image, alt: e.target.value })}
          placeholder="Alt text"
          className={`w-full bg-zinc-900 border rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 ${missingAlt ? 'border-red-500' : 'border-zinc-700'}`}
        />
      </div>
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
  const isHr = section.blockType === 'hr'
  const isAuthorByline = section.blockType === 'authorByline'
  const isResaleHero = section.blockType === 'resaleHero'
  const isResaleRichText = section.blockType === 'resaleRichText'
  const isResaleSlider = section.blockType === 'resaleSlider'
  const isResaleImageText = section.blockType === 'resaleImageText'
  const isResaleAuthor = section.blockType === 'resaleAuthor'

  if (isResaleAuthor) {
    return (
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
            Intro Paragraph (optional)
          </label>
          <RichTextEditor
            value={section.body || ''}
            onChange={(html) => updateField('body', html)}
            placeholder="Optional context shown above the avatar"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
            Avatar Image
          </label>
          <ImageField
            image={section.images?.[0] || {}}
            index={0}
            onChange={(img) => updateImage(0, img)}
            showLabel={false}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={section.authorName || ''}
            onChange={(e) => updateField('authorName', e.target.value)}
            placeholder="e.g. Sarah Ambrosius"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
            Title (optional)
          </label>
          <input
            type="text"
            value={section.authorTitle || ''}
            onChange={(e) => updateField('authorTitle', e.target.value)}
            placeholder="e.g. Head of Impact"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    )
  }

  if (isResaleHero) {
    return (
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Eyebrow</label>
          <input
            type="text"
            value={section.eyebrow || ''}
            onChange={(e) => updateField('eyebrow', e.target.value)}
            placeholder="e.g. 2025 ULTRA-LUXURY"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Title</label>
          <input
            type="text"
            value={section.heading || ''}
            onChange={(e) => updateField('heading', e.target.value)}
            placeholder="e.g. RESALE REPORT"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Background Image</label>
          <ImageField
            image={section.images?.[0] || {}}
            index={0}
            onChange={(img) => updateImage(0, img)}
            showLabel={false}
          />
        </div>
      </div>
    )
  }

  if (isResaleRichText) {
    return (
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Heading</label>
          <div className="flex gap-2">
            <select
              value={section.headingTag || 'h2'}
              onChange={(e) => updateField('headingTag', e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
            </select>
            <input
              type="text"
              value={section.heading || ''}
              onChange={(e) => updateField('heading', e.target.value)}
              placeholder="Section heading"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Body</label>
          <RichTextEditor
            value={section.body || ''}
            onChange={(html) => updateField('body', html)}
            placeholder="Type body content here..."
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Align</label>
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
            {['left', 'center'].map(a => (
              <button
                key={a}
                onClick={() => updateField('align', a)}
                className={`px-3 py-1 text-xs rounded-md ${
                  (section.align || 'left') === a ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >{a}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 ml-auto">
            <input
              type="checkbox"
              checked={!!section.showMore}
              onChange={(e) => updateField('showMore', e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900"
            />
            <span className="text-xs text-zinc-300">Show more toggle</span>
          </label>
        </div>
      </div>
    )
  }

  if (isResaleImageText) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-4">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Image position</label>
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
            {['left', 'right'].map(p => (
              <button
                key={p}
                onClick={() => updateField('imagePosition', p)}
                className={`px-3 py-1 text-xs rounded-md ${
                  (section.imagePosition || 'left') === p ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >{p}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Image</label>
          <ImageField
            image={section.images?.[0] || {}}
            index={0}
            onChange={(img) => updateImage(0, img)}
            showLabel={false}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Heading</label>
          <input
            type="text"
            value={section.heading || ''}
            onChange={(e) => updateField('heading', e.target.value)}
            placeholder="Section heading"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Body</label>
          <RichTextEditor
            value={section.body || ''}
            onChange={(html) => updateField('body', html)}
            placeholder="Type body content here..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Eyebrow (small label above list)</label>
          <input
            type="text"
            value={section.eyebrow || ''}
            onChange={(e) => updateField('eyebrow', e.target.value)}
            placeholder="e.g. TOP-SHOPPED STYLE"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">Ranked List HTML</label>
          <textarea
            value={section.listHtml || ''}
            onChange={(e) => updateField('listHtml', e.target.value)}
            placeholder="<ol><li><a href=...>Name</a></li>...</ol>"
            rows={5}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>
    )
  }

  if (isResaleSlider) {
    const slides = section.slides || []
    const updateSlide = (i, field, value) => {
      const next = [...slides]
      next[i] = { ...(next[i] || {}), [field]: value }
      onChange({ ...section, slides: next })
    }
    const addSlide = () => onChange({ ...section, slides: [...slides, { rank: String(slides.length + 1) }] })
    const removeSlide = (i) => onChange({ ...section, slides: slides.filter((_, idx) => idx !== i) })

    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Slides ({slides.length})</label>
          <button
            onClick={addSlide}
            className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-xs font-medium"
          >
            + Add slide
          </button>
        </div>
        {slides.map((slide, i) => (
          <div key={i} className="bg-zinc-800/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Slide {i + 1}</span>
              <button onClick={() => removeSlide(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={slide.rank || ''}
                onChange={(e) => updateSlide(i, 'rank', e.target.value)}
                placeholder="Rank (e.g. 1)"
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={slide.label || ''}
                onChange={(e) => updateSlide(i, 'label', e.target.value)}
                placeholder="Label (e.g. Speedy)"
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <input
              type="text"
              value={slide.href || ''}
              onChange={(e) => updateSlide(i, 'href', e.target.value)}
              placeholder="Link href"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={slide.desc || ''}
              onChange={(e) => updateSlide(i, 'desc', e.target.value)}
              placeholder="Description (e.g. Louis Vuitton)"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={slide.src || ''}
              onChange={(e) => updateSlide(i, 'src', e.target.value)}
              placeholder="Image URL"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono"
            />
            <input
              type="text"
              value={slide.alt || ''}
              onChange={(e) => updateSlide(i, 'alt', e.target.value)}
              placeholder="Image alt text"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
    )
  }

  if (isAuthorByline) {
    return (
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
            Author Name
          </label>
          <input
            type="text"
            value={section.authorName || ''}
            onChange={(e) => updateField('authorName', e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
            Author Title
          </label>
          <input
            type="text"
            value={section.authorTitle || ''}
            onChange={(e) => updateField('authorTitle', e.target.value)}
            placeholder="e.g. Staff Writer, FASHIONPHILE"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    )
  }

  if (isHr) {
    return (
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
            Line Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={section.hrColor || '#191c1f'}
              onChange={(e) => updateField('hrColor', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-zinc-700 bg-transparent"
            />
            <input
              type="text"
              value={section.hrColor || '#191c1f'}
              onChange={(e) => updateField('hrColor', e.target.value)}
              placeholder="#191c1f"
              className="w-32 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div
            className="mt-3 rounded"
            style={{ height: '1px', backgroundColor: section.hrColor || '#191c1f' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Heading */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
          Section Heading
        </label>
        <div className="flex gap-2">
          <select
            value={section.headingTag || 'h2'}
            onChange={(e) => updateField('headingTag', e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="h4">H4</option>
          </select>
          <input
            type="text"
            value={section.heading || ''}
            onChange={(e) => updateField('heading', e.target.value)}
            placeholder="Enter heading text"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        {(section.headingTag || 'h2') === 'h2' && section.heading?.trim() && (
          <p className="text-[10px] text-zinc-500 mt-1">H2 headings start a new section group</p>
        )}
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
                <FashionphileUrlInput
                  value={section.ctas?.[i]?.href || ''}
                  onChange={(href) => updateCta(i, 'href', href)}
                />
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500 mb-1">Style</label>
                  <select
                    value={section.ctas?.[i]?.style || 'solid-black'}
                    onChange={(e) => updateCta(i, 'style', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="outline">Outline</option>
                    <option value="solid-black">Solid Black</option>
                    <option value="solid-white">Solid White</option>
                    <option value="solid-pink">Solid Pink</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {section.blockType === 'table' && (
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
            Table HTML
          </label>
          <div className="space-y-2 bg-zinc-800/50 rounded-lg p-3">
            <textarea
              value={section.tableHtml || ''}
              onChange={(e) => updateField('tableHtml', e.target.value)}
              placeholder="Paste <table>...</table> HTML here"
              rows={8}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
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
