import {
  Award,
  Bell,
  Car,
  ChevronRight,
  FileText,
  HeartPulse,
  MessageCircle,
  RefreshCw,
  ShieldPlus,
  Siren,
  Stethoscope,
  Truck,
  Umbrella,
  Wrench,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import ProtectionRing from '../components/ProtectionRing'
import SignalCard from '../components/SignalCard'
import Skeleton from '../components/ui/Skeleton'
import { useToast } from '../components/ui/toastContext'
import {
  BANK_SIGNALS,
  POLICIES,
  PROTECTION_SCORE,
  SERVICES,
  USER,
  formatINR,
} from '../data/mockData'

const CATEGORY_ICONS = { Health: HeartPulse, Motor: Car, Life: Umbrella }

const SERVICE_ICONS = {
  Stethoscope,
  Truck,
  HeartPulse,
  Wrench,
  Award,
  Siren,
}

// The ICICI Lombard debit — a competitor premium on a car we financed.
const TOP_SIGNAL = BANK_SIGNALS.find((signal) => signal.id === 'SIG-2')

const GAP_COUNT = PROTECTION_SCORE.segments.filter(
  (segment) => segment.status === 'critical',
).length

// Long enough to read as "fetching your account", short enough that nobody
// waits for it in a demo. Tests opt out so that 90 screen assertions are not
// gated behind decoration — HomeSkeleton is covered directly instead.
const LOADING_MS = import.meta.env.MODE === 'test' ? 0 : 400

export default function Home({ navigate }) {
  const showToast = useToast()
  const [signalDismissed, setSignalDismissed] = useState(false)
  const [loading, setLoading] = useState(LOADING_MS > 0)

  useEffect(() => {
    if (LOADING_MS === 0) return undefined
    const timer = setTimeout(() => setLoading(false), LOADING_MS)
    return () => clearTimeout(timer)
  }, [])

  const quickActions = [
    { label: 'File a claim', Icon: FileText, onPress: () => navigate('claimFile') },
    { label: 'Renew', Icon: RefreshCw, onPress: () => navigate('buy', { productId: 'PR2' }) },
    { label: 'Get covered', Icon: ShieldPlus, onPress: () => navigate('discover') },
    { label: 'Talk to Assist', Icon: MessageCircle, onPress: () => navigate('assist') },
  ]

  if (loading) return <HomeSkeleton />

  return (
    <div className="pb-24">
      <header className="rounded-b-3xl bg-[linear-gradient(160deg,var(--color-maroon-deep),var(--color-maroon))] px-5 pt-6 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">Good morning</p>
            <p className="font-display text-2xl font-bold text-white">
              {USER.name.split(' ')[0]}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('vault')}
              aria-label={`${USER.name}, view your policies`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/20 font-display text-sm font-bold text-white"
            >
              {USER.avatarInitials}
            </button>

            <button
              type="button"
              onClick={() => navigate('claimTrack')}
              aria-label="Notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-white active:bg-white/10"
            >
              <Bell size={20} strokeWidth={1.75} />
              <span
                aria-hidden="true"
                className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-gold ring-2 ring-maroon"
              />
            </button>
          </div>
        </div>
      </header>

      <section className="relative -mt-24">
        <ProtectionRing onPress={() => navigate('score')} />

        <button
          type="button"
          onClick={() => navigate('score')}
          className="mx-auto mt-3 block min-h-11 px-5 text-sm text-ink"
        >
          <span className="font-medium text-alert">{GAP_COUNT} gaps</span> found in your
          protection
        </button>
      </section>

      {!signalDismissed && TOP_SIGNAL ? (
        <section className="px-5 pt-2">
          <SignalCard
            signal={TOP_SIGNAL}
            onAction={() => navigate('compare', { productId: TOP_SIGNAL.productId })}
            onDismiss={() => {
              setSignalDismissed(true)
              showToast('Suggestion hidden. You can still find it in Discover.')
            }}
          />
        </section>
      ) : (
        <section className="px-5 pt-2">
          <button
            type="button"
            onClick={() => navigate('discover')}
            className="min-h-11 w-full rounded-2xl border border-dashed border-black/15 px-4 text-sm text-mute"
          >
            Suggestion dismissed. See all your options.
          </button>
        </section>
      )}

      <section className="pt-6">
        <SectionHeading title="Your policies" onSeeAll={() => navigate('vault')} />
        <div className="flex gap-3 overflow-x-auto px-5 pt-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {POLICIES.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onPress={() => navigate('policy', policy)}
            />
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="font-display text-base font-bold text-ink">Quick actions</h2>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {quickActions.map(({ label, Icon, onPress }) => (
            <button
              key={label}
              type="button"
              onClick={onPress}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-maroon/8">
                <Icon size={20} strokeWidth={1.75} className="text-maroon" />
              </span>
              <span className="text-xs leading-tight text-ink">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="pt-6">
        <SectionHeading title="Services" onSeeAll={() => navigate('services')} />
        <div className="flex gap-3 overflow-x-auto px-5 pt-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SERVICES.slice(0, 4).map((service) => {
            const Icon = SERVICE_ICONS[service.icon]
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => navigate('services')}
                className="w-[150px] shrink-0 rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm"
              >
                <Icon size={20} strokeWidth={1.75} className="text-maroon" />
                <p className="mt-3 text-sm font-medium leading-tight text-ink">
                  {service.name}
                </p>
                <p className="mt-1 text-xs leading-snug text-mute">{service.detail}</p>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export function HomeSkeleton() {
  return (
    <div className="pb-24">
      <div className="rounded-b-3xl bg-[linear-gradient(160deg,var(--color-maroon-deep),var(--color-maroon))] px-5 pt-6 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-4 w-24 rounded bg-white/20" />
            <div className="mt-2 h-6 w-20 rounded bg-white/25" />
          </div>
          <div className="h-11 w-11 rounded-full bg-white/20" />
        </div>
      </div>

      <div className="-mt-24 flex flex-col items-center">
        <Skeleton className="h-[200px] w-[200px] rounded-full" />
        <Skeleton className="mt-4 h-4 w-48" />
      </div>

      <div className="px-5 pt-6">
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>

      <div className="flex gap-3 overflow-hidden px-5 pt-6">
        <Skeleton className="h-32 w-[200px] shrink-0 rounded-2xl" />
        <Skeleton className="h-32 w-[200px] shrink-0 rounded-2xl" />
      </div>

      <p className="sr-only" role="status">
        Loading your protection summary
      </p>
    </div>
  )
}

function SectionHeading({ title, onSeeAll }) {
  return (
    <div className="flex items-center justify-between px-5">
      <h2 className="font-display text-base font-bold text-ink">{title}</h2>
      <button
        type="button"
        onClick={onSeeAll}
        className="flex min-h-11 items-center gap-0.5 text-sm text-maroon"
      >
        See all
        <ChevronRight size={16} strokeWidth={1.75} />
      </button>
    </div>
  )
}

function PolicyCard({ policy, onPress }) {
  const Icon = CATEGORY_ICONS[policy.category]
  const detected = policy.source === 'detected'
  const cover = policy.sumInsured ?? policy.idv

  return (
    <button
      type="button"
      onClick={onPress}
      className={`w-[200px] shrink-0 rounded-2xl p-4 text-left ${detected
          ? 'border border-dashed border-black/20 bg-white/60 opacity-80'
          : 'border border-black/5 bg-white shadow-sm'
        }`}
    >
      <div className="flex items-center justify-between gap-2">
        <Icon
          size={20}
          strokeWidth={1.75}
          className={detected ? 'text-mute' : 'text-maroon'}
        />
        {detected ? (
          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-mute">
            Detected
          </span>
        ) : null}
      </div>

      <p className="mt-3 truncate text-sm font-medium text-ink">{policy.name}</p>

      <p className="mt-2 font-mono text-base text-ink">{formatINR(cover)}</p>
      <p className="text-[11px] text-mute">
        {policy.sumInsured ? 'Sum insured' : 'IDV'}
      </p>

      <p className="mt-3 text-[11px] text-mute">
        Expires <span className="font-mono text-ink">{policy.expiry}</span>
      </p>
    </button>
  )
}
