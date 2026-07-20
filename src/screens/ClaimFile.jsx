import {
  Banknote,
  Camera,
  Car,
  Check,
  CloudRain,
  KeyRound,
  MapPin,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '../components/ui/toastContext'
import {
  CLAIM,
  CLAIM_ASSESSMENT,
  CLAIM_DEFAULT_LOCATION,
  CLAIM_GARAGE,
  CLAIM_INCIDENT_AT,
  CLAIM_INCIDENT_TYPES,
  CLAIM_PHOTO_SLOTS,
  POLICIES,
  formatINR,
} from '../data/mockData'

const TYPE_ICONS = { Car, KeyRound, CloudRain, Users }

const MOTOR_POLICY = POLICIES.find((policy) => policy.category === 'Motor')
const PHOTOS_REQUIRED = 3

// Scripted assessment: scan, then one finding every 700ms, then the estimate.
const SCAN_MS = 1200
const FINDING_GAP_MS = 700

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

export default function ClaimFile({ navigate }) {
  const showToast = useToast()
  const [step, setStep] = useState(1)
  const [incidentType, setIncidentType] = useState('accident')
  const [photos, setPhotos] = useState([])
  const [repairMode, setRepairMode] = useState('cashless')
  const [pickupSlot, setPickupSlot] = useState(CLAIM_GARAGE.pickupSlots[0])
  const [submitted, setSubmitted] = useState(false)

  if (submitted) return <Submitted navigate={navigate} />

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex gap-1.5 px-5 pt-4">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1 flex-1 rounded-full transition-colors ${segment <= step ? 'bg-maroon' : 'bg-ink/10'
              }`}
          />
        ))}
      </div>

      <div className="flex-1 px-5 pt-5 pb-4">
        {step === 1 ? (
          <StepIncident
            incidentType={incidentType}
            setIncidentType={setIncidentType}
            showToast={showToast}
          />
        ) : null}

        {step === 2 ? <StepPhotos photos={photos} setPhotos={setPhotos} /> : null}

        {step === 3 ? <StepAssessment onDone={() => setStep(4)} /> : null}

        {step === 4 ? (
          <StepRepair
            repairMode={repairMode}
            setRepairMode={setRepairMode}
            pickupSlot={pickupSlot}
            setPickupSlot={setPickupSlot}
          />
        ) : null}
      </div>

      {step !== 3 ? (
        <div className="sticky bottom-0 border-t border-black/5 bg-white px-5 py-3">
          {step === 2 && photos.length < PHOTOS_REQUIRED ? (
            <p className="mb-2 text-xs text-mute">
              {photos.length} of {CLAIM_PHOTO_SLOTS.length} added. Add at least{' '}
              {PHOTOS_REQUIRED} so we can assess the damage.
            </p>
          ) : null}

          <div className="flex gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="min-h-11 rounded-xl border border-black/10 px-4 text-sm text-ink active:bg-black/5"
              >
                Back
              </button>
            ) : null}

            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-11 flex-1 rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
              >
                Continue
              </button>
            ) : null}

            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={photos.length < PHOTOS_REQUIRED}
                className="min-h-11 flex-1 rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep disabled:bg-ink/15 disabled:text-mute"
              >
                Analyse damage
              </button>
            ) : null}

            {step === 4 ? (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="min-h-11 flex-1 rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
              >
                Submit claim
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function StepIncident({ incidentType, setIncidentType, showToast }) {
  return (
    <>
      <h2 className="font-display text-2xl font-bold text-ink">What happened?</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {CLAIM_INCIDENT_TYPES.map((type) => {
          const Icon = TYPE_ICONS[type.icon]
          const active = incidentType === type.id
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setIncidentType(type.id)}
              aria-pressed={active}
              className={`flex min-h-[88px] flex-col items-start justify-between rounded-2xl border p-4 text-left ${active ? 'border-maroon bg-maroon/4' : 'border-black/5 bg-white shadow-sm'
                }`}
            >
              <Icon
                size={20}
                strokeWidth={1.75}
                className={active ? 'text-maroon' : 'text-mute'}
              />
              <span className="text-sm leading-tight font-medium text-ink">
                {type.label}
              </span>
            </button>
          )
        })}
      </div>

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
        <p className="text-xs text-mute">Vehicle</p>
        <p className="mt-1 font-mono text-sm text-ink">{MOTOR_POLICY.vehicle}</p>
        <button
          type="button"
          onClick={() => showToast('Only one vehicle on your policy. Call us to add another.')}
          className="mt-2 min-h-11 text-sm text-maroon"
        >
          Not this vehicle?
        </button>
      </section>

      <section className="mt-3 space-y-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs text-mute">When</p>
          <p className="mt-1 font-mono text-sm text-ink">{CLAIM_INCIDENT_AT}</p>
        </div>

        <div>
          <p className="text-xs text-mute">Where</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink">
            <MapPin size={16} strokeWidth={1.75} className="shrink-0 text-mute" />
            {CLAIM_DEFAULT_LOCATION}
            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-mute">
              Detected
            </span>
          </p>
        </div>
      </section>
    </>
  )
}

function StepPhotos({ photos, setPhotos }) {
  const toggleSlot = (slot) =>
    setPhotos(
      photos.includes(slot) ? photos.filter((item) => item !== slot) : [...photos, slot],
    )

  return (
    <>
      <h2 className="font-display text-2xl font-bold text-ink">Show us the damage</h2>
      <p className="mt-1 text-sm text-mute">
        Four quick photos. Tap a slot to capture, tap again to retake.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {CLAIM_PHOTO_SLOTS.map((slot) => {
          const filled = photos.includes(slot)
          return (
            <button
              key={slot}
              type="button"
              onClick={() => toggleSlot(slot)}
              aria-pressed={filled}
              aria-label={filled ? `${slot} captured. Tap to retake.` : `Capture ${slot}`}
              className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border text-center ${filled
                  ? 'border-maroon/30 bg-maroon/8'
                  : 'border-dashed border-black/20 bg-white'
                }`}
            >
              <Camera
                size={24}
                strokeWidth={1.75}
                className={filled ? 'text-maroon' : 'text-mute'}
              />
              <span className="text-xs font-medium text-ink">{slot}</span>
              {filled ? (
                <span className="flex items-center gap-1 text-[10px] text-sage">
                  <Check size={12} strokeWidth={2.5} />
                  Captured
                </span>
              ) : (
                <span className="text-[10px] text-mute">Tap to capture</span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}

function StepAssessment({ onDone }) {
  const reducedMotion = prefersReducedMotion()
  const [revealed, setRevealed] = useState(reducedMotion ? CLAIM_ASSESSMENT.findings.length : 0)
  const [complete, setComplete] = useState(reducedMotion)
  const timers = useRef([])

  useEffect(() => {
    if (reducedMotion) return undefined

    CLAIM_ASSESSMENT.findings.forEach((_, index) => {
      timers.current.push(
        setTimeout(() => setRevealed(index + 1), SCAN_MS + index * FINDING_GAP_MS),
      )
    })
    timers.current.push(
      setTimeout(
        () => setComplete(true),
        SCAN_MS + CLAIM_ASSESSMENT.findings.length * FINDING_GAP_MS,
      ),
    )

    const running = timers.current
    return () => running.forEach(clearTimeout)
  }, [reducedMotion])

  return (
    <>
      <h2 className="font-display text-2xl font-bold text-ink">
        {complete ? 'Here is what we found' : 'Analysing your photos'}
      </h2>

      <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-ink/8">
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera size={32} strokeWidth={1.5} className="text-mute" />
        </div>

        {!complete ? (
          <div
            aria-hidden="true"
            className="absolute inset-y-0 -left-1/3 w-1/3 animate-[shimmer_1400ms_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent"
          />
        ) : null}
      </div>

      {!complete ? (
        <p role="status" className="mt-3 text-center text-xs text-mute">
          Comparing against {CLAIM_ASSESSMENT.comparableClaims.toLocaleString('en-IN')}{' '}
          similar claims…
        </p>
      ) : null}

      <ul className="mt-4 space-y-3">
        {CLAIM_ASSESSMENT.findings.slice(0, revealed).map((finding) => (
          <li key={finding} className="flex animate-[fadeUp_300ms_ease-out] gap-3">
            <Check size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-sage" />
            <span className="text-sm leading-relaxed text-ink">{finding}</span>
          </li>
        ))}
      </ul>

      {complete ? (
        <>
          <section className="mt-6 animate-[fadeUp_400ms_ease-out] rounded-2xl border border-black/5 bg-white p-5 text-center shadow-sm">
            <p className="font-display text-4xl font-extrabold text-ink">
              {formatINR(CLAIM.estimate)}
            </p>
            <p className="mt-1 text-sm text-mute">Estimated repair cost</p>
            <p className="mt-3 font-mono text-xs text-mute">
              Based on {CLAIM_ASSESSMENT.comparableClaims.toLocaleString('en-IN')} similar
              Baleno claims
            </p>
          </section>

          <p className="mt-4 rounded-2xl bg-sage/10 p-4 text-sm leading-relaxed text-ink">
            This won&rsquo;t affect your No Claim Bonus if repair cost stays under{' '}
            <span className="font-mono">{formatINR(CLAIM_ASSESSMENT.ncbSafeUnder)}</span>.
          </p>

          <button
            type="button"
            onClick={onDone}
            className="mt-6 min-h-11 w-full rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
          >
            Choose repair
          </button>
        </>
      ) : null}
    </>
  )
}

function StepRepair({ repairMode, setRepairMode, pickupSlot, setPickupSlot }) {
  const options = [
    {
      id: 'cashless',
      Icon: Wrench,
      title: 'Cashless at a network garage',
      recommended: true,
      detail: `${CLAIM_GARAGE.name} · ${CLAIM_GARAGE.distanceKm} km · we pay them directly, you pay ₹0`,
    },
    {
      id: 'reimbursement',
      Icon: Banknote,
      title: 'Reimbursement',
      recommended: false,
      detail: 'Use any garage, pay the bill yourself, and claim it back in 7–10 days.',
    },
  ]

  return (
    <>
      <h2 className="font-display text-2xl font-bold text-ink">How should we repair it?</h2>

      <div className="mt-4 space-y-3">
        {options.map(({ id, Icon, title, detail, recommended }) => {
          const active = repairMode === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setRepairMode(id)}
              aria-pressed={active}
              className={`flex w-full gap-3 rounded-2xl border p-4 text-left ${active ? 'border-maroon bg-maroon/4' : 'border-black/5 bg-white shadow-sm'
                }`}
            >
              <Icon
                size={20}
                strokeWidth={1.75}
                className={`mt-0.5 shrink-0 ${active ? 'text-maroon' : 'text-mute'}`}
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-ink">{title}</span>
                  {recommended ? (
                    <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage">
                      Recommended
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-mute">{detail}</span>
              </span>
            </button>
          )
        })}
      </div>

      {repairMode === 'cashless' ? (
        <>
          <h3 className="mt-6 text-sm font-medium text-ink">When should we collect it?</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {CLAIM_GARAGE.pickupSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setPickupSlot(slot)}
                aria-pressed={pickupSlot === slot}
                className={`min-h-11 rounded-full px-4 text-sm ${pickupSlot === slot
                    ? 'bg-maroon font-medium text-white'
                    : 'border border-black/10 bg-white text-mute'
                  }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </>
  )
}

function Submitted({ navigate }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
        <Check size={32} strokeWidth={2.5} className="text-sage" />
      </span>

      <h2 className="mt-5 font-display text-2xl font-bold text-ink">Claim submitted</h2>

      <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-sage">
        <Zap size={18} strokeWidth={2} />
        Approved in 2 minutes
      </p>

      <dl className="mt-6 w-full space-y-2 rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-xs text-mute">Claim ID</dt>
          <dd className="font-mono text-sm text-ink">{CLAIM.claimId}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-xs text-mute">Approved</dt>
          <dd className="font-mono text-sm text-ink">{formatINR(CLAIM.approved)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-xs text-mute">Garage</dt>
          <dd className="text-right text-sm text-ink">{CLAIM_GARAGE.name}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => navigate('claimTrack')}
        className="mt-6 min-h-11 w-full rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
      >
        Track this claim
      </button>
    </div>
  )
}
