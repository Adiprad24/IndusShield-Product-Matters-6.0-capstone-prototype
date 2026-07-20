import {
  Ambulance,
  Award,
  ClipboardList,
  FileText,
  Footprints,
  HeartPulse,
  Phone,
  Siren,
  Stethoscope,
  Truck,
  UserRound,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import BottomSheet from '../components/BottomSheet'
import { useToast } from '../components/ui/toastContext'
import useDrawOnMount from '../components/ui/useDrawOnMount'
import {
  SERVICES,
  SOS_CONTACTS,
  WELLNESS,
  formatINR,
} from '../data/mockData'

const ICONS = {
  Stethoscope,
  Truck,
  HeartPulse,
  Wrench,
  Award,
  Siren,
  ClipboardList,
  FileText,
  Ambulance,
  UserRound,
}

// Wellness and SOS get their own treatments above and below, so the grid shows
// the six services that don't already appear elsewhere on this screen.
const GRID_SERVICES = SERVICES.filter((service) => !service.feature)

export default function Services() {
  const showToast = useToast()
  const [openService, setOpenService] = useState(null)
  const [sosOpen, setSosOpen] = useState(false)
  const { drawn, reducedMotion } = useDrawOnMount()

  const progress = Math.min((WELLNESS.points / WELLNESS.nextTier) * 100, 100)
  const remaining = Math.max(WELLNESS.nextTier - WELLNESS.points, 0)

  return (
    <div className="px-5 pt-5 pb-24">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Beyond insurance</h1>
        <p className="mt-1 text-sm leading-relaxed text-mute">
          Protection is the product. These are the reasons to open the app when
          nothing&rsquo;s gone wrong.
        </p>
      </header>

      <section className="mt-5 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-3xl leading-none text-ink">
              {WELLNESS.points.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-xs text-mute">Wellness points</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/15">
            <Footprints size={20} strokeWidth={1.75} className="text-gold" />
          </span>
        </div>

        <div className="mt-4">
          {/* The width animates in, so the value lives on the element itself
              rather than only in the rendered bar. */}
          <div
            role="progressbar"
            aria-valuenow={WELLNESS.points}
            aria-valuemin={0}
            aria-valuemax={WELLNESS.nextTier}
            aria-label={`${WELLNESS.points} of ${WELLNESS.nextTier} points to ${WELLNESS.nextReward}`}
            className="h-1.5 overflow-hidden rounded-full bg-ink/8"
          >
            <div
              className="h-1.5 rounded-full bg-gold"
              style={{
                width: drawn ? `${progress}%` : '0%',
                ...(reducedMotion ? {} : { transition: 'width 700ms ease-out' }),
              }}
            />
          </div>
          <p className="mt-2 text-xs text-mute">
            <span className="font-mono text-ink">{remaining.toLocaleString('en-IN')}</span>{' '}
            points to {WELLNESS.nextReward}
          </p>
        </div>

        <p className="mt-4 border-t border-black/5 pt-3 text-xs leading-relaxed text-mute">
          {WELLNESS.rule}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-base font-bold text-ink">Services</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {GRID_SERVICES.map((service) => {
            const Icon = ICONS[service.icon]
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setOpenService(service)}
                className="flex flex-col rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-maroon/8">
                  <Icon size={20} strokeWidth={1.75} className="text-maroon" />
                </span>

                <span className="mt-3 text-sm leading-tight font-medium text-ink">
                  {service.name}
                </span>
                <span className="mt-1 flex-1 text-xs leading-snug text-mute">
                  {service.detail}
                </span>

                <span className="mt-3">
                  {service.free ? (
                    <span className="rounded-full bg-sage/10 px-2 py-1 text-[10px] font-medium text-sage">
                      Free with your cover
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-ink">
                      {formatINR(service.price)}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-6">
        <button
          type="button"
          onClick={() => setSosOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-alert/40 bg-white p-4 text-left"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-alert/10">
            <Phone size={20} strokeWidth={1.75} className="text-alert" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-ink">Emergency SOS</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-mute">
              One tap connects you to roadside assistance, ambulance, or your claims
              manager.
            </span>
          </span>
        </button>
      </section>

      <BottomSheet
        open={Boolean(openService)}
        onClose={() => setOpenService(null)}
        title={openService?.name ?? ''}
      >
        {openService ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-ink">
              {openService.description}
            </p>

            <p className="mt-3 text-xs text-mute">
              {openService.free ? (
                <span className="text-sage">Free with your cover</span>
              ) : (
                <>
                  <span className="font-mono text-ink">
                    {formatINR(openService.price)}
                  </span>{' '}
                  at partner rates
                </>
              )}
            </p>

            <button
              type="button"
              onClick={() => {
                showToast(`${openService.name} — we will confirm by SMS shortly.`)
                setOpenService(null)
              }}
              className="mt-5 min-h-11 w-full rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
            >
              {openService.action}
            </button>
          </>
        ) : null}
      </BottomSheet>

      <BottomSheet
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        title="Emergency SOS"
      >
        <p className="mt-2 text-sm text-mute">Who do you need right now?</p>

        <div className="mt-4 space-y-2">
          {SOS_CONTACTS.map((contact) => {
            const Icon = ICONS[contact.icon]
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => {
                  showToast(`Calling ${contact.label} on ${contact.number}`)
                  setSosOpen(false)
                }}
                className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm active:bg-black/5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-alert/10">
                  <Icon size={20} strokeWidth={1.75} className="text-alert" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{contact.label}</span>
                  <span className="block text-xs text-mute">{contact.detail}</span>
                  <span className="mt-0.5 block font-mono text-xs text-ink">
                    {contact.number}
                  </span>
                </span>
                <Phone size={18} strokeWidth={1.75} className="shrink-0 text-alert" />
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </div>
  )
}
