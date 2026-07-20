import { Sparkles, X } from 'lucide-react'
import LedgerRow from './ui/LedgerRow'

/**
 * A transaction from the customer's own account, read back to them as a reason.
 * The ledger row is deliberately set as a statement line — the credibility of
 * the whole recommendation rests on it looking like something they already saw.
 */
export default function SignalCard({ signal, onAction, onDismiss }) {
  return (
    <article className="relative rounded-2xl border border-black/5 border-l-[3px] border-l-gold bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} strokeWidth={1.75} className="text-gold" />
          <span className="text-[10px] uppercase tracking-widest text-mute">
            From your account
          </span>
        </div>

        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss this suggestion"
            className="-mt-2 -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-mute active:bg-black/5"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        ) : null}
      </div>

      <LedgerRow
        className="mt-3"
        date={signal.date}
        merchant={signal.merchant}
        amount={signal.amount}
      />

      <p className="mt-3 text-sm leading-relaxed text-ink">{signal.insight}</p>

      {signal.suggestedAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 min-h-11 w-full rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
        >
          {signal.suggestedAction}
        </button>
      ) : null}
    </article>
  )
}
