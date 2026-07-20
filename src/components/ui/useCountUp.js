import { useEffect, useState } from 'react'

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

/** Counts from `from` to `to` on mount. Jumps straight to `to` if motion is reduced. */
export default function useCountUp(from, to, duration = 900) {
  const [value, setValue] = useState(from)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(to)
      return
    }

    let frame
    let start

    const tick = (timestamp) => {
      if (start === undefined) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      // Ease-out so it decelerates into the final number.
      setValue(Math.round(from + (to - from) * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [from, to, duration])

  return value
}
