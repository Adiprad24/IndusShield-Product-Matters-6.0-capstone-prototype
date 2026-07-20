import { Check, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useToast } from '../components/ui/toastContext'
import { CLAIM, CLAIM_GARAGE, POLICIES, formatINR } from '../data/mockData'

const MOTOR_POLICY = POLICIES.find((policy) => policy.category === 'Motor')

export default function ClaimTrack({ navigate }) {
  const showToast = useToast()
  const toGarage = CLAIM.approved - CLAIM.excess

  return (
    <div className="px-5 pt-5 pb-24">
      <h1 className="font-display text-2xl font-bold text-ink">Your claim</h1>

      <section className="mt-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-sm text-ink">{CLAIM.claimId}</p>
            <p className="mt-1 truncate text-xs text-mute">{MOTOR_POLICY.vehicle}</p>
          </div>
          <span className="shrink-0 rounded-full bg-maroon/8 px-3 py-1.5 text-xs font-medium text-maroon">
            {CLAIM.status}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-black/5 pt-3">
          <div>
            <p className="font-mono text-xl leading-none text-ink">
              {formatINR(CLAIM.approved)}
            </p>
            <p className="mt-1 text-[11px] text-mute">Approved</p>
          </div>
          <p className="text-right text-xs text-mute">{CLAIM.incident}</p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-base font-bold text-ink">Progress</h2>
        <ol className="mt-4">
          {CLAIM.stages.map((stage, index) => (
            <Stage
              key={stage.label}
              stage={stage}
              isLast={index === CLAIM.stages.length - 1}
            />
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
        <h2 className="font-display text-base font-bold text-ink">{CLAIM_GARAGE.name}</h2>
        <p className="mt-1 text-xs leading-relaxed text-mute">{CLAIM_GARAGE.address}</p>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => showToast(`Calling ${CLAIM_GARAGE.phone}`)}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/10 text-sm text-ink active:bg-black/5"
          >
            <Phone size={16} strokeWidth={1.75} />
            Call garage
          </button>
          <button
            type="button"
            onClick={() => showToast('Opening directions to Andheri East.')}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/10 text-sm text-ink active:bg-black/5"
          >
            <MapPin size={16} strokeWidth={1.75} />
            Get directions
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-black/5 pt-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/5 font-display text-xs font-bold text-ink">
            {CLAIM.surveyor.name
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-ink">{CLAIM.surveyor.name}</span>
            <span className="block text-[11px] text-mute">{CLAIM.surveyor.role}</span>
          </span>
          <button
            type="button"
            onClick={() => navigate('assist')}
            aria-label={`Message ${CLAIM.surveyor.name}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-maroon/8"
          >
            <MessageCircle size={18} strokeWidth={1.75} className="text-maroon" />
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
        <h2 className="font-display text-base font-bold text-ink">Settlement</h2>
        <dl className="mt-3 space-y-2 font-mono text-xs">
          <SettlementLine label="Approved" value={formatINR(CLAIM.approved)} />
          <SettlementLine label="Your excess" value={`− ${formatINR(CLAIM.excess)}`} />
          <SettlementLine label="Paid directly to garage" value={formatINR(toGarage)} />
          <div className="flex items-center justify-between border-t border-black/5 pt-2">
            <dt className="text-sm text-ink">You pay</dt>
            <dd className="text-base font-medium text-ink">{formatINR(CLAIM.excess)}</dd>
          </div>
        </dl>
      </section>

      <button
        type="button"
        onClick={() => navigate('assist')}
        className="mt-6 min-h-11 w-full text-center text-sm text-maroon"
      >
        Something wrong? Ask Assist
      </button>
    </div>
  )
}

function Stage({ stage, isLast }) {
  const done = stage.state === 'done'
  const current = stage.state === 'current'

  return (
    <li className="flex gap-3">
      <div className="flex w-5 shrink-0 flex-col items-center">
        {done ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage">
            <Check size={12} strokeWidth={3} className="text-white" />
          </span>
        ) : current ? (
          <span className="h-5 w-5 animate-[pulseRing_2200ms_ease-in-out_infinite] rounded-full border-2 border-maroon bg-white" />
        ) : (
          <span className="h-5 w-5 rounded-full border-2 border-ink/15 bg-white" />
        )}

        {!isLast ? (
          <span
            className={`w-0.5 flex-1 ${done
                ? 'bg-sage'
                : 'border-l-2 border-dashed border-ink/15 bg-transparent'
              }`}
          />
        ) : null}
      </div>

      <div className={`min-w-0 flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
        <div className="flex items-baseline justify-between gap-3">
          <p
            className={`text-sm font-medium ${current ? 'text-maroon' : 'text-ink'}`}
          >
            {stage.label}
          </p>
          <p className="shrink-0 font-mono text-xs text-mute">{stage.timestamp}</p>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-mute">{stage.detail}</p>

        {current && stage.liveDetail ? (
          <p className="mt-2 rounded-lg bg-maroon/4 px-3 py-2 text-xs leading-relaxed text-ink">
            {stage.liveDetail}
          </p>
        ) : null}
      </div>
    </li>
  )
}

function SettlementLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-mute">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  )
}
