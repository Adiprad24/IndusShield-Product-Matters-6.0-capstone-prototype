import { formatINR } from '../../data/mockData'

/**
 * A line lifted straight from the bank statement. Deliberately set in mono on
 * paper so it reads as a record the customer has already seen, not as marketing.
 */
export default function LedgerRow({ date, merchant, amount, className = '' }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg bg-paper p-3 font-mono text-xs ${className}`}
    >
      <span className="shrink-0 text-mute">{date}</span>
      <span className="min-w-0 flex-1 truncate text-mute">{merchant}</span>
      <span className="shrink-0 font-medium text-ink">{formatINR(amount)}</span>
    </div>
  )
}
