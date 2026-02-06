import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { copyToClipboard } from '../../utils'

export function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 transition-colors ${className}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}
