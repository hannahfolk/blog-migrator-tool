import { useRef, useEffect, useCallback } from 'react'
import { Bold, Italic, Heading3, Heading4, List, ListOrdered, Quote, Link, Minus } from 'lucide-react'

const TOOLBAR_BUTTONS = [
  { command: 'bold', icon: Bold, label: 'Bold' },
  { command: 'italic', icon: Italic, label: 'Italic' },
  { command: 'separator' },
  { command: 'formatBlock:h3', icon: Heading3, label: 'Heading 3' },
  { command: 'formatBlock:h4', icon: Heading4, label: 'Heading 4' },
  { command: 'separator' },
  { command: 'insertUnorderedList', icon: List, label: 'Bullet List' },
  { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List' },
  { command: 'separator' },
  { command: 'formatBlock:blockquote', icon: Quote, label: 'Blockquote' },
  { command: 'createLink', icon: Link, label: 'Link' },
  { command: 'insertHorizontalRule', icon: Minus, label: 'Horizontal Rule' },
]

export function RichTextEditor({ value, onChange, placeholder = 'Start typing...' }) {
  const editorRef = useRef(null)
  const isInitialized = useRef(false)

  // Set initial HTML only on mount
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value || ''
      isInitialized.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const execCommand = useCallback((commandStr) => {
    if (commandStr.startsWith('formatBlock:')) {
      const tag = commandStr.split(':')[1]
      document.execCommand('formatBlock', false, tag)
    } else if (commandStr === 'createLink') {
      const url = window.prompt('Enter URL:')
      if (url) {
        document.execCommand('createLink', false, url)
      }
    } else {
      document.execCommand(commandStr, false, null)
    }
    // Refocus editor after command
    editorRef.current?.focus()
    handleInput()
  }, [handleInput])

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-zinc-800 border-b border-zinc-700">
        {TOOLBAR_BUTTONS.map((btn, i) => {
          if (btn.command === 'separator') {
            return <div key={i} className="w-px h-5 bg-zinc-600 mx-1" />
          }
          const Icon = btn.icon
          return (
            <button
              key={btn.command}
              title={btn.label}
              onMouseDown={(e) => {
                e.preventDefault() // Maintain editor focus
                execCommand(btn.command)
              }}
              className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <Icon size={14} />
            </button>
          )
        })}
      </div>

      {/* Editor area */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          data-placeholder={placeholder}
          className="min-h-[120px] max-h-[300px] overflow-y-auto p-3 text-sm text-zinc-200 bg-zinc-900 focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-zinc-600"
        />
      </div>
    </div>
  )
}
