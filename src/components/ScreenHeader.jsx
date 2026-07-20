import { ChevronLeft } from 'lucide-react'

/**
 * Sub-screen header: back chevron, title, optional right-side action slot.
 */
export default function ScreenHeader({ title, subtitle, onBack, action }) {
  return (
    <header className="shrink-0 border-b border-black/5 bg-paper px-5">
      <div className="flex min-h-14 items-center gap-2 py-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="-ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink active:bg-black/5"
        >
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold leading-tight text-ink">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-xs leading-tight text-mute">{subtitle}</p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  )
}
