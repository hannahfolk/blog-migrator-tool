import { useState } from 'react'
import { FIGMA_BLOCKS } from '../../constants'
import { generateSectionHtml, useLocalStorage } from '../../utils'
import { InputStep } from './InputStep'
import { MappingStep } from './MappingStep'
import { OutputStep } from './OutputStep'

export function MigratorPage() {
  const [step, setStep] = useState('input')
  const [inputHtml, setInputHtml] = useLocalStorage('migrator:inputHtml', '')
  const [selections, setSelections] = useState([])
  const [generatedHtml, setGeneratedHtml] = useState('')

  const handleReset = () => {
    setStep('input')
    setSelections([])
    setGeneratedHtml('')
  }

  const handleGenerate = () => {
    // Sort selections by vertical position (top to bottom)
    const sortedSelections = [...selections].sort((a, b) => a.rect.y - b.rect.y)

    // Generate HTML for each selection using extracted content
    const htmlSections = sortedSelections.map(selection => {
      const block = FIGMA_BLOCKS[selection.blockType]
      return generateSectionHtml(selection, selection.blockType, block)
    })

    setGeneratedHtml(htmlSections.join('\n\n'))
    setStep('output')
  }

  if (step === 'input') {
    return (
      <InputStep
        inputHtml={inputHtml}
        setInputHtml={setInputHtml}
        onNext={() => setStep('map')}
      />
    )
  }

  if (step === 'map') {
    return (
      <MappingStep
        inputHtml={inputHtml}
        selections={selections}
        setSelections={setSelections}
        onReset={handleReset}
        onGenerate={handleGenerate}
      />
    )
  }

  return (
    <OutputStep
      selections={selections}
      generatedHtml={generatedHtml}
      onReset={handleReset}
      onBackToMapping={() => setStep('map')}
    />
  )
}
