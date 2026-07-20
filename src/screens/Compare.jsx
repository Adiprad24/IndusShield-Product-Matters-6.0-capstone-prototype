import { useState } from 'react'
import BottomSheet from '../components/BottomSheet'
import {
  COMPARISONS,
  JARGON,
  formatINR,
  formatLakh,
  resolveProduct,
} from '../data/mockData'

export default function Compare({ navigate, screenData }) {
  const product = resolveProduct(screenData)
  const table = COMPARISONS[product.category]

  const [optionIndex, setOptionIndex] = useState(0)
  const [openTerm, setOpenTerm] = useState(null)

  const premium = product.premiumOptions[optionIndex] ?? product.premiumOptions[0]
  const columns = ['IndusShield', ...table.competitors]

  const valueFor = (row, column) => {
    const raw = column === 0 ? row.us : row.them[column - 1]
    if (!row.perOption) return raw
    const value = raw[optionIndex] ?? raw[0]
    return row.currency ? formatINR(value) : value
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="px-5 pt-4 pb-32">
        {product.sumInsuredOptions.length > 1 ? (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-mute">Cover amount</h2>
            <div className="mt-2 flex gap-1 rounded-xl bg-ink/5 p-1">
              {product.sumInsuredOptions.map((option, index) => {
                const active = index === optionIndex
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setOptionIndex(index)}
                    aria-pressed={active}
                    className={`min-h-11 flex-1 rounded-lg font-mono text-sm ${
                      active ? 'bg-white font-medium text-ink shadow-sm' : 'text-mute'
                    }`}
                  >
                    {formatLakh(option)}
                  </button>
                )
              })}
            </div>
          </section>
        ) : (
          <section>
            <p className="text-sm text-mute">
              Cover{' '}
              <span className="font-mono text-ink">
                {formatLakh(product.sumInsuredOptions[0])}
              </span>
            </p>
          </section>
        )}

        <section className="mt-5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="grid grid-cols-[1.15fr_1fr_1fr]">
            <div className="border-b border-black/5 px-3 py-3" />
            {columns.map((column, index) => (
              <div
                key={column}
                className={`border-b border-black/5 px-2 py-3 text-center ${
                  index === 0 ? 'border-t-2 border-t-maroon bg-maroon/4' : ''
                }`}
              >
                <span
                  className={`text-[11px] leading-tight ${
                    index === 0 ? 'font-medium text-maroon' : 'text-mute'
                  }`}
                >
                  {column}
                </span>
              </div>
            ))}

            {table.rows.map((row) => (
              <Row
                key={row.label}
                row={row}
                valueFor={valueFor}
                onOpenTerm={setOpenTerm}
              />
            ))}
          </div>
        </section>

        <p className="mt-3 text-xs leading-relaxed text-mute">
          Tap any underlined term to see what it means for you. We do not win every
          row — where a competitor is better, it says so.
        </p>
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-black/5 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="font-mono text-lg leading-tight text-ink">
              {formatINR(premium)}
            </p>
            <p className="text-[11px] text-mute">per year</p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate('buy', { productId: product.id, optionIndex })
            }
            className="min-h-11 flex-1 rounded-xl bg-maroon px-4 text-sm font-medium text-white active:bg-maroon-deep"
          >
            Buy this plan
          </button>
        </div>
      </div>

      <BottomSheet
        open={Boolean(openTerm)}
        onClose={() => setOpenTerm(null)}
        title={openTerm ?? ''}
      >
        {openTerm ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-ink">
              {JARGON[openTerm].plain}
            </p>
            <div className="mt-4 rounded-xl bg-paper p-3">
              <p className="text-sm leading-relaxed text-ink">
                <span className="font-medium">For you, this means:</span>{' '}
                {JARGON[openTerm].forYou}
              </p>
            </div>
          </>
        ) : null}
      </BottomSheet>
    </div>
  )
}

function Row({ row, valueFor, onOpenTerm }) {
  const hasJargon = Boolean(JARGON[row.label])

  return (
    <>
      <div className="border-b border-black/5 px-3 py-3">
        {hasJargon ? (
          <button
            type="button"
            onClick={() => onOpenTerm(row.label)}
            className="text-left text-xs leading-tight text-ink underline decoration-mute decoration-dotted underline-offset-4"
          >
            {row.label}
          </button>
        ) : (
          <span className="text-xs leading-tight text-ink">{row.label}</span>
        )}
      </div>

      {[0, 1, 2].map((column) => {
        const isUs = column === 0
        const wins = isUs ? row.winner === 'us' : false
        const loses = isUs && row.winner === 'them'

        return (
          <div
            key={column}
            className={`border-b border-black/5 px-2 py-3 text-center ${
              isUs ? 'bg-maroon/4' : ''
            }`}
          >
            <span
              className={`font-mono text-xs leading-tight ${
                wins ? 'font-medium text-maroon' : loses ? 'text-mute' : 'text-ink'
              }`}
            >
              {valueFor(row, column)}
            </span>
          </div>
        )
      })}
    </>
  )
}
