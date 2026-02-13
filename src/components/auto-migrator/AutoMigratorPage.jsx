import { useState, useRef, useCallback } from 'react'
import { useLocalStorage } from '../../utils/useLocalStorage'
import { scrapeWordPressBlog } from '../../utils/autoScraper'
import { UrlInputStep } from './UrlInputStep'
import { CrawlProgressStep } from './CrawlProgressStep'
import { ResultsStep } from './ResultsStep'

export function AutoMigratorPage() {
  const [blogUrl, setBlogUrl] = useLocalStorage('autoMigrator:blogUrl', '')
  const [step, setStep] = useState('input') // 'input' | 'crawling' | 'results'
  const [progress, setProgress] = useState({ phase: 'discovering', message: '' })
  const [completedPosts, setCompletedPosts] = useState([])
  const [results, setResults] = useState([])
  const abortRef = useRef(null)
  const completedRef = useRef([])

  const handleStart = useCallback(async ({ blogUrl: url, maxPosts, delayMs }) => {
    const controller = new AbortController()
    abortRef.current = controller
    completedRef.current = []

    setStep('crawling')
    setProgress({ phase: 'discovering', message: 'Starting...' })
    setCompletedPosts([])
    setResults([])

    try {
      const finalResults = await scrapeWordPressBlog({
        blogUrl: url,
        maxPosts,
        delayMs,
        signal: controller.signal,
        onProgress: setProgress,
        onPostComplete: (post) => {
          completedRef.current = [...completedRef.current, post]
          setCompletedPosts(completedRef.current)
        },
      })

      if (finalResults.length > 0) {
        setResults(finalResults)
        setStep('results')
      }
      // If 0 results, scrapeWordPressBlog already set progress to error phase
    } catch (err) {
      if (err.name === 'AbortError') {
        // User stopped — show whatever we have so far
        setResults(completedRef.current)
        setStep('results')
      } else {
        console.error('[AutoMigrator] Unexpected error:', err)
        setProgress({ phase: 'error', message: err.message })
      }
    }
  }, [])

  const handleStop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const handleStartOver = useCallback(() => {
    setStep('input')
    setProgress({ phase: 'discovering', message: '' })
    setCompletedPosts([])
    setResults([])
  }, [])

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-8">
      {step === 'input' && (
        <UrlInputStep
          blogUrl={blogUrl}
          setBlogUrl={setBlogUrl}
          onStart={handleStart}
        />
      )}

      {step === 'crawling' && (
        <CrawlProgressStep
          progress={progress}
          completedPosts={completedPosts}
          onStop={handleStop}
          onStartOver={handleStartOver}
        />
      )}

      {step === 'results' && (
        <ResultsStep
          results={results.length > 0 ? results : completedPosts}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  )
}
