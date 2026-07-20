import { Car, HeartPulse, House, Lock, Plane, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { SEGMENT_COLORS } from '../components/ui/categoryColors'
import { POLICIES, PRODUCTS, formatINR, formatLakh } from '../data/mockData'

const CATEGORY_ICONS = {
  Health: HeartPulse,
  Motor: Car,
  Travel: Plane,
  Home: House,
  Cyber: Lock,
}

const FILTERS = ['All', 'Health', 'Motor', 'Travel', 'Home', 'Cyber']

const BADGE_STYLES = {
  'Best match': 'bg-gold/15 text-gold',
  'Most bought': 'bg-ink/5 text-mute',
}

// What Rohan currently pays a competitor, straight off the policy we detected.
const MOTOR_POLICY = POLICIES.find((policy) => policy.category === 'Motor')

// Badged products first, then catalogue order.
const RANKED = [...PRODUCTS].sort((a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)))

export default function Discover({ navigate, screenData }) {
  const [filter, setFilter] = useState(screenData?.category ?? 'All')

  const visible = filter === 'All' ? RANKED : RANKED.filter((p) => p.category === filter)

  return (
    <div className="pb-10">
      <div className="flex gap-2 overflow-x-auto px-5 pt-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((option) => {
          const active = filter === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={active}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm ${
                active
                  ? 'bg-maroon font-medium text-white'
                  : 'border border-black/10 bg-white text-mute'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>

      <div className="space-y-4 px-5 pt-4">
        {visible.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  )
}

function ProductCard({ product, navigate }) {
  const Icon = CATEGORY_ICONS[product.category]
  const color = SEGMENT_COLORS[product.category]
  const premium = product.premiumOptions[0]
  const cover = product.sumInsuredOptions[0]
  const isMotor = product.category === 'Motor'

  return (
    <article className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={20} strokeWidth={1.75} style={{ color }} className="shrink-0" />
          <h2 className="min-w-0 font-display text-base font-bold text-ink">
            {product.name}
          </h2>
        </div>

        {product.badge ? (
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${
              BADGE_STYLES[product.badge]
            }`}
          >
            {product.badge}
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink">
        {product.plainLanguageSummary}
      </p>

      <div className="mt-3 flex gap-2 rounded-xl bg-paper p-3">
        <Sparkles size={14} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold" />
        <p className="text-xs leading-relaxed text-mute">{product.matchReason}</p>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {product.features.slice(0, 3).map((feature) => (
          <li
            key={feature}
            className="rounded-full border border-black/5 bg-paper px-2.5 py-1 text-[11px] text-mute"
          >
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {isMotor ? (
            <p className="font-mono text-lg leading-tight text-ink">
              {formatINR(premium)}
              <span className="text-xs text-mute"> · you paid </span>
              <span className="text-xs text-mute line-through">
                {formatINR(MOTOR_POLICY.premium)}
              </span>
              <span className="text-xs text-mute"> elsewhere</span>
            </p>
          ) : (
            <p className="font-mono text-lg leading-tight text-ink">
              {formatINR(premium)}
              <span className="text-xs text-mute">/year</span>
            </p>
          )}

          <p className="mt-0.5 text-xs text-mute">
            {isMotor ? 'IDV ' : 'Cover '}
            {formatLakh(cover)}
            {product.sumInsuredOptions.length > 1 ? ' and up' : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('compare', { productId: product.id })}
          className="min-h-11 shrink-0 rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
        >
          View plan
        </button>
      </div>
    </article>
  )
}
