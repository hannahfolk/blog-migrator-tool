import { useState, useEffect, useCallback } from 'react'

const KEY = 'builder:env'
const EVENT = 'builder:env-change'

export function useBuilderEnv() {
  const [env, setEnvState] = useState(() => {
    try {
      const stored = localStorage.getItem(KEY)
      return stored ? JSON.parse(stored) : 'production'
    } catch {
      return 'production'
    }
  })

  const setEnv = useCallback((newEnv) => {
    setEnvState(newEnv)
    localStorage.setItem(KEY, JSON.stringify(newEnv))
    window.dispatchEvent(new CustomEvent(EVENT, { detail: newEnv }))
  }, [])

  useEffect(() => {
    const handler = (e) => setEnvState(e.detail)
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  return [env, setEnv]
}
