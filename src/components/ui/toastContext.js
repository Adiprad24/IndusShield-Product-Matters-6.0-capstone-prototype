import { createContext, useContext } from 'react'

export const ToastContext = createContext(() => {})

/** Returns showToast(message) — one line, auto-dismissing. */
export function useToast() {
  return useContext(ToastContext)
}
