// IndusShield demo dataset. No backend — every screen reads from here.
// Currency values are stored as plain numbers and rendered with formatINR().

/**
 * Formats a number as Indian-numeral currency: 842000 -> "₹8,42,000".
 * Pass { decimals: 2 } for paise, { symbol: false } to drop the ₹.
 */
export function formatINR(value, { decimals = 0, symbol = true } = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value))
  return symbol ? `₹${formatted}` : formatted
}

/** Compact cover label for pills and chips: 2500000 -> "₹25L". */
export function formatLakh(value) {
  const lakhs = Number(value) / 100000
  const rounded = lakhs % 1 === 0 ? lakhs : Number(lakhs.toFixed(1))
  return `₹${rounded}L`
}

export const USER = {
  name: 'Rohan Mehta',
  avatarInitials: 'RM',
  age: 32,
  city: 'Mumbai',
  customerSince: '2019',
  accountType: 'Indus Delite Salary',
  maskedAccount: 'XXXX 4471',
  relationshipValue: '₹8.4L',
  accountBalance: 247800,
  family: [
    { relation: 'Spouse', name: 'Ananya Mehta', age: 30 },
    { relation: 'Child', name: 'Vivaan Mehta', age: 4 },
  ],
  // Already on file from account opening — the buy flow reads these, never asks.
  kyc: {
    'Full name': 'Rohan Mehta',
    'Date of birth': '14 Mar 1994',
    Mobile: '+91 98••• ••210',
    Email: 'rohan.mehta@gmail.com',
    PAN: 'ABCPM••••K',
    Address: 'B-1204, Oberoi Springs, Andheri West, Mumbai 400 053',
  },
}

export const CONDITION_OPTIONS = [
  'None',
  'Diabetes',
  'High blood pressure',
  'Thyroid',
  'Asthma',
]

/**
 * Optional cover, priced per category. Anything a product already includes as a
 * feature is deliberately absent — IndusDrive ships with zero depreciation, so
 * selling it again as an add-on would contradict the plan itself.
 */
export const ADD_ONS = {
  Health: [
    {
      id: 'maternity',
      name: 'Maternity cover',
      price: 3200,
      plain: 'Delivery and newborn care, after a 24-month wait.',
    },
    {
      id: 'opd',
      name: 'OPD & diagnostics',
      price: 1400,
      plain: 'Doctor visits and lab tests that do not need a hospital stay.',
    },
    {
      id: 'accident',
      name: 'Personal accident',
      price: 900,
      plain: 'A lump sum if an accident stops you working.',
    },
  ],
  Motor: [
    {
      id: 'engine',
      name: 'Engine protect',
      price: 740,
      plain: 'Covers engine damage from flood water, which the base policy excludes.',
    },
    {
      id: 'consumables',
      name: 'Consumables cover',
      price: 1190,
      plain: 'Oils, coolants and nuts and bolts replaced during a repair.',
    },
    {
      id: 'key',
      name: 'Key replacement',
      price: 350,
      plain: 'A new smart key if yours is lost or stolen.',
    },
  ],
  Travel: [
    {
      id: 'adventure',
      name: 'Adventure sports',
      price: 380,
      plain: 'Desert safari, jet ski and the like, which are otherwise excluded.',
    },
    {
      id: 'cancellation',
      name: 'Cancellation boost',
      price: 260,
      plain: 'Raises the trip-cancellation payout to ₹50,000.',
    },
  ],
  Home: [
    {
      id: 'jewellery',
      name: 'Jewellery cover',
      price: 640,
      plain: 'Raises the jewellery sub-limit to ₹1,50,000.',
    },
    {
      id: 'electronics',
      name: 'Portable electronics',
      price: 410,
      plain: 'Your laptop and phone, covered outside the flat too.',
    },
  ],
  Cyber: [
    {
      id: 'identity',
      name: 'Identity restoration',
      price: 300,
      plain: 'Help rebuilding documents and credit records after identity theft.',
    },
    {
      id: 'family',
      name: 'Family cover',
      price: 450,
      plain: 'Extends fraud cover to your spouse and child.',
    },
  ],
}

export const GST_RATE = 0.18

export const POLICY_PREFIXES = {
  Health: 'IHF',
  Motor: 'IDC',
  Travel: 'ITS',
  Home: 'IHM',
  Cyber: 'ICG',
}

export const PAYMENT_METHODS = [
  { id: 'account', label: 'IndusInd Savings', detail: 'XXXX 4471' },
  { id: 'upi', label: 'UPI', detail: 'rohan@indus' },
  { id: 'card', label: 'Card', detail: 'Visa •••• 8842' },
]

// Where the score lands once the recommended gap is closed.
export const SCORE_AFTER_PURCHASE = 78

