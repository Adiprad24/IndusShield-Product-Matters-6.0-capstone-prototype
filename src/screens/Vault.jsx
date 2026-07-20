import { Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import PolicyCard from '../components/PolicyCard'
import { daysUntil } from '../components/ui/policyDates'
import { SEGMENT_COLORS } from '../components/ui/categoryColors'
import LedgerRow from '../components/ui/LedgerRow'
import { useToast } from '../components/ui/toastContext'
import useCountUp from '../components/ui/useCountUp'
import {
  BANK_SIGNALS,
  DEMO_TODAY,
  POLICIES,
  PROTECTION_SCORE,
  SCORE_AFTER_IMPORT,
  formatINR,
  parseExpiry,
} from '../data/mockData'

const IMPORT_ANIMATION_MS = 420

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

export default function Vault({ navigate }) {
  const showToast = useToast()
  const [imported, setImported] = useState([])
  const [collapsing, setCollapsing] = useState(null)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const owned = POLICIES.filter(
    (policy) => policy.source === 'indusind' || imported.includes(policy.id),
  )
  const detected = POLICIES.filter(
    (policy) => policy.source === 'detected' && !imported.includes(policy.id),
  )

  const score = useCountUp(
    PROTECTION_SCORE.overall,
    imported.length > 0 ? SCORE_AFTER_IMPORT : PROTECTION_SCORE.overall,
  )

  const importPolicy = (policy) => {
    const finish = () => {
      setImported((list) => [...list, policy.id])
      setCollapsing(null)
      showToast(`${policy.insurer} policy imported. Renewal reminder set for 23 Jul.`)
    }

    if (prefersReducedMotion()) {
      finish()
      return
    }

    setCollapsing(policy.id)
    timers.current.push(setTimeout(finish, IMPORT_ANIMATION_MS))
  }

  return (
    <div className="pb-24">
      <header className="flex items-end justify-between gap-4 px-5 pt-5">
        <h1 className="font-display text-2xl font-bold text-ink">My protection</h1>
        <div className="text-right">
          <p className="font-mono text-xl leading-none text-ink">{score}</p>
          <p className="mt-1 flex items-center justify-end gap-1 text-[10px] uppercase tracking-widest text-mute">
            {imported.length > 0 ? (
              <TrendingUp size={12} strokeWidth={2} className="text-sage" />
            ) : null}
            Score
          </p>
        </div>
      </header>

      <section className="px-5 pt-6">
        <h2 className="font-display text-base font-bold text-ink">Active policies</h2>
        <div className="mt-3 space-y-3">
          {owned.map((policy) => (
            <div
              key={policy.id}
              className={
                imported.includes(policy.id) ? 'animate-[fadeUp_400ms_ease-out]' : undefined
              }
            >
              <PolicyCard
                policy={policy}
                highlight={imported.includes(policy.id)}
                onPress={() => navigate('policy', policy)}
              />
            </div>
          ))}
        </div>
      </section>

      {detected.length > 0 ? (
        <section className="px-5 pt-6">
          <h2 className="font-display text-base font-bold text-ink">
            Found in your account
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-mute">
            We spotted these in your transaction history. Import them to manage
            everything in one place.
          </p>

          <div className="mt-3 space-y-3">
            {detected.map((policy) => (
              <DetectedPolicy
                key={policy.id}
                policy={policy}
                collapsing={collapsing === policy.id}
                onImport={() => importPolicy(policy)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Every policy we know about, imported or not — the detected one expires
          soonest, and hiding it here would bury the most urgent renewal. */}
      <RenewalTimeline policies={POLICIES} navigate={navigate} />
    </div>
  )
}

function DetectedPolicy({ policy, collapsing, onImport }) {
  const signal = BANK_SIGNALS.find((item) => item.merchant.startsWith('ICICI'))

  return (
    <article
      className="overflow-hidden rounded-2xl border border-dashed border-black/20 bg-white/60 p-4"
      style={{
        transition: 'opacity 400ms ease-out, transform 400ms ease-out, max-height 400ms ease-out',
        maxHeight: collapsing ? 0 : 520,
        opacity: collapsing ? 0 : 1,
        transform: collapsing ? 'scale(0.96)' : 'scale(1)',
        padding: collapsing ? 0 : undefined,
      }}
    >
      <div className="flex items-center gap-1.5">
        <Sparkles size={14} strokeWidth={1.75} className="text-gold" />
        <span className="text-[10px] uppercase tracking-widest text-mute">
          From your account
        </span>
      </div>

      <LedgerRow
        className="mt-3"
        date={signal.date}
        merchant={signal.merchant}
        amount={signal.amount}
      />

      <div className="mt-3 space-y-1 text-sm">
        <p className="font-medium text-ink">{policy.name}</p>
        <p className="text-mute">{policy.vehicle}</p>
        <p className="text-mute">
          Policy <span className="font-mono text-ink">{policy.policyNo}</span>
        </p>
        <p className="text-mute">
          IDV <span className="font-mono text-ink">{formatINR(policy.idv)}</span> · expires{' '}
          <span className="font-mono text-ink">{policy.expiry}</span> in{' '}
          <span className="text-alert">{daysUntil(policy.expiry)} days</span>
        </p>
      </div>

      <button
        type="button"
        onClick={onImport}
        className="mt-4 min-h-11 w-full rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
      >
        Import policy
      </button>
    </article>
  )
}

function RenewalTimeline({ policies, navigate }) {
  const start = new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), 1)

  const months = Array.from({ length: 12 }, (_, index) => {
    const month = new Date(start.getFullYear(), start.getMonth() + index, 1)
    return { label: month.toLocaleString('en-GB', { month: 'short' }), month }
  })

  const totalMs = new Date(start.getFullYear(), start.getMonth() + 12, 1) - start

  const positionOf = (date) =>
    Math.min(Math.max(((date - start) / totalMs) * 100, 0), 100)

  const markers = policies
    .map((policy) => ({
      policy,
      date: parseExpiry(policy.expiry),
      days: daysUntil(policy.expiry),
    }))
    .filter((marker) => marker.date >= start)
    .sort((a, b) => a.days - b.days)

  const nearest = markers[0]

  return (
    <section className="px-5 pt-8">
      <h2 className="font-display text-base font-bold text-ink">Renewals ahead</h2>

      {nearest ? (
        <p className="mt-1 text-sm text-ink">
          <span className="font-medium text-alert">
            {nearest.policy.name} renews in {nearest.days} days
          </span>{' '}
          — on <span className="font-mono">{nearest.policy.expiry}</span>.
        </p>
      ) : null}

      <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
        <div className="relative h-10">
          <div className="absolute inset-x-0 top-3 h-0.5 rounded-full bg-ink/8" />

          <div
            className="absolute top-1 h-4 w-0.5 rounded-full bg-ink/30"
            style={{ left: `${positionOf(DEMO_TODAY)}%` }}
          >
            <span className="absolute -top-0.5 left-2 text-[9px] whitespace-nowrap text-mute">
              Now
            </span>
          </div>

          {markers.map((marker) => (
            <span
              key={marker.policy.id}
              title={`${marker.policy.name} · ${marker.policy.expiry}`}
              className="absolute top-1.5 h-3 w-3 -translate-x-1/2 rounded-full ring-2 ring-white"
              style={{
                left: `${positionOf(marker.date)}%`,
                backgroundColor: SEGMENT_COLORS[marker.policy.category],
              }}
            />
          ))}

          <div className="absolute inset-x-0 top-6 flex justify-between">
            {months.map(({ label }, index) => (
              <span
                key={`${label}-${index}`}
                className="text-[9px] text-mute"
                aria-hidden="true"
              >
                {label[0]}
              </span>
            ))}
          </div>
        </div>

        <ul className="mt-3 space-y-2 border-t border-black/5 pt-3">
          {markers.map((marker) => (
            <li key={marker.policy.id}>
              <button
                type="button"
                onClick={() => navigate('policy', marker.policy)}
                className="flex min-h-11 w-full items-center gap-3 text-left"
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: SEGMENT_COLORS[marker.policy.category] }}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {marker.policy.name}
                </span>
                <span
                  className={`shrink-0 font-mono text-xs ${marker.days <= 30 ? 'text-alert' : 'text-mute'
                    }`}
                >
                  {marker.policy.expiry}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
