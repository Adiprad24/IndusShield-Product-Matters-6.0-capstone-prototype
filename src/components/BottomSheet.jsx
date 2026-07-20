import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useOverlayContainer } from './ui/overlayContext'

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

/**
 * Slide-up sheet with a scrim, anchored to the phone frame rather than the
 * window. Closes on scrim tap or Escape.
 */
export default function BottomSheet({ open, onClose, title, children }) {
  const container = useOverlayContainer()
  const [shown, setShown] = useState(false)
  const reducedMotion = prefersReducedMotion()

  useEffect(() => {
    if (!open) {
      setShown(false)
      return
    }
    if (reducedMotion) {
      setShown(true)
      return
    }
    const frame = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(frame)
  }, [open, reducedMotion])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !container) return null

  return createPortal(
    <div className="pointer-events-auto absolute inset-0">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={`absolute inset-0 bg-ink/50 ${
          reducedMotion ? '' : 'transition-opacity duration-200'
        } ${shown ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-x-0 bottom-0 max-h-[80%] overflow-y-auto rounded-t-3xl bg-white ${
          reducedMotion ? '' : 'transition-transform duration-300 ease-out'
        } ${shown ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <span aria-hidden="true" className="h-1 w-10 rounded-full bg-ink/15" />
        </div>

        <div className="px-5 pt-2 pb-8">
          {title ? (
            <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          ) : null}
          {children}
        </div>
      </div>
    </div>,
    container,
  )
}
