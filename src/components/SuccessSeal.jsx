import { Check } from 'lucide-react'
import useDrawOnMount from './ui/useDrawOnMount'

const SIZE = 132
const RADIUS = 60

/**
 * Certificate stamp: the maroon disc presses in, a gold ring draws around it,
 * then the check lands.
 */
export default function SuccessSeal() {
  const { drawn, reducedMotion } = useDrawOnMount()
  const circumference = 2 * Math.PI * RADIUS

  const ease = (delay) =>
    reducedMotion ? undefined : { transition: 'all 600ms ease-out', transitionDelay: delay }

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={drawn ? 0 : circumference}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={
            reducedMotion
              ? undefined
              : { transition: 'stroke-dashoffset 800ms ease-out', transitionDelay: '120ms' }
          }
        />
      </svg>

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: drawn ? 'scale(1)' : 'scale(0.4)',
          opacity: drawn ? 1 : 0,
          ...ease('0ms'),
        }}
      >
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-maroon">
          <span
            style={{
              transform: drawn ? 'scale(1)' : 'scale(0.5)',
              opacity: drawn ? 1 : 0,
              ...ease('420ms'),
            }}
          >
            <Check size={40} strokeWidth={2.5} className="text-white" />
          </span>
        </span>
      </div>
    </div>
  )
}
