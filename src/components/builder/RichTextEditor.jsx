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

  const cleanPastedHtml = useCallback((html) => {
    let cleaned = html
      // Strip all style attributes (removes background-color, color, font-family, etc.)
      .replace(/\s*style="[^"]*"/gi, '')
      // Strip class attributes
      .replace(/\s*class="[^"]*"/gi, '')
      // Strip id attributes
      .replace(/\s*id="[^"]*"/gi, '')
      // Strip data- attributes
      .replace(/\s*data-[a-z-]+="[^"]*"/gi, '')
      // Replace <b> with <strong>, <i> with <em>
      .replace(/<b(\s|>)/gi, '<strong$1')
      .replace(/<\/b>/gi, '</strong>')
      .replace(/<i(\s|>)/gi, '<em$1')
      .replace(/<\/i>/gi, '</em>')
      // Replace <div> with <p>
      .replace(/<div(\s|>)/gi, '<p$1')
      .replace(/<\/div>/gi, '</p>')
      // Strip <span> wrappers (Google Docs, Word, etc. add styled spans)
      .replace(/<\/?span[^>]*>/gi, '')
      // Strip <font> tags
      .replace(/<\/?font[^>]*>/gi, '')
      // Strip <meta>, <style>, <link> tags and their content
      .replace(/<(meta|style|link)[^>]*>([^<]*<\/\1>)?/gi, '')
      // Strip comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Collapse multiple <br> into one
      .replace(/(<br\s*\/?>[\s]*){2,}/gi, '</p><p>')
      // Remove empty paragraphs (including those with only &nbsp; or whitespace)
      .replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
      // Collapse runs of whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    return cleaned
  }, [])

  const handlePaste = useCallback((e) => {
    e.preventDefault()

    // Prefer HTML from clipboard, fall back to plain text
    const html = e.clipboardData.getData('text/html')
    const text = e.clipboardData.getData('text/plain')

    let content
    if (html) {
      content = cleanPastedHtml(html)
    } else {
      // Convert plain text newlines to paragraphs
      content = text
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('')
    }

    // Insert at cursor position
    document.execCommand('insertHTML', false, content)
  }, [cleanPastedHtml])

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
        <style>{`
          .rte-editor strong, .rte-editor b { font-weight: 700; }
          .rte-editor em, .rte-editor i { font-style: italic; }
          .rte-editor h3 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.25rem; }
          .rte-editor h4 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
          .rte-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
          .rte-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
          .rte-editor li { margin: 0.15rem 0; }
          .rte-editor blockquote { border-left: 3px solid #6366f1; padding-left: 0.75rem; margin: 0.5rem 0; color: #a1a1aa; font-style: italic; }
          .rte-editor a { color: #818cf8; text-decoration: underline; }
          .rte-editor hr { border: none; border-top: 1px solid #3f3f46; margin: 0.75rem 0; }
          .rte-editor p { margin: 0.35rem 0; }
        `}</style>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          data-placeholder={placeholder}
          className="rte-editor min-h-[120px] max-h-[300px] overflow-y-auto p-3 text-sm text-zinc-200 bg-zinc-900 focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-zinc-600 [&_*]:!bg-transparent"
        />
      </div>
    </div>
  )
}