export const PROTECTION_SCORE = {
  overall: 62,
  segments: [
    {
      category: 'Health',
      score: 55,
      status: 'weak',
      oneLineReason: 'Only ₹5L corporate cover for a family of three in Mumbai',
    },
    {
      category: 'Motor',
      score: 85,
      status: 'strong',
      oneLineReason: 'Comprehensive, but expires in 11 days',
    },
    {
      category: 'Life',
      score: 40,
      status: 'weak',
      oneLineReason: '₹25L term cover against ₹8.4L annual income',
    },
    {
      category: 'Home',
      score: 20,
      status: 'critical',
      oneLineReason: '₹45,000/mo rent paid, zero contents cover',
    },
    {
      category: 'Travel',
      score: 0,
      status: 'critical',
      oneLineReason: 'Flight booked 14 Jul, no trip cover',
    },
    {
      category: 'Cyber',
      score: 30,
      status: 'critical',
      oneLineReason: 'High digital transaction volume, no cover',
    },
  ],
}

export const SCORE_BENCHMARK = {
  peerAverage: 74,
  peerLabel: 'Customers like you in Mumbai average',
  verdict: 'Below average for your profile',
}

// "What good looks like" per category — the cover level that would score well
// for Rohan specifically, not a generic recommendation.
export const SCORE_TARGETS = {
  Health: { amount: 2500000, note: 'for a family of three in Mumbai' },
  Motor: { amount: 620000, note: 'IDV, renewed before it lapses' },
  Life: { amount: 8400000, note: 'ten times your ₹8.4L income' },
  Home: { amount: 500000, note: 'of contents cover for a rented flat' },
  Travel: { amount: 5000000, note: 'of medical cover for the days you are away' },
  Cyber: { amount: 200000, note: 'of fraud cover at your transaction volume' },
}

export const BANK_SIGNALS = [
  {
    id: 'SIG-1',
    date: '14 Jul 2026',
    merchant: 'MAKEMYTRIP',
    amount: 42800,
    category: 'Travel',
    signalType: 'new-exposure',
    insight:
      'Dubai trip booked for 2 Aug. Medical care abroad averages ₹3.5L for a single hospitalisation.',
    suggestedAction: 'Add trip cover from ₹1,240',
    productId: 'PR3',
  },
  {
    id: 'SIG-2',
    date: '02 Jul 2026',
    merchant: 'ICICI LOMBARD GIC',
    amount: 8420,
    category: 'Insurance premium',
    signalType: 'competitor-premium',
    insight:
      "You're paying a competitor for motor cover on a car financed by us. Renewal is due in 11 days.",
    suggestedAction: 'Import and compare',
    productId: 'PR2',
  },
  {
    id: 'SIG-3',
    date: '18 Jan 2026',
    merchant: 'LILAVATI HOSPITAL',
    amount: 18600,
    category: 'Healthcare',
    signalType: 'out-of-pocket',
    insight:
      'Paid out of pocket. Your corporate cover has a ₹5,000/day room rent sublimit — this stay exceeded it.',
    suggestedAction: 'Add a ₹10L top-up from ₹4,900',
    productId: 'PR1',
  },
  {
    id: 'SIG-4',
    date: '05 Jul 2026',
    merchant: 'RENT — S. IYER',
    amount: 45000,
    category: 'Housing',
    signalType: 'recurring-exposure',
    insight:
      "Renting in Mumbai. Your belongings aren't your landlord's responsibility.",
    suggestedAction: 'Home contents cover from ₹2,100',
    productId: 'PR4',
  },
  {
    id: 'SIG-5',
    date: '28 Jun 2026',
    merchant: 'INDUSIND AUTO LOAN',
    amount: 14200,
    category: 'EMI',
    signalType: 'obligation',
    insight: 'Loan closes Mar 2027. Motor cover is mandatory until then.',
    suggestedAction: null,
    productId: 'PR2',
  },
]

export const POLICIES = [
  {
    id: 'P1',
    source: 'indusind',
    category: 'Health',
    insurer: 'IndusInd',
    name: 'IndusHealth Corporate',
    sumInsured: 500000,
    premium: 0,
    premiumNote: 'Paid by your employer',
    policyNo: 'IHC/2024/8841003',
    expiry: '31 Mar 2027',
    status: 'active',
    gap: 'Room rent capped at ₹5,000/day. A Mumbai private room is ₹12,000+.',
  },
  {
    id: 'P2',
    source: 'detected',
    category: 'Motor',
    insurer: 'ICICI Lombard',
    name: 'ICICI Lombard Comprehensive',
    idv: 620000,
    premium: 8420,
    policyNo: '3005/K1147299/00/000',
    vehicle: 'Maruti Suzuki Baleno Zeta · MH-02-CD-4471',
    ncb: 35,
    expiry: '30 Jul 2026',
    status: 'expiring-soon',
    daysToExpiry: 11,
    gap: null,
  },
  {
    id: 'P3',
    source: 'indusind',
    category: 'Life',
    insurer: 'IndusInd',
    name: 'IndusTerm Secure',
    sumInsured: 2500000,
    premium: 8900,
    policyNo: 'ITS/2023/4471882',
    expiry: '12 Nov 2026',
    status: 'active',
    gap: null,
  },
]

