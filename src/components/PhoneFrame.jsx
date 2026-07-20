import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { useState } from 'react'
import { OverlayContext } from './ui/overlayContext'

/**
 * Desktop presentation shell. At >=768px the app sits inside a 390x844 device
 * frame; below that it renders full-bleed and the real device supplies its own
 * status bar. Children fill the content area and manage their own scrolling —
 * the page itself never scrolls on desktop.
 */
export default function PhoneFrame({ children }) {
  const [overlayNode, setOverlayNode] = useState(null)

  return (
    <div className="min-h-[100dvh] bg-paper md:flex md:h-screen md:min-h-0 md:items-start md:justify-center md:gap-16 md:overflow-auto md:p-6">
      {/* my-auto rather than items-center: it still centres, but degrades to a
          scrollable top edge instead of clipping on short laptop windows. */}
      <aside className="hidden lg:block lg:my-auto">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
          IndusShield
        </h1>
        <p className="mt-3 text-sm text-mute">
          IndusInd Bank · Product Matters 6.0 Capstone
        </p>
      </aside>

      <div className="md:my-auto md:shrink-0 md:rounded-[54px] md:bg-ink md:p-[10px] md:shadow-[0_30px_60px_-12px_rgba(26,20,24,0.45)]">
        <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-paper md:h-[844px] md:w-[390px] md:rounded-[44px]">
          <StatusBar />

          <OverlayContext.Provider value={overlayNode}>
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </OverlayContext.Provider>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden justify-center pb-2 md:flex"
          >
            <div className="h-[5px] w-[134px] rounded-full bg-ink/70" />
          </div>

          {/* Overlays portal in here so they cover the device, not the page. */}
          <div ref={setOverlayNode} className="pointer-events-none absolute inset-0 z-30" />
        </div>
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div
      aria-hidden="true"
      className="hidden shrink-0 items-center justify-between px-8 pt-3 pb-1 text-ink md:flex"
    >
      <span className="font-body text-[15px] font-semibold tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal size={16} strokeWidth={1.75} />
        <Wifi size={16} strokeWidth={1.75} />
        <BatteryFull size={20} strokeWidth={1.75} />
      </div>
    </div>
  )
}
