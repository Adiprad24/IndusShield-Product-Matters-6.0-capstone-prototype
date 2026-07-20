import { FileText, Grid2x2, Home, Shield, Sparkles } from 'lucide-react'

const TABS = [
  { screen: 'home', label: 'Home', Icon: Home },
  { screen: 'vault', label: 'Policies', Icon: Shield },
  { screen: 'claimTrack', label: 'Claims', Icon: FileText },
  { screen: 'assist', label: 'Assist', Icon: Sparkles },
  { screen: 'services', label: 'Services', Icon: Grid2x2 },
]

export default function BottomNav({ screen, navigate }) {
  return (
    <nav className="shrink-0 border-t border-black/5 bg-white pb-2 md:pb-6">
      <ul className="flex">
        {TABS.map(({ screen: target, label, Icon }) => {
          const active = screen === target
          return (
            <li key={target} className="flex-1">
              <button
                type="button"
                onClick={() => navigate(target)}
                aria-current={active ? 'page' : undefined}
                className="relative flex h-14 w-full flex-col items-center justify-center gap-1"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 mx-auto h-[2px] w-8 rounded-full ${
                    active ? 'bg-maroon' : 'bg-transparent'
                  }`}
                />
                <Icon
                  size={20}
                  strokeWidth={1.75}
                  className={active ? 'text-maroon' : 'text-mute'}
                />
                <span
                  className={`text-[11px] leading-none ${
                    active ? 'font-medium text-maroon' : 'text-mute'
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
