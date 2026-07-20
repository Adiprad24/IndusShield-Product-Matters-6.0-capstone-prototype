# IndusShield

A mobile-first insurance prototype for IndusInd Bank, built for the Product Matters 6.0
product-management capstone. IndusShield reframes bank-owned insurance around a single
asset no insurer has: the customer's own transaction history. Instead of asking Rohan
Mehta to fill in a form describing his life, the app reads the debits already sitting in
his account — a ₹42,800 MakeMyTrip booking, a ₹8,420 premium paid to a competitor, an
₹18,600 hospital bill he covered himself — and turns each one into a specific, evidenced
recommendation. Every screen is designed at 390px, every number comes from a single mock
dataset, and there is no backend.

## Product thesis

Insurance is sold as a product and experienced as paperwork. Banks are the only
distributor who can invert that, because they can see the risk before the customer
describes it.

Three bets follow from this:

1. **Evidence beats persuasion.** A recommendation carrying the customer's own bank
   statement line — date, merchant, amount, set in monospace like a real ledger — is a
   different object from a marketing card. The Signal Card and the "Found in your
   account" import flow are the whole argument in miniature.
2. **Plain language is the product, not the copywriting.** Every policy term is
   rendered with a dotted underline that opens a plain-English explanation ending in
   "For you, this means…", tied to that customer's actual cover. The comparison table
   deliberately loses a row to a competitor, because a clean sweep reads as fiction.
3. **Protection needs a reason to be opened monthly.** Insurance has no natural
   engagement loop, so one is built: a Protection Score that moves, wellness points that
   come off the renewal premium, and an ecosystem of services that are useful when
   nothing has gone wrong.

## Stack

- **React 19** + **Vite 8**
- **Tailwind CSS v4** — configured entirely in `src/index.css` via `@theme`; no
  `tailwind.config.js`
- **lucide-react** for icons
- **Vitest** + **Testing Library** — 103 tests covering all 11 screens
- **Oxlint**

No router: navigation is a `screen` string in `App.jsx` with an explicit history stack.
No state library, no backend, no browser storage anywhere.

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # production build to dist/
npm run preview    # serve the production build
npm test           # 103 tests, jsdom
npm run lint       # oxlint
```

Best viewed at a desktop width — above 768px the app renders inside a 390×844 device
frame; below that it goes full-bleed.

## Screen inventory

| Screen | File | What it does |
| --- | --- | --- |
| Home | `src/screens/Home.jsx` | Protection dashboard: the segmented Protection Ring straddling the header, the top bank signal, policy strip, quick actions |
| Score | `src/screens/Score.jsx` | Score breakdown by category, worst-first, with peer benchmark and per-category targets |
| Discover | `src/screens/Discover.jsx` | Ranked product catalogue; each card carries the bank signal that justifies it |
| Compare | `src/screens/Compare.jsx` | Head-to-head table vs two competitors, live re-pricing, and the jargon decoder |
| Buy | `src/screens/Buy.jsx` | Three-step purchase pre-filled from KYC — no keyboard needed — plus the confirmation seal |
| Vault | `src/screens/Vault.jsx` | Owned policies, detected-policy import, and a 12-month renewal timeline |
| Policy | `src/screens/Policy.jsx` | Policy detail in plain language, exclusions shown as prominently as cover, gap callout |
| ClaimFile | `src/screens/ClaimFile.jsx` | Four-step motor claim with a scripted AI damage assessment |
| ClaimTrack | `src/screens/ClaimTrack.jsx` | Live claim timeline, garage card, settlement breakdown |
| Assist | `src/screens/Assist.jsx` | Scripted assistant grounded in the customer's actual policies |
| Services | `src/screens/Services.jsx` | Wellness points, the service grid, and emergency SOS |

Shared components live in `src/components/` (composed) and `src/components/ui/`
(primitives). All content comes from `src/data/mockData.js`.

## A note on the data

Everything is fictional. Competitor names are real companies but **all competitor
figures — premiums, network counts, settlement ratios — are illustrative placeholders,
not researched market data**, and should not be presented as sourced. The customer,
policies, transactions and claim are invented. `DEMO_TODAY` in `mockData.js` pins the
demo to 19 July 2026 so that "renews in 11 days" stays true whenever it is shown.
