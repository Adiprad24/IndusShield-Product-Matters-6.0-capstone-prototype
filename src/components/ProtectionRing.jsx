import { PROTECTION_SCORE } from '../data/mockData'
import { SEGMENT_COLORS } from './ui/categoryColors'
import useDrawOnMount from './ui/useDrawOnMount'

const STROKE_RATIO = 13 / 200

const ARC_START = 135
const ARC_SWEEP = 270
const GAP = 4
const SEGMENT_COUNT = PROTECTION_SCORE.segments.length
const SEGMENT_SWEEP = (ARC_SWEEP - GAP * (SEGMENT_COUNT - 1)) / SEGMENT_COUNT

// The ring straddles the maroon header, and the Motor segment is maroon — it
// would vanish against it, as would every 12%-opacity ghost track. A light
// casing behind the arcs keeps all six legible on both backgrounds while
// still letting the header read through. Tune or set to 'transparent'.
const CASING = 'rgba(255,255,255,0.45)'

function buildSegments(size) {
  const center = size / 2
  const stroke = size * STROKE_RATIO
  const radius = center - stroke / 2 - size * 0.02

  const polar = (angle) => {
    const radians = (angle * Math.PI) / 180
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    }
  }

  return PROTECTION_SCORE.segments.map((segment, index) => {
    const startAngle = ARC_START + index * (SEGMENT_SWEEP + GAP)
    const endAngle = startAngle + SEGMENT_SWEEP
    const start = polar(startAngle)
    const end = polar(endAngle)
    const largeArc = SEGMENT_SWEEP > 180 ? 1 : 0
    return {
      ...segment,
      path: `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    }
  })
}

/**
 * Segmented protection gauge. Each category gets a dashed "ghost" track at full
 * length and a solid arc proportional to its score — so a zero, like Travel,
 * reads as a visible absence rather than as nothing at all.
 *
 * Pass onPress to make it tappable; without it the ring is presentational, so
 * it never renders as a button that goes nowhere.
 */
export default function ProtectionRing({ size = 200, onPress }) {
  const { drawn, reducedMotion } = useDrawOnMount()

  const stroke = size * STROKE_RATIO
  const segments = buildSegments(size)

  const content = (
    <>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {segments.map((segment) => (
          <path
            key={`casing-${segment.category}`}
            d={segment.path}
            fill="none"
            stroke={CASING}
            strokeWidth={stroke + 5}
            strokeLinecap="round"
          />
        ))}

        {segments.map((segment) => (
          <path
            key={`track-${segment.category}`}
            d={segment.path}
            fill="none"
            stroke={SEGMENT_COLORS[segment.category]}
            strokeOpacity={0.12}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray="2 3"
          />
        ))}

        {segments.map((segment, index) => (
          <path
            key={`score-${segment.category}`}
            d={segment.path}
            fill="none"
            stroke={SEGMENT_COLORS[segment.category]}
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={drawn ? 100 - segment.score : 100}
            style={
              reducedMotion
                ? undefined
                : {
                    transition: 'stroke-dashoffset 700ms ease-out',
                    transitionDelay: `${index * 80}ms`,
                  }
            }
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-0.5">
          <span
            className="font-display font-extrabold leading-none text-ink"
            style={{ fontSize: size * 0.24 }}
          >
            {PROTECTION_SCORE.overall}
          </span>
          <span className="font-display text-base font-bold text-mute">/100</span>
        </div>
        <span className="mt-2 text-xs uppercase tracking-widest text-mute">
          Protection Score
        </span>
      </div>
    </>
  )

  const className = 'relative mx-auto block'
  const style = { width: size, height: size }

  if (!onPress) {
    return (
      <div className={className} style={style}>
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`Protection score ${PROTECTION_SCORE.overall} out of 100. See the breakdown.`}
      className={className}
      style={style}
    >
      {content}
    </button>
  )
}
