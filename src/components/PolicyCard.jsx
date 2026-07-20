import { Car, HeartPulse, House, Lock, Plane, Umbrella } from 'lucide-react'
import { SEGMENT_COLORS } from './ui/categoryColors'
import { daysUntil } from './ui/policyDates'
import { formatINR } from '../data/mockData'

const CATEGORY_ICONS = {
  Health: HeartPulse,
  Motor: Car,
  Life: Umbrella,
  Home: House,
  Travel: Plane,
  Cyber: Lock,
}

function statusChip(days) {
  if (days <= 30) return { label: 'Expiring soon', className: 'bg-alert/10 text-alert' }
  return { label: 'Active', className: 'bg-sage/10 text-sage' }
}

/**
 * Full policy card, shared by the vault and by a freshly imported policy.
 * Without onPress it renders as a static card rather than a button that
 * goes nowhere — as on the policy detail screen, where it is the header.
 */
export default function PolicyCard({ policy, onPress, highlight = false }) {
  const Icon = CATEGORY_ICONS[policy.category]
  const color = SEGMENT_COLORS[policy.category]
  const days = daysUntil(policy.expiry)
  const chip = statusChip(days)
  const cover = policy.sumInsured ?? policy.idv

  const Wrapper = onPress ? 'button' : 'div'
  const wrapperProps = onPress ? { type: 'button', onClick: onPress } : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm ${
        highlight ? 'border-maroon' : 'border-black/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={20} strokeWidth={1.75} style={{ color }} className="shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-xs text-mute">{policy.insurer}</p>
            <p className="truncate text-sm font-medium text-ink">{policy.name}</p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${chip.className}`}
        >
          {chip.label}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-base text-ink">{formatINR(cover)}</p>
          <p className="text-[11px] text-mute">
            {policy.sumInsured ? 'Sum insured' : 'IDV'}
          </p>
        </div>

        <div className="text-right">
          <p className="font-mono text-sm text-ink">
            {policy.premium === 0 ? 'Employer paid' : `${formatINR(policy.premium)}/yr`}
          </p>
          <p className="text-[11px] text-mute">
            Expires <span className="font-mono">{policy.expiry}</span> ·{' '}
            <span className={days <= 30 ? 'text-alert' : ''}>{days} days</span>
          </p>
        </div>
      </div>
    </Wrapper>
  )
}