// Anchored so the timeline and "11 days to renewal" stay true whenever the
// prototype is demoed, rather than drifting with the real clock.
export const DEMO_TODAY = new Date('2026-07-19T00:00:00')

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Parses the "30 Jul 2026" form used throughout this file. */
export function parseExpiry(value) {
  const [day, month, year] = String(value).split(' ')
  return new Date(Number(year), MONTHS.indexOf(month), Number(day))
}

export function resolvePolicy(screenData) {
  if (screenData?.policyNo) {
    const exact = POLICIES.find((policy) => policy.policyNo === screenData.policyNo)
    if (exact) return exact
  }
  if (screenData?.category) {
    const byCategory = POLICIES.find((policy) => policy.category === screenData.category)
    if (byCategory) return byCategory
  }
  if (screenData?.productId) {
    const product = PRODUCTS.find((item) => item.id === screenData.productId)
    const byProduct = POLICIES.find((policy) => policy.category === product?.category)
    if (byProduct) return byProduct
  }
  return POLICIES[0]
}

// Importing a detected policy does not buy cover — it buys visibility, and
// stops this one lapsing. Hence a modest bump, not a jump.
export const SCORE_AFTER_IMPORT = 66

/**
 * Cover and exclusions in the words a customer would use, per policy. Never
 * "room rent sublimit" — always what actually happens to them.
 */
export const POLICY_PLAIN_TERMS = {
  P1: {
    covered: [
      'Any hospital stay longer than 24 hours, paid directly to the hospital',
      'Your wife and son on the same cover, not three separate ones',
      'ICU, surgery, anaesthesia and medicines during the stay',
      'Tests and consultations for 60 days before and 90 days after admission',
      'An ambulance to hospital, up to ₹2,000 a trip',
    ],
    notCovered: [
      'A room costing more than ₹5,000 a night — you pay the difference, and a share of every other charge with it',
      'Dental and eye treatment, unless an accident caused it',
      'Any treatment outside India',
    ],
  },
  P2: {
    covered: [
      'Damage to your Baleno in an accident, cashless at 5,600 garages',
      'The car being stolen, up to ₹6,20,000',
      'Damage you cause to someone else — their car, their property, or them',
      'Flooded seats, carpets and electricals after a monsoon downpour',
      'A tow and roadside help if you break down',
    ],
    notCovered: [
      'Engine damage if water gets in and you restart the car — that repair runs ₹80,000 to ₹1,50,000',
      'Tyres, brake pads and other parts that simply wear out',
      'Anything that happens while driving without a licence, or after drinking',
    ],
  },
  P3: {
    covered: [
      '₹25,00,000 paid to Ananya if you die, whatever the cause, after the first year',
      'The full amount paid early if you are diagnosed as terminally ill',
      'Accidental death covered from day one',
      'Cover continues even if you change jobs or move city',
    ],
    notCovered: [
      'Suicide within the first 12 months of the policy',
      'Death while doing something you declared you would not — unlicensed flying, racing',
      'Any claim where a health condition was hidden when you applied',
    ],
  },
}

export const POLICY_DOCUMENTS = [
  { id: 'policy-pdf', name: 'Policy document', detail: 'PDF · 412 KB' },
  { id: 'certificate', name: 'Certificate of insurance', detail: 'PDF · 96 KB' },
  { id: 'claim-form', name: 'Claim form', detail: 'PDF · 78 KB' },
]

export const PRODUCTS = [
  {
    id: 'PR1',
    category: 'Health',
    name: 'IndusHealth Family Floater',
    tagline: 'One cover for all three of you',
    plainLanguageSummary:
      'A single pool of money your whole family can draw on for hospital bills. Any one of you can use all of it — you do not split it three ways.',
    sumInsuredOptions: [1000000, 2500000, 5000000],
    premiumOptions: [11400, 18200, 24800],
    features: [
      'No room rent cap — stay in any room the hospital offers',
      '12,400 cashless hospitals',
      'Day-1 maternity add-on',
    ],
    exclusions: [
      'Pre-existing conditions: 24-month waiting period',
      'Cosmetic surgery unless it follows an accident',
      'Treatment outside India',
    ],
    claimSettlementRatio: '98.2%',
    matchReason:
      'Your ₹18,600 Lilavati bill in January was out of pocket because your corporate cover caps room rent at ₹5,000/day. This one has no cap.',
    badge: 'Best match',
  },
  {
    id: 'PR2',
    category: 'Motor',
    name: 'IndusDrive Comprehensive',
    tagline: 'Same cover, ₹530 less',
    plainLanguageSummary:
      'Covers damage to your Baleno, theft, and anything you damage belonging to someone else. Zero depreciation means the insurer pays the full price of replaced parts instead of deducting for wear.',
    sumInsuredOptions: [620000],
    premiumOptions: [7890],
    features: [
      'Zero depreciation',
      'Roadside assistance',
      '4-hour cashless approval',
    ],
    exclusions: [
      'Engine damage from driving through flood water (add Engine Protect)',
      'Driving without a valid licence',
      'Regular wear, tyres and tubes unless the vehicle is also damaged',
    ],
    claimSettlementRatio: '97.6%',
    matchReason:
      '₹530 less than you paid last year, with zero-dep included. Your 35% no-claim bonus carries over.',
    badge: 'Most bought',
  },
  {
    id: 'PR3',
    category: 'Travel',
    name: 'IndusTravel Shield',
    tagline: 'Dubai, 12 days, covered',
    plainLanguageSummary:
      'Pays your hospital bills abroad, where a single admission averages ₹3.5L. Also covers a cancelled flight, a delayed bag, and a lost passport.',
    sumInsuredOptions: [5000000],
    premiumOptions: [1240],
    features: [
      '₹50L overseas medical cover',
      'Cashless at UAE hospitals',
      'Baggage delay paid from hour 6',
    ],
    exclusions: [
      'Adventure sports unless declared',
      'Claims arising from a condition you knew about before travelling',
      'Trips longer than the 12 days booked',
    ],
    claimSettlementRatio: '96.9%',
    matchReason:
      'Your ₹42,800 MakeMyTrip booking on 14 Jul is for a 2 Aug Dubai trip. You have no trip cover.',
    badge: null,
  },
  {
    id: 'PR4',
    category: 'Home',
    name: 'IndusHome Contents',
    tagline: 'Your things, not the building',
    plainLanguageSummary:
      'Covers what you own inside a rented flat — electronics, appliances, furniture, jewellery — against fire, theft and water damage. Your landlord insures the walls, not your belongings.',
    sumInsuredOptions: [500000],
    premiumOptions: [2100],
    features: [
      '₹5L contents cover',
      'Monsoon water damage included',
      'Portable — moves with you to your next flat',
    ],
    exclusions: [
      'Cash kept at home',
      'Damage from a leak you knew about and left unrepaired',
      'Items left in a common area or on a balcony',
    ],
    claimSettlementRatio: '97.1%',
    matchReason:
      'You pay ₹45,000 a month in rent in Mumbai and carry no cover on anything inside the flat.',
    badge: null,
  },
  {
    id: 'PR5',
    category: 'Cyber',
    name: 'IndusCyber Guard',
    tagline: 'For money taken, not money spent',
    plainLanguageSummary:
      'Reimburses you if someone drains your account through a fraudulent transaction, a phishing link or a cloned card. Covers the legal cost of disputing it too.',
    sumInsuredOptions: [200000],
    premiumOptions: [899],
    features: [
      '₹2L fraud cover',
      'UPI and card fraud both included',
      'Dispute paperwork handled for you',
    ],
    exclusions: [
      'Losses you were reimbursed for by the bank',
      'Transactions you authorised, including scam purchases',
      'Fraud reported more than 30 days after it happened',
    ],
    claimSettlementRatio: '95.4%',
    matchReason:
      'Your digital transaction volume is in the top 10% of Indus Delite customers, and you carry no fraud cover.',
    badge: null,
  },
]

/**
 * Resolves whatever a screen was handed — a productId, a category, or nothing —
 * to a single product, so navigation never lands on an empty screen.
 */
export function resolveProduct(screenData) {
  if (screenData?.productId) {
    const byId = PRODUCTS.find((product) => product.id === screenData.productId)
    if (byId) return byId
  }
  if (screenData?.category) {
    const byCategory = PRODUCTS.find((product) => product.category === screenData.category)
    if (byCategory) return byCategory
  }
  return PRODUCTS[0]
}

// Plain-language glossary. `forYou` is rendered after "For you, this means:"
// and is always tied to something concrete in Rohan's file.
export const JARGON = {
  'Room rent limit': {
    plain:
      'The most your insurer will pay per day for your hospital room. Go above it and they scale down the rest of the bill in the same proportion, so the shortfall is bigger than the room itself.',
    forYou:
      'your corporate policy caps this at ₹5,000 a day. A private room at Lilavati is ₹12,000+, which is why ₹18,600 of your January bill came out of your own pocket.',
  },
  'Network hospitals': {
    plain:
      'Hospitals the insurer has an arrangement with, where they settle the bill directly instead of making you pay and claim it back.',
    forYou:
      'both Lilavati and Kokilaben are in our network, so a repeat of January would be cashless. We do carry fewer network hospitals than HDFC Ergo.',
  },
  'Claim settlement ratio': {
    plain:
      'The share of claims an insurer paid out of every hundred they received last year. High is good, but it counts claims, not rupees — a company can settle many small claims and still fight the big ones.',
    forYou:
      'at 98.2%, roughly 2 claims in 100 were rejected — almost always for undeclared conditions, not for small print.',
  },
  'Waiting period': {
    plain:
      'The stretch at the start of a policy when certain claims are not payable yet. Accidents are covered from day one; illnesses you already had have to wait.',
    forYou:
      'nothing in your file is pre-existing, so this clock is mostly academic for you — but it starts the day you buy, which is an argument for buying now rather than at renewal.',
  },
  'Restore benefit': {
    plain:
      'If you use up your entire cover in a year, the insurer refills it so the next hospitalisation is still covered. Without it, a second admission in the same year is on you.',
    forYou:
      'on a family floater the three of you share one pot. One long admission for your son could exhaust ₹10L, and this is what keeps the rest of the year covered.',
  },
  'No-claim bonus': {
    plain:
      'A reward for a year without claims — either a discount on your renewal or extra cover at the same price. One claim usually resets it.',
    forYou:
      'you have built 35% on the Baleno. It moves with you to any insurer, so switching does not cost you the bonus.',
  },
  IDV: {
    plain:
      "Insured Declared Value — what you get if the car is stolen or written off. It is the car's current market value, not what you paid for it.",
    forYou:
      'your Baleno is set at ₹6,20,000. Dropping it would shave the premium but leave you short of a replacement.',
  },
  'Zero depreciation': {
    plain:
      'Without it, the insurer deducts for wear on every part they replace and you pay the difference. With it, they pay the full price of the part.',
    forYou:
      'on a 2021 Baleno the deduction on plastic parts is 50%. Your bumper claim would have cost you roughly ₹4,000 out of pocket without this.',
  },
  'Engine protect': {
    plain:
      'Covers engine damage from water getting in — which a standard comprehensive policy specifically excludes.',
    forYou:
      'this is the one add-on that matters most in Mumbai. A hydrostatic lock repair runs ₹80,000 to ₹1,50,000 and is not covered without it.',
  },
  'Contents cover': {
    plain:
      'Insures what you own inside the home — electronics, appliances, furniture, jewellery — not the building itself, which is your landlord’s problem.',
    forYou:
      'you rent in Mumbai for ₹45,000 a month and currently carry nothing on anything inside the flat.',
  },
  'Trip cancellation': {
    plain:
      'Refunds pre-paid bookings if you have to call the trip off for a covered reason — illness, a family emergency, a cancelled flight.',
    forYou:
      'your Dubai booking was ₹42,800. This is the part of the cover that protects the money already spent, not just your medical bills.',
  },
}

/**
 * Head-to-head tables, one per category. `perOption` rows carry one value per
 * sum-insured option so the whole table re-prices when the selector changes.
 * IndusShield deliberately loses a row in every table — a clean sweep reads
 * as marketing, not as a comparison.
 */
export const COMPARISONS = {
  Health: {
    competitors: ['HDFC Ergo Optima', 'Star Health Comprehensive'],
    rows: [
      {
        label: 'Premium',
        perOption: true,
        currency: true,
        us: [11400, 18200, 24800],
        them: [
          [12980, 20400, 27600],
          [11900, 19100, 26200],
        ],
        winner: 'us',
      },
      {
        label: 'Room rent limit',
        us: 'No cap',
        them: ['1% of cover/day', 'No cap'],
        winner: 'us',
      },
      {
        label: 'Network hospitals',
        us: '12,400',
        them: ['16,300', '14,000'],
        winner: 'them',
      },
      {
        label: 'Claim settlement ratio',
        us: '98.2%',
        them: ['97.4%', '97.9%'],
        winner: 'us',
      },
      {
        label: 'Waiting period',
        us: '24 months',
        them: ['36 months', '24 months'],
        winner: 'us',
      },
      {
        label: 'Restore benefit',
        us: 'Unlimited',
        them: ['Once a year', 'Once a year'],
        winner: 'us',
      },
      {
        label: 'No-claim bonus',
        us: '100% max',
        them: ['50% max', '100% max'],
        winner: 'tie',
      },
    ],
  },

  Motor: {
    competitors: ['ICICI Lombard', 'Bajaj Allianz'],
    rows: [
      {
        label: 'Premium',
        perOption: true,
        currency: true,
        us: [7890],
        them: [[8420], [8150]],
        winner: 'us',
      },
      { label: 'IDV', us: '₹6,20,000', them: ['₹6,20,000', '₹6,05,000'], winner: 'tie' },
      {
        label: 'Zero depreciation',
        us: 'Included',
        them: ['Add-on ₹1,900', 'Included'],
        winner: 'tie',
      },
      {
        label: 'Cashless garages',
        us: '4,100',
        them: ['5,600', '4,400'],
        winner: 'them',
      },
      {
        label: 'Claim settlement ratio',
        us: '97.6%',
        them: ['96.8%', '97.1%'],
        winner: 'us',
      },
      {
        label: 'Engine protect',
        us: 'Add-on ₹740',
        them: ['Add-on ₹1,450', 'Not offered'],
        winner: 'us',
      },
      {
        label: 'No-claim bonus',
        us: '35% carried',
        them: ['35% carried', '25% carried'],
        winner: 'tie',
      },
    ],
  },

  Travel: {
    competitors: ['TATA AIG Travel Guard', 'Bajaj Allianz Travel'],
    rows: [
      {
        label: 'Premium',
        perOption: true,
        currency: true,
        us: [1240],
        them: [[1490], [1320]],
        winner: 'us',
      },
      {
        label: 'Medical cover',
        us: '₹50,00,000',
        them: ['₹40,00,000', '₹50,00,000'],
        winner: 'tie',
      },
      {
        label: 'Trip cancellation',
        us: '₹25,000',
        them: ['₹50,000', '₹25,000'],
        winner: 'them',
      },
      {
        label: 'Baggage delay',
        us: 'From hour 6',
        them: ['From hour 12', 'From hour 8'],
        winner: 'us',
      },
      {
        label: 'Claim settlement ratio',
        us: '96.9%',
        them: ['95.8%', '96.2%'],
        winner: 'us',
      },
    ],
  },

  Home: {
    competitors: ['ICICI Lombard Home', 'TATA AIG Home Secure'],
    rows: [
      {
        label: 'Premium',
        perOption: true,
        currency: true,
        us: [2100],
        them: [[2450], [2280]],
        winner: 'us',
      },
      {
        label: 'Contents cover',
        us: '₹5,00,000',
        them: ['₹5,00,000', '₹4,00,000'],
        winner: 'tie',
      },
      {
        label: 'Monsoon water damage',
        us: 'Included',
        them: ['Included', 'Add-on'],
        winner: 'tie',
      },
      {
        label: 'Jewellery sub-limit',
        us: '₹50,000',
        them: ['₹1,00,000', '₹40,000'],
        winner: 'them',
      },
      {
        label: 'Claim settlement ratio',
        us: '97.1%',
        them: ['96.4%', '96.9%'],
        winner: 'us',
      },
    ],
  },

  Cyber: {
    competitors: ['Bajaj Allianz Cyber', 'HDFC Ergo Cyber'],
    rows: [
      {
        label: 'Premium',
        perOption: true,
        currency: true,
        us: [899],
        them: [[1150], [999]],
        winner: 'us',
      },
      {
        label: 'Fraud cover',
        us: '₹2,00,000',
        them: ['₹1,00,000', '₹2,00,000'],
        winner: 'tie',
      },
      {
        label: 'Claim window',
        us: '30 days',
        them: ['15 days', '45 days'],
        winner: 'them',
      },
      {
        label: 'Legal costs',
        us: 'Included',
        them: ['Add-on', 'Included'],
        winner: 'tie',
      },
      {
        label: 'Claim settlement ratio',
        us: '95.4%',
        them: ['94.1%', '95.0%'],
        winner: 'us',
      },
    ],
  },
}

