import { useEffect, useState } from 'react'

/**
 * Returns the latest value only after the caller stops changing it for `delayMs`.
 * Keeps keystroke-triggered requests from spamming the API and re-rendering lists
 * on every typed character.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}