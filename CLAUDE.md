# IndusShield — Project Context

Mobile-first insurance prototype for IndusInd Bank. Built for a product
management capstone. This is a demo prototype: no backend, no real APIs, all
data from src/data/mockData.js. Optimise for visual polish and demo-ability,
not for production correctness.

## Stack
React 18 + Vite + Tailwind CSS v4 + lucide-react. No react-router — navigation
is state-based via a `screen` string in App.jsx. No localStorage or
sessionStorage anywhere.

## Design tokens
Define these in src/index.css inside an `@theme` block so they become Tailwind
utilities (bg-maroon, text-gold, etc.):

  --color-maroon: #8C1D2F;
  --color-maroon-deep: #5E1220;
  --color-gold: #C9973F;
  --color-ink: #1A1418;
  --color-paper: #F6F4F1;
  --color-sage: #2F6B4F;
  --color-alert: #C2410C;
  --color-mute: #8A8288;

## Type
Load from Google Fonts in index.html:
- Bricolage Grotesque (600,700,800) — display. Screen titles, big numbers.
- Instrument Sans (400,500,600) — body. Default font.
- IBM Plex Mono (400,500) — data.

Set as Tailwind font families: font-display, font-body, font-mono.

RULE: anything that would be printed on a policy certificate or a bank
statement is set in font-mono. Policy numbers, premiums, IDV, sum insured,
claim IDs, expiry dates, transaction amounts, registration numbers. Prose is
never mono.

## Visual rules
- Background: bg-paper. Cards: bg-white, rounded-2xl, shadow-sm,
  border border-black/5.
- Only one gradient in the app: the home header
  (maroon-deep → maroon, 160deg). Everything else is flat.
- Text is text-ink. Never pure black. Secondary text is text-mute.
- Spacing scale: 4 / 8 / 12 / 16 / 24. Screen padding is px-5.
- Touch targets minimum 44px tall.
- Icons: lucide-react, strokeWidth 1.75, size 20 default.

## Copy voice
Plain, active, specific. Buttons say what happens: "Renew policy", not
"Submit". Never insurance jargon without a plain-language gloss next to it.
Empty states invite an action. Errors say what happened and what to do.

## Non-negotiables
- Mobile-first. Everything designed at 390px width.
- No placeholder lorem ipsum. Use real values from mockData.js.
- Never use browser storage APIs.
- Every screen must be reachable and every button must do something — this is
  a demo, dead ends are the one unforgivable bug.
