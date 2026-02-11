import { useState } from 'react'
import { ChevronUp, ChevronDown, Trash2, ChevronRight } from 'lucide-react'
import { FIGMA_BLOCKS } from '../../constants'
import { SectionForm } from './SectionForm'

export function SectionEditor({ sections, onChange }) {
  const [collapsed, setCollapsed] = useState({})

  const toggleCollapse = (id) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const moveSection = (index, direction) => {
    const newSections = [...sections]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newSections.length) return
    ;[newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]]
    onChange(newSections)
  }

  const deleteSection = (index) => {
    onChange(sections.filter((_, i) => i !== index))
  }

  const updateSection = (index, updatedSection) => {
    const newSections = [...sections]
    newSections[index] = updatedSection
    onChange(newSections)
  }

  if (sections.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm py-20">
        Add a section to get started
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sections.map((section, index) => {
        const block = FIGMA_BLOCKS[section.blockType]
        if (!block) return null
        const Icon = block.icon
        const isCollapsed = collapsed[section.id]

        return (
          <div key={section.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header bar */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
              style={{ borderLeft: `4px solid ${block.color}` }}
              onClick={() => toggleCollapse(section.id)}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: block.color + '20' }}
              >
                <Icon size={14} style={{ color: block.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white">{block.label}</span>
                {section.heading && (
                  <span className="text-xs text-zinc-500 ml-2 truncate">
                    — {section.heading}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
                  title="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveSection(index, 1)}
                  disabled={index === sections.length - 1}
                  className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
                  title="Move down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => deleteSection(index)}
                  className="p-1 rounded hover:bg-red-900/50 text-zinc-500 hover:text-red-400 transition-colors ml-1"
                  title="Delete section"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <ChevronRight
                size={14}
                className={`text-zinc-500 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
              />
            </div>

            {/* Form body */}
            {!isCollapsed && (
              <SectionForm
                section={section}
                onChange={(updated) => updateSection(index, updated)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
