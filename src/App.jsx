import { useCallback, useState } from 'react'
import BottomNav from './components/BottomNav'
import PhoneFrame from './components/PhoneFrame'
import ScreenHeader from './components/ScreenHeader'
import ToastProvider from './components/ToastProvider'
import { resolveProduct } from './data/mockData'
import Assist from './screens/Assist'
import Buy from './screens/Buy'
import ClaimFile from './screens/ClaimFile'
import ClaimTrack from './screens/ClaimTrack'
import Compare from './screens/Compare'
import Discover from './screens/Discover'
import Home from './screens/Home'
import Policy from './screens/Policy'
import Score from './screens/Score'
import Services from './screens/Services'
import Vault from './screens/Vault'

// chrome: 'nav' screens are the five tab roots and show the bottom nav.
// chrome: 'header' screens are pushed on top and show a back header instead.
const SCREENS = {
  home: { Component: Home, chrome: 'nav' },
  vault: { Component: Vault, chrome: 'nav' },
  claimTrack: { Component: ClaimTrack, chrome: 'nav' },
  assist: { Component: Assist, chrome: 'nav' },
  services: { Component: Services, chrome: 'nav' },

  score: { Component: Score, chrome: 'header', title: 'Protection Score' },
  discover: { Component: Discover, chrome: 'header', title: 'Recommended for you' },
  compare: {
    Component: Compare,
    chrome: 'header',
    title: 'Compare plans',
    subtitle: (data) => resolveProduct(data).name,
  },
  buy: { Component: Buy, chrome: 'header', title: 'Buy', subtitle: (data) => resolveProduct(data).name },
  policy: { Component: Policy, chrome: 'header', title: 'Policy' },
  claimFile: { Component: ClaimFile, chrome: 'header', title: 'File a claim' },
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [screenData, setScreenData] = useState(null)
  const [history, setHistory] = useState([])
  // Bumped on every move so <main> remounts: replays the transition, and resets
  // scroll so a new screen never opens halfway down the previous one.
  const [navSeq, setNavSeq] = useState(0)

  const navigate = useCallback(
    (target, data = null) => {
      if (!SCREENS[target]) return
      // Re-tapping the active tab is a no-op; a sub-screen may re-navigate to
      // itself with different data (one product's comparison to another's).
      if (target === screen && SCREENS[target].chrome === 'nav') return
      // Tab roots restart the stack — they never show a back button, so any
      // history behind them would be unreachable.
      setHistory(
        SCREENS[target].chrome === 'nav' ? [] : [...history, { screen, screenData }],
      )
      setScreen(target)
      setScreenData(data)
      setNavSeq((seq) => seq + 1)
    },
    [screen, screenData, history],
  )

  const back = useCallback(() => {
    if (history.length === 0) return
    const previous = history[history.length - 1]
    setScreen(previous.screen)
    setScreenData(previous.screenData)
    setHistory(history.slice(0, -1))
    setNavSeq((seq) => seq + 1)
  }, [history])

  const { Component, chrome, title, subtitle } = SCREENS[screen]
  const resolve = (value) => (typeof value === 'function' ? value(screenData) : value)

  return (
    <PhoneFrame>
      <ToastProvider>
        {chrome === 'header' ? (
          <ScreenHeader
            title={resolve(title)}
            subtitle={resolve(subtitle)}
            onBack={history.length > 0 ? back : () => navigate('home')}
          />
        ) : null}

        <main
          key={navSeq}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain animate-[screenIn_200ms_ease-out]"
        >
          <Component navigate={navigate} back={back} screenData={screenData} />
        </main>

        {chrome === 'nav' ? <BottomNav screen={screen} navigate={navigate} /> : null}
      </ToastProvider>
    </PhoneFrame>
  )
}
