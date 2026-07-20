import { ArrowUpRight, Check, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import SuccessSeal from '../components/SuccessSeal'
import { useOverlayContainer } from '../components/ui/overlayContext'
import useCountUp from '../components/ui/useCountUp'
import {
  ADD_ONS,
  CONDITION_OPTIONS,
  GST_RATE,
  PAYMENT_METHODS,
  POLICIES,
  POLICY_PREFIXES,
  PROTECTION_SCORE,
  SCORE_AFTER_PURCHASE,
  USER,
  formatINR,
  formatLakh,
  resolveProduct,
} from '../data/mockData'

const MEMBER_OPTIONS = ['Self', 'Spouse', 'Child']

function toggle(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export default function Buy({ navigate, screenData }) {
  const product = resolveProduct(screenData)
  const addOnCatalogue = ADD_ONS[product.category] ?? []

  const [step, setStep] = useState(1)
  const [optionIndex, setOptionIndex] = useState(screenData?.optionIndex ?? 0)
  const [members, setMembers] = useState(MEMBER_OPTIONS)
  const [conditions, setConditions] = useState(['None'])
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [payment, setPayment] = useState(PAYMENT_METHODS[0].id)
  const [consent, setConsent] = useState(false)
  const [purchased, setPurchased] = useState(false)

  const base = product.premiumOptions[optionIndex] ?? product.premiumOptions[0]
  const cover = product.sumInsuredOptions[optionIndex] ?? product.sumInsuredOptions[0]
  const chosenAddOns = addOnCatalogue.filter((addOn) => selectedAddOns.includes(addOn.id))
  const addOnTotal = chosenAddOns.reduce((sum, addOn) => sum + addOn.price, 0)
  const subtotal = base + addOnTotal
  const gst = Math.round(subtotal * GST_RATE)
  const total = subtotal + gst

  // Selecting a condition clears "None", and vice versa.
  const pickCondition = (option) => {
    if (option === 'None') return setConditions(['None'])
    const next = toggle(conditions.filter((c) => c !== 'None'), option)
    setConditions(next.length === 0 ? ['None'] : next)
  }

  if (purchased) {
    return (
      <Success
        product={product}
        cover={cover}
        navigate={navigate}
      />
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex gap-1.5 px-5 pt-4">
        {[1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={`h-1 flex-1 rounded-full transition-colors ${
              segment <= step ? 'bg-maroon' : 'bg-ink/10'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 px-5 pt-5 pb-4">
        {step === 1 ? (
          <StepConfirm
            members={members}
            setMembers={setMembers}
            conditions={conditions}
            pickCondition={pickCondition}
          />
        ) : null}

        {step === 2 ? (
          <StepCover
            product={product}
            optionIndex={optionIndex}
            setOptionIndex={setOptionIndex}
            addOnCatalogue={addOnCatalogue}
            selectedAddOns={selectedAddOns}
            setSelectedAddOns={setSelectedAddOns}
          />
        ) : null}

        {step === 3 ? (
          <StepPay
            product={product}
            cover={cover}
            base={base}
            chosenAddOns={chosenAddOns}
            gst={gst}
            total={total}
            payment={payment}
            setPayment={setPayment}
            consent={consent}
            setConsent={setConsent}
          />
        ) : null}
      </div>

      <div className="sticky bottom-0 border-t border-black/5 bg-white px-5 py-3">
        {step === 2 ? (
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-xs text-mute">
              {formatLakh(cover)} cover
              {chosenAddOns.length > 0
                ? ` · ${chosenAddOns.length} add-on${chosenAddOns.length > 1 ? 's' : ''}`
                : ''}
            </span>
            <span className="font-mono text-lg text-ink">
              {formatINR(subtotal)}
              <span className="text-xs text-mute">/year</span>
            </span>
          </div>
        ) : null}

        {step === 3 && !consent ? (
          <p className="mb-2 text-xs text-mute">
            Tick the box above to activate your cover.
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

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="min-h-11 flex-1 rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
            >
              {step === 1 ? 'Continue' : 'Continue to payment'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPurchased(true)}
              disabled={!consent}
              className="min-h-11 flex-1 rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep disabled:bg-ink/15 disabled:text-mute"
            >
              Pay {formatINR(total)} and activate cover
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StepConfirm({ members, setMembers, conditions, pickCondition }) {
  return (
    <>
      <h2 className="font-display text-2xl font-bold text-ink">We already have this</h2>
      <p className="mt-1 text-sm text-mute">
        Everything below came from your account. Check it, do not retype it.
      </p>

      <dl className="mt-4 divide-y divide-black/5 rounded-2xl border border-black/5 bg-white shadow-sm">
        {Object.entries(USER.kyc).map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
            <dt className="shrink-0 text-xs text-mute">{label}</dt>
            <dd className="min-w-0 text-right text-sm text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-mute">
        <Check size={14} strokeWidth={2} className="text-sage" />
        From your IndusInd KYC
      </p>

      <h3 className="mt-6 text-sm font-medium text-ink">Who should this cover?</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {MEMBER_OPTIONS.map((member) => (
          <Chip
            key={member}
            label={member}
            selected={members.includes(member)}
            onPress={() => setMembers(toggle(members, member))}
          />
        ))}
      </div>

      <h3 className="mt-6 text-sm font-medium text-ink">
        Any existing medical conditions?
      </h3>
      <p className="mt-1 text-xs text-mute">
        Declaring these keeps a future claim safe. Hiding one can void it.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {CONDITION_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={conditions.includes(option)}
            onPress={() => pickCondition(option)}
          />
        ))}
      </div>
    </>
  )
}

function StepCover({
  product,
  optionIndex,
  setOptionIndex,
  addOnCatalogue,
  selectedAddOns,
  setSelectedAddOns,
}) {
  return (
    <>
      <h2 className="font-display text-2xl font-bold text-ink">Choose your cover</h2>

      <div className="mt-4 space-y-2">
        {product.sumInsuredOptions.map((option, index) => {
          const active = index === optionIndex
          return (
            <button
              key={option}
              type="button"
              onClick={() => setOptionIndex(index)}
              aria-pressed={active}
              className={`flex min-h-11 w-full items-center justify-between rounded-2xl border p-4 text-left ${
                active
                  ? 'border-maroon bg-maroon/4'
                  : 'border-black/5 bg-white shadow-sm'
              }`}
            >
              <span>
                <span className="font-mono text-lg text-ink">{formatLakh(option)}</span>{' '}
                <span className="text-xs text-mute">cover</span>
              </span>
              <span className="font-mono text-sm text-ink">
                {formatINR(product.premiumOptions[index])}
                <span className="text-xs text-mute">/year</span>
              </span>
            </button>
          )
        })}
      </div>

      {addOnCatalogue.length > 0 ? (
        <>
          <h3 className="mt-6 text-sm font-medium text-ink">Add-ons</h3>
          <ul className="mt-2 space-y-2">
            {addOnCatalogue.map((addOn) => {
              const on = selectedAddOns.includes(addOn.id)
              return (
                <li key={addOn.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedAddOns(toggle(selectedAddOns, addOn.id))}
                    aria-pressed={on}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left ${
                      on ? 'border-maroon bg-maroon/4' : 'border-black/5 bg-white shadow-sm'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        on ? 'border-maroon bg-maroon' : 'border-black/15'
                      }`}
                    >
                      {on ? <Check size={14} strokeWidth={2.5} className="text-white" /> : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">{addOn.name}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-mute">
                        {addOn.plain}
                      </span>
                    </span>

                    <span className="shrink-0 font-mono text-sm text-ink">
                      +{formatINR(addOn.price)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}
    </>
  )
}

function StepPay({
  product,
  cover,
  base,
  chosenAddOns,
  gst,
  total,
  payment,
  setPayment,
  consent,
  setConsent,
}) {
  return (
    <>
      <h2 className="font-display text-2xl font-bold text-ink">Review and pay</h2>

      <section className="mt-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-ink">{product.name}</p>
        <p className="mt-0.5 text-xs text-mute">
          Cover <span className="font-mono">{formatLakh(cover)}</span>
        </p>

        <dl className="mt-3 space-y-2 border-t border-black/5 pt-3 font-mono text-xs">
          <Line label="Base premium" value={formatINR(base)} />
          {chosenAddOns.map((addOn) => (
            <Line key={addOn.id} label={addOn.name} value={`+${formatINR(addOn.price)}`} />
          ))}
          <Line label="GST 18%" value={formatINR(gst)} />
          <div className="flex items-center justify-between border-t border-black/5 pt-2">
            <dt className="text-sm text-ink">Total</dt>
            <dd className="text-base font-medium text-ink">{formatINR(total)}</dd>
          </div>
        </dl>
      </section>

      <h3 className="mt-6 text-sm font-medium text-ink">Pay from</h3>
      <div className="mt-2 space-y-2">
        {PAYMENT_METHODS.map((method) => {
          const active = payment === method.id
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setPayment(method.id)}
              aria-pressed={active}
              className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left ${
                active ? 'border-maroon bg-maroon/4' : 'border-black/5 bg-white shadow-sm'
              }`}
            >
              <span className="min-w-0">
                <span className="block text-sm text-ink">{method.label}</span>
                <span className="block font-mono text-xs text-mute">{method.detail}</span>
              </span>
              {method.id === 'account' ? (
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-sm text-ink">
                    {formatINR(USER.accountBalance)}
                  </span>
                  <span className="block text-[10px] text-mute">Balance</span>
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        role="checkbox"
        aria-checked={consent}
        onClick={() => setConsent(!consent)}
        className="mt-6 flex w-full items-start gap-3 text-left"
      >
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
            consent ? 'border-maroon bg-maroon' : 'border-black/20'
          }`}
        >
          {consent ? <Check size={14} strokeWidth={2.5} className="text-white" /> : null}
        </span>
        <span className="text-xs leading-relaxed text-mute">
          I confirm the details above are correct and I have declared any medical
          conditions. I understand an undeclared condition can void a claim later.
        </span>
      </button>
    </>
  )
}

function Success({ product, cover, navigate }) {
  const container = useOverlayContainer()
  const score = useCountUp(PROTECTION_SCORE.overall, SCORE_AFTER_PURCHASE)
  const policyNo = `${POLICY_PREFIXES[product.category]}/2026/4471903`

  // A brand-new purchase has no policy record. Rather than opening someone
  // else's policy, send them to the vault where the new cover would live.
  const existingPolicy = POLICIES.find((policy) => policy.category === product.category)

  const body = (
    <div className="pointer-events-auto absolute inset-0 flex flex-col overflow-y-auto bg-paper px-5 pt-10 pb-8">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <SuccessSeal />

        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">
          You&rsquo;re covered
        </h1>
        <p className="mt-2 text-sm text-mute">{product.name}</p>

        <dl className="mt-6 w-full space-y-2 rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm">
          <Line label="Policy number" value={policyNo} mono />
          <Line label="Cover starts" value="Immediately" />
          <Line label="Sum insured" value={formatINR(cover)} mono />
        </dl>

        <div className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <ShieldCheck size={20} strokeWidth={1.75} className="shrink-0 text-sage" />
          {/* The visible number ticks; the label states the destination, so a
              screen reader announces the result instead of every frame. */}
          <p
            className="flex-1 text-left text-sm text-ink"
            aria-label={`Your Protection Score went from ${PROTECTION_SCORE.overall} to ${SCORE_AFTER_PURCHASE}`}
          >
            <span aria-hidden="true">
              Your Protection Score went from{' '}
              <span className="font-mono text-mute">{PROTECTION_SCORE.overall}</span> to{' '}
              <span className="font-mono font-medium text-ink">{score}</span>
            </span>
          </p>
          <ArrowUpRight size={20} strokeWidth={1.75} className="shrink-0 text-sage" />
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <button
          type="button"
          onClick={() =>
            existingPolicy ? navigate('policy', existingPolicy) : navigate('vault')
          }
          className="min-h-11 w-full rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
        >
          {existingPolicy ? 'View policy' : 'See it in your vault'}
        </button>
        <button
          type="button"
          onClick={() => navigate('home')}
          className="min-h-11 w-full rounded-xl border border-black/10 px-4 text-sm text-ink active:bg-black/5"
        >
          Back to home
        </button>
      </div>
    </div>
  )

  // Portal so the confirmation covers the device, back header included.
  return container ? createPortal(body, container) : body
}

function Chip({ label, selected, onPress }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={selected}
      className={`min-h-11 rounded-full px-4 text-sm ${
        selected
          ? 'bg-maroon font-medium text-white'
          : 'border border-black/10 bg-white text-mute'
      }`}
    >
      {label}
    </button>
  )
}

function Line({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-xs text-mute">{label}</dt>
      <dd className={`text-right text-sm text-ink ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
