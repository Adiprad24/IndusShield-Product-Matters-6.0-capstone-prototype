import { useEffect, useState } from 'react'

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

/**
 * Flips `drawn` to true one paint after mount, so CSS transitions have an
 * initial state to move from. Returns reducedMotion so callers can skip the
 * transition entirely rather than just shortening it.
 */
export default function useDrawOnMount() {
  const [drawn, setDrawn] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReducedMotion(true)
      setDrawn(true)
      return
    }
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)))
    return () => cancelAnimationFrame(frame)
  }, [])

  return { drawn, reducedMotion }
}
