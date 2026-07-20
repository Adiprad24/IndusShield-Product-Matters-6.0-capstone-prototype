import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Toast from './Toast'
import { useOverlayContainer } from './ui/overlayContext'
import { ToastContext } from './ui/toastContext'

const VISIBLE_MS = 2500
const FADE_MS = 250

export default function ToastProvider({ children }) {
  const container = useOverlayContainer()
  const [toast, setToast] = useState(null)
  const [shown, setShown] = useState(false)
  const timers = useRef([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  /** showToast('Saved') or showToast('Calling…', { icon: false }) */
  const showToast = useCallback((message, { icon = true } = {}) => {
    clearTimers()
    setToast({ message, icon, id: Date.now() })
    setShown(true)
    timers.current.push(setTimeout(() => setShown(false), VISIBLE_MS))
    timers.current.push(setTimeout(() => setToast(null), VISIBLE_MS + FADE_MS))
  }, [])

  useEffect(() => clearTimers, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && container
        ? createPortal(
            <Toast message={toast.message} icon={toast.icon} shown={shown} />,
            container,
          )
        : null}
    </ToastContext.Provider>
  )
}
