import {
  ArrowRight,
  Car,
  ChevronDown,
  HeartPulse,
  House,
  Lock,
  Plane,
  Umbrella,
} from 'lucide-react'
import { useState } from 'react'
import ProtectionRing from '../components/ProtectionRing'
import { SEGMENT_COLORS } from '../components/ui/categoryColors'
import useDrawOnMount from '../components/ui/useDrawOnMount'
import {
  PRODUCTS,
  PROTECTION_SCORE,
  SCORE_BENCHMARK,
  SCORE_TARGETS,
  formatINR,
} from '../data/mockData'

const CATEGORY_ICONS = {
  Health: HeartPulse,
  Motor: Car,
  Life: Umbrella,
  Home: House,
  Travel: Plane,
  Cyber: Lock,
}

function statusChip(score) {
  if (score >= 75) return { label: 'Adequate', className: 'bg-sage/10 text-sage' }
  if (score >= 40) return { label: 'Thin', className: 'bg-gold/15 text-gold' }
  return { label: 'Exposed', className: 'bg-alert/10 text-alert' }
}

const WORST_FIRST = [...PROTECTION_SCORE.segments].sort((a, b) => a.score - b.score)

// A gap is a category scoring below the "Exposed" threshold. The monthly figure
// is the cheapest plan that closes each one, so the CTA never quotes a number
// the catalogue can't honour.
const GAPS = WORST_FIRST.filter((segment) => segment.score < 40)

const GAP_MONTHLY = Math.round(
  GAPS.reduce((total, gap) => {
    const product = PRODUCTS.find((item) => item.category === gap.category)
    return total + (product ? Math.min(...product.premiumOptions) : 0)
  }, 0) / 12,
)

export default function Score({ navigate }) {
  const [openCategory, setOpenCategory] = useState(null)
  const [methodOpen, setMethodOpen] = useState(false)
  const { drawn, reducedMotion } = useDrawOnMount()

  const barStyle = (index, value) => ({
    width: drawn ? `${value}%` : '0%',
    ...(reducedMotion
      ? {}
      : {
          transition: 'width 700ms ease-out',
          transitionDelay: `${index * 80}ms`,
        }),
  })

  return (
    <div className="px-5 pt-4 pb-10">
      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <ProtectionRing size={240} />

        <p className="mt-4 text-center text-sm text-ink">
          <span className="font-mono">{PROTECTION_SCORE.overall}/100</span> ·{' '}
          {SCORE_BENCHMARK.verdict}
        </p>
        <p className="mt-1 text-center text-xs text-mute">
          {SCORE_BENCHMARK.peerLabel}{' '}
          <span className="font-mono">{SCORE_BENCHMARK.peerAverage}</span>.
        </p>

        <div className="mt-5">
          <div className="relative h-1.5 rounded-full bg-ink/8">
            <div
              className="h-1.5 rounded-full bg-maroon"
              style={barStyle(0, PROTECTION_SCORE.overall)}
            />
            <span
              aria-hidden="true"
              className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-mute"
              style={{ left: `${SCORE_BENCHMARK.peerAverage}%` }}
            />
          </div>

          <div className="relative mt-2 h-4">
            <span
              className="absolute -translate-x-1/2 font-mono text-[10px] text-maroon"
              style={{ left: `${PROTECTION_SCORE.overall}%` }}
            >
              You {PROTECTION_SCORE.overall}
            </span>
            <span
              className="absolute -translate-x-1/2 font-mono text-[10px] text-mute"
              style={{ left: `${SCORE_BENCHMARK.peerAverage}%` }}
            >
              Peers {SCORE_BENCHMARK.peerAverage}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setMethodOpen((open) => !open)}
          aria-expanded={methodOpen}
          className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="text-sm font-medium text-ink">How this is calculated</span>
          <ChevronDown
            size={20}
            strokeWidth={1.75}
            className={`shrink-0 text-mute transition-transform ${
              methodOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {methodOpen ? (
          <div className="px-4 pb-4">
            <p className="text-sm leading-relaxed text-mute">
              Your score measures the cover you hold against what someone with your
              income, dependants and city would actually need — ₹5L of health cover
              stretches a lot further in Indore than it does in Mumbai. We weight four
              things: your cover against your ₹8.4L income, the two dependants who rely
              on it, what treatment and repairs cost in Mumbai, and the assets you would
              have to sell if a claim went unpaid.
            </p>
          </div>
        ) : null}
      </section>

      <h2 className="mt-6 font-display text-base font-bold text-ink">
        Where you stand
      </h2>

      <ul className="mt-3 space-y-2">
        {WORST_FIRST.map((segment, index) => {
          const Icon = CATEGORY_ICONS[segment.category]
          const chip = statusChip(segment.score)
          const target = SCORE_TARGETS[segment.category]
          const open = openCategory === segment.category
          const color = SEGMENT_COLORS[segment.category]

          return (
            <li
              key={segment.category}
              className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenCategory(open ? null : segment.category)}
                aria-expanded={open}
                className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left"
              >
                <Icon size={20} strokeWidth={1.75} style={{ color }} className="shrink-0" />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink">
                      {segment.category}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${chip.className}`}
                    >
                      {chip.label}
                    </span>
                  </span>

                  <span className="mt-2 block h-1 rounded-full bg-ink/8">
                    <span
                      className="block h-1 rounded-full"
                      style={{ backgroundColor: color, ...barStyle(index, segment.score) }}
                    />
                  </span>
                </span>

                <span className="shrink-0 font-mono text-sm text-ink">{segment.score}</span>
                <ChevronDown
                  size={18}
                  strokeWidth={1.75}
                  className={`shrink-0 text-mute transition-transform ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {open ? (
                <div className="px-4 pb-4 pl-12">
                  <p className="text-sm leading-relaxed text-ink">
                    {segment.oneLineReason}
                  </p>

                  <p className="mt-3 text-xs text-mute">
                    What good looks like:{' '}
                    <span className="font-mono text-ink">{formatINR(target.amount)}</span>{' '}
                    {target.note}
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('discover', { category: segment.category })}
                    className="mt-3 flex min-h-11 items-center gap-1 text-sm font-medium text-maroon"
                  >
                    Fix this
                    <ArrowRight size={16} strokeWidth={1.75} />
                  </button>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={() => navigate('discover')}
        className="mt-6 min-h-11 w-full rounded-xl bg-maroon px-4 py-3 text-sm font-medium text-white active:bg-maroon-deep"
      >
        Close all {GAPS.length} gaps for{' '}
        <span className="font-mono">{formatINR(GAP_MONTHLY)}</span>/month
      </button>
    </div>
  )
}
