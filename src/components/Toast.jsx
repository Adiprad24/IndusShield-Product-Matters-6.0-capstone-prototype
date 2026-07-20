import { Check } from 'lucide-react'

/**
 * One-line confirmation. Sits above the bottom nav so it never covers the tabs,
 * and announces itself politely rather than stealing focus.
 */
export default function Toast({ message, shown, icon = true }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none absolute inset-x-0 bottom-20 flex justify-center px-5 transition-all duration-200 ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className="flex max-w-full items-center gap-2 rounded-xl bg-ink px-4 py-3 shadow-lg">
        {icon ? (
          <Check size={16} strokeWidth={2.5} className="shrink-0 text-sage" />
        ) : null}
        <p className="text-xs leading-snug text-white">{message}</p>
      </div>
    </div>
  )
}
