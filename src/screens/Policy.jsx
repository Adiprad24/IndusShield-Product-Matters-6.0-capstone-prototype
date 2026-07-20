import {
  Ban,
  Check,
  CircleAlert,
  Download,
  FileText,
  Plus,
  RefreshCw,
  Share2,
  X,
} from 'lucide-react'
import PolicyCard from '../components/PolicyCard'
import { daysUntil } from '../components/ui/policyDates'
import LedgerRow from '../components/ui/LedgerRow'
import { useToast } from '../components/ui/toastContext'
import {
  BANK_SIGNALS,
  POLICY_DOCUMENTS,
  POLICY_PLAIN_TERMS,
  PRODUCTS,
  formatINR,
  resolvePolicy,
} from '../data/mockData'

export default function Policy({ navigate, screenData }) {
  const showToast = useToast()
  const policy = resolvePolicy(screenData)
  const terms = POLICY_PLAIN_TERMS[policy.id] ?? { covered: [], notCovered: [] }
  const days = daysUntil(policy.expiry)

  // Evidence for the gap callout: the bill this policy failed to cover.
  const evidence = BANK_SIGNALS.find((signal) => signal.signalType === 'out-of-pocket')
  const topUp = PRODUCTS.find((product) => product.category === policy.category)

  const actions = [
    {
      label: 'File a claim',
      Icon: FileText,
      onPress: () => navigate('claimFile', policy),
    },
    {
      label: 'Renew',
      Icon: RefreshCw,
      onPress: () =>
        topUp
          ? navigate('buy', { productId: topUp.id })
          : showToast('Renewal opens 60 days before expiry.'),
    },
    {
      label: 'Share',
      Icon: Share2,
      onPress: () => showToast('Policy PDF ready to share.'),
    },
    {
      label: 'Cancel',
      Icon: Ban,
      onPress: () =>
        showToast('Cancelling needs a quick call. We will ring you within 2 hours.'),
    },
  ]

  return (
    <div className="px-5 pt-4 pb-10">
      <PolicyCard policy={policy} />

      <p className="mt-2 text-xs text-mute">
        Policy <span className="font-mono text-ink">{policy.policyNo}</span>
        {policy.vehicle ? ` · ${policy.vehicle}` : ''}
      </p>

      <section className="mt-6">
        <h2 className="font-display text-base font-bold text-ink">
          What you&rsquo;re covered for
        </h2>
        <ul className="mt-3 space-y-3">
          {terms.covered.map((line) => (
            <li key={line} className="flex gap-3">
              <Check size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-sage" />
              <span className="text-sm leading-relaxed text-ink">{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-base font-bold text-ink">
          What you&rsquo;re not covered for
        </h2>
        <ul className="mt-3 space-y-3">
          {terms.notCovered.map((line) => (
            <li key={line} className="flex gap-3">
              <X size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-mute" />
              <span className="text-sm leading-relaxed text-mute">{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {policy.gap ? (
        <section className="mt-6 rounded-2xl border border-alert/30 bg-white p-4">
          <div className="flex items-center gap-2">
            <CircleAlert size={18} strokeWidth={1.75} className="shrink-0 text-alert" />
            <h2 className="font-display text-base font-bold text-ink">
              This cover has a hole in it
            </h2>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-ink">{policy.gap}</p>

          {evidence ? (
            <>
              <p className="mt-3 text-xs text-mute">You have already paid for this once:</p>
              <LedgerRow
                className="mt-2"
                date={evidence.date}
                merchant={evidence.merchant}
                amount={evidence.amount}
              />
              <p className="mt-2 text-xs leading-relaxed text-mute">
                {formatINR(evidence.amount)} of that stay came out of your own pocket
                because the room cost more than the cap.
              </p>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => navigate('discover', { category: policy.category })}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
          >
            <Plus size={16} strokeWidth={2} />
            Add a top-up
          </button>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="font-display text-base font-bold text-ink">Documents</h2>
        <ul className="mt-3 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          {POLICY_DOCUMENTS.map((document) => (
            <li key={document.id}>
              <button
                type="button"
                onClick={() => showToast(`${document.name} downloaded.`)}
                className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ink">{document.name}</span>
                  <span className="block font-mono text-[11px] text-mute">
                    {document.detail}
                  </span>
                </span>
                <Download size={18} strokeWidth={1.75} className="shrink-0 text-maroon" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-base font-bold text-ink">Manage</h2>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {actions.map(({ label, Icon, onPress }) => (
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

      {days <= 30 ? (
        <p className="mt-6 text-center text-xs text-mute">
          This policy expires in <span className="text-alert">{days} days</span>.
        </p>
      ) : null}
    </div>
  )
}