export const CLAIM_INCIDENT_TYPES = [
  { id: 'accident', label: 'Accident damage', icon: 'Car' },
  { id: 'theft', label: 'Theft', icon: 'KeyRound' },
  { id: 'disaster', label: 'Natural disaster', icon: 'CloudRain' },
  { id: 'third-party', label: 'Third-party', icon: 'Users' },
]

export const CLAIM_PHOTO_SLOTS = ['Front', 'Rear', 'Damage close-up', 'Registration']

// Scripted output of the damage assessment. Findings reveal one at a time.
export const CLAIM_ASSESSMENT = {
  findings: [
    'Rear bumper — moderate impact damage detected',
    'Tail lamp assembly — intact',
    'No structural or chassis damage',
  ],
  comparableClaims: 2847,
  // Below this, claiming costs less than the no-claim bonus it would burn.
  ncbSafeUnder: 22000,
}

export const CLAIM_GARAGE = {
  name: 'Sai Service, Andheri East',
  address: 'Plot 14, MIDC Road, Andheri (E), Mumbai 400 093',
  phone: '+91 22 4890 2210',
  distanceKm: 2.4,
  pickupSlots: ['Today 4 PM', 'Tomorrow 10 AM'],
}

export const CLAIM_DEFAULT_LOCATION = 'Andheri West, Mumbai'

// The incident, not the filing time — the tracker's timeline starts here.
export const CLAIM_INCIDENT_AT = '12 Jul 2026, 9:05 AM'

export const CLAIM = {
  claimId: 'CLM-MTR-2026-04471',
  type: 'Motor',
  incident: 'Rear bumper damage, Andheri West, 12 Jul 2026',
  estimate: 18400,
  approved: 18400,
  garage: 'Sai Service, Andheri (E) — cashless partner',
  status: 'In repair',
  currentStage: 3,
  excess: 1000,
  surveyor: { name: 'Imran Shaikh', role: 'Assigned surveyor' },
  stages: [
    {
      label: 'Reported',
      state: 'done',
      timestamp: '12 Jul, 9:14 AM',
      detail: 'You sent four photos of the bumper from the IndusShield app.',
    },
    {
      label: 'AI assessment',
      state: 'done',
      timestamp: '12 Jul, 9:16 AM',
      detail: 'Photos matched to a bumper replacement estimate in two minutes.',
    },
    {
      label: 'Approved',
      state: 'done',
      timestamp: '12 Jul, 11:40 AM',
      detail: 'Full ₹18,400 approved. Nothing to pay at the garage.',
    },
    {
      label: 'In repair',
      state: 'current',
      timestamp: '13 Jul',
      detail: 'Sai Service has the car. Parts arrived 15 Jul.',
      liveDetail: 'Bumper panel ordered · fitting scheduled for 20 Jul',
    },
    {
      label: 'Settled',
      state: 'pending',
      timestamp: 'Est. 21 Jul',
      detail: 'We pay the garage directly once you collect the car.',
    },
  ],
}

