/**
 * Placeholder block with a sweep across it. Decorative only — hidden from
 * assistive tech, which should hear the real content when it lands.
 */
export default function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-xl bg-ink/8 ${className}`}
    >
      <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-[shimmer_1400ms_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}