/**
 * Ecosystem services. `feature` marks the two that get dedicated treatments on
 * the Services screen (the wellness card and the SOS card), so the grid can
 * exclude them rather than showing them twice.
 */
export const SERVICES = [
  {
    id: 'SVC-1',
    name: 'Telemedicine',
    detail: 'Talk to a doctor 24×7',
    meta: 'Free with your health cover',
    icon: 'Stethoscope',
    free: true,
    action: 'Start a consult',
    description:
      'A GP on video within about 4 minutes, any hour. They can prescribe, order tests, and refer you into a network hospital if it turns out to be serious.',
  },
  {
    id: 'SVC-2',
    name: 'Roadside assistance',
    detail: 'Breakdown, tow, flat tyre',
    meta: 'Arrives in 22 min on average',
    icon: 'Truck',
    free: true,
    action: 'Call for help',
    description:
      'Flat tyre, dead battery, empty tank or a tow to the nearest garage. Included in your motor cover, up to four call-outs a year.',
  },
  {
    id: 'SVC-3',
    name: 'Annual health check',
    detail: 'Full panel at a partner lab',
    meta: 'Free — book a slot',
    icon: 'HeartPulse',
    free: true,
    action: 'Book a slot',
    description:
      'A 62-test panel at a partner lab near Andheri, with home sample collection. One free check a year for you and Ananya.',
  },
  {
    id: 'SVC-4',
    name: 'Vehicle service booking',
    detail: 'Service your Baleno at a partner garage',
    meta: 'Next slot: 24 Jul',
    icon: 'Wrench',
    price: 2400,
    action: 'Book a slot',
    description:
      'Scheduled service for your Baleno at Sai Service, Andheri East, at partner rates. Pickup and drop included.',
  },
  {
    id: 'SVC-7',
    name: 'Second opinion',
    detail: 'A senior specialist reviews a diagnosis',
    icon: 'ClipboardList',
    free: true,
    action: 'Start a review',
    description:
      'Before you agree to surgery, a senior specialist reads your reports and tells you plainly whether it is necessary. Written opinion back in 72 hours.',
  },
  {
    id: 'SVC-8',
    name: 'RC & PUC renewal',
    detail: 'Vehicle paperwork, done at your door',
    icon: 'FileText',
    price: 499,
    action: 'Book a pickup',
    description:
      'We collect the documents, queue at the RTO, and return everything to your flat. Your PUC certificate expires 12 Sep 2026.',
  },
  {
    id: 'SVC-5',
    name: 'Wellness rewards',
    detail: 'Points off your next renewal',
    meta: '2,140 pts',
    icon: 'Award',
    feature: 'wellness',
    free: true,
    action: 'View rewards',
    description: 'Points earned from steps come straight off your next renewal premium.',
  },
  {
    id: 'SVC-6',
    name: 'Emergency SOS',
    detail: 'Ambulance and hospital admission',
    meta: 'One tap, no forms',
    icon: 'Siren',
    feature: 'sos',
    free: true,
    action: 'Open SOS',
    description: 'One tap reaches roadside help, an ambulance, or your claims manager.',
  },
]

// The retention mechanic: a reason to open an insurance app in a month when
// nothing has gone wrong.
export const WELLNESS = {
  points: 2140,
  nextTier: 3000,
  nextReward: '₹500 off your renewal',
  rule: 'Every 10,000 steps = 20 points off your renewal.',
}

export const SOS_CONTACTS = [
  {
    id: 'roadside',
    label: 'Roadside assistance',
    detail: 'Breakdown, tow, flat tyre',
    number: '1800 209 4449',
    icon: 'Truck',
  },
  {
    id: 'ambulance',
    label: 'Ambulance',
    detail: 'Nearest network hospital',
    number: '1800 209 1121',
    icon: 'Ambulance',
  },
  {
    id: 'claims',
    label: 'Your claims manager',
    detail: 'Imran Shaikh · CLM-MTR-2026-04471',
    number: '+91 22 4890 2210',
    icon: 'UserRound',
  },
]

export const ASSISTANT_QA = [
  {
    keywords: ['idv', 'insured declared value'],
    policyId: 'P2',
    answer:
      "IDV is what your insurer will pay you if your car is stolen or damaged beyond repair — it's the car's current market value, not what you paid for it. Your Baleno's IDV is ₹6,20,000. Setting it lower makes your premium cheaper but leaves you short if you ever lose the car outright, so it's worth keeping it close to what a replacement would actually cost.",
  },
  {
    keywords: ['ncb', 'no claim bonus'],
    policyId: 'P2',
    answer:
      "No Claim Bonus is a discount you earn for every year you don't make a claim. You're at 35% on your Baleno, which is why your own-damage premium is well below the base rate. It stays with you when you switch insurers — moving to IndusDrive keeps the full 35% — but one claim resets it, so for a small dent it's often cheaper to pay yourself than to claim.",
  },
  {
    keywords: ['room rent', 'sublimit'],
    policyId: 'P1',
    cta: { label: 'See top-up options', screen: 'discover', data: { category: 'Health' } },
    answer:
      "A room rent sublimit is a daily cap on the hospital room your policy will pay for. Your IndusHealth Corporate cover caps it at ₹5,000 a day, but a private room in a Mumbai hospital is ₹12,000 or more. The catch is that if you exceed the cap, the hospital's other charges get scaled down proportionately too — that's why your ₹18,600 Lilavati bill in January came out of your own pocket.",
  },
  {
    keywords: ['flood', 'monsoon', 'water damage', 'waterlogging'],
    policyId: 'P2',
    cta: { label: 'Add Engine Protect', screen: 'buy', data: { productId: 'PR2' } },
    answer:
      'Yes — and the exception is the part worth knowing. Your Baleno’s comprehensive cover pays for flood damage under own-damage: waterlogged seats, carpets, wiring, silt, all of it. What it does not pay for is hydrostatic lock — if water reaches the engine and you turn the key, the engine seizes, and that rebuild runs ₹80,000 to ₹1,50,000 entirely out of your pocket. Engine Protect closes exactly that hole for ₹740 a year. So: two things when Andheri goes under — do not restart a stalled car, and call for a tow instead.',
  },
  {
    keywords: ['cashless', 'network hospital'],
    policyId: 'P1',
    answer:
      "Cashless means the insurer settles the bill directly with the hospital, so you walk out without paying — you only cover what your policy excludes. It only works at hospitals in that insurer's network; anywhere else you pay first and claim it back. IndusHealth Family Floater has 12,400 network hospitals, and for planned treatment it's worth confirming the hospital is on the list before you get admitted.",
  },
  {
    keywords: ['renew', 'renewal'],
    policyId: 'P2',
    cta: { label: 'Compare renewal options', screen: 'compare', data: { productId: 'PR2' } },
    answer:
      'Your ICICI Lombard motor policy expires on 30 Jul 2026 — 11 days away. Renewing on IndusDrive Comprehensive costs ₹7,890 against the ₹8,420 you paid last year, includes zero depreciation, and carries your 35% no-claim bonus across. Do not let it lapse: driving uninsured is an offence, your auto loan requires cover until it closes in Mar 2027, and a break in cover can cost you the bonus.',
  },
  {
    keywords: ['claim', 'how to claim', 'file a claim'],
    policyId: 'P2',
    cta: { label: 'Track your claim', screen: 'claimTrack' },
    answer:
      'Report it in the app first — for motor, photos of the damage are usually enough to get an estimate back within minutes. Your current claim CLM-MTR-2026-04471 went from reported to approved in about two and a half hours on 12 Jul. Once approved at a cashless garage like Sai Service, you collect the car and we pay the garage directly, so nothing leaves your account.',
  },
  {
    keywords: ['waiting period', 'pre-existing', 'preexisting'],
    cta: { label: 'See health plans', screen: 'discover', data: { category: 'Health' } },
    answer:
      "A waiting period is the stretch at the start of a policy when certain claims aren't payable yet. On IndusHealth Family Floater, anything you were already diagnosed with is covered after 24 months, specific listed conditions after 24 months, and accidents from day one. The clock starts when the policy does, so buying earlier is genuinely worth more than buying more — and never leave a condition off the form, because an undeclared one can void a claim years later.",
  },
]

// Answers the "Is my ₹5L health cover enough?" quick prompt. Kept last so the
// narrower keywords above win first.
ASSISTANT_QA.push({
  keywords: ['enough', 'how much cover', 'too little'],
  policyId: 'P1',
  cta: { label: 'See top-up options', screen: 'discover', data: { category: 'Health' } },
  answer:
    'Honestly, no — not for three people in Mumbai. ₹5L sounds like a lot until one admission eats most of it: a cardiac procedure or a bad accident at Lilavati runs ₹6–8L, and your corporate policy also caps the room at ₹5,000 a night on top of that. The bigger risk is whose policy it is — it belongs to your employer and ends the day you leave, and at 32 you will almost certainly change jobs before you stop needing cover. A ₹25L floater of your own runs ₹18,200 a year, sits on top of the corporate cover rather than replacing it, and follows you between jobs.',
})

/** First QA entry whose keyword appears anywhere in the question. */
export function matchAnswer(input) {
  const question = String(input).toLowerCase()
  const hit = ASSISTANT_QA.find((entry) =>
    entry.keywords.some((keyword) => question.includes(keyword)),
  )
  return hit ?? { answer: DEFAULT_ANSWER }
}

export const DEFAULT_ANSWER =
  "I don't have a good answer for that one yet. I can explain anything on your policies — IDV, no-claim bonus, room rent limits, waiting periods, what's covered in the monsoon — or walk you through a renewal or a claim. Try one of the suggestions below, or ask about a specific policy."

export const QUICK_PROMPTS = [
  'Am I covered for monsoon flooding?',
  'What does IDV actually mean?',
  'Why is my renewal cheaper here?',
  'Is my ₹5L health cover enough?',
]
