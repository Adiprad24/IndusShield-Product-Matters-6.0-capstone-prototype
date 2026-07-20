import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App'

afterEach(cleanup)

const body = () => document.querySelector('main').textContent
const section = (heading) => screen.getByRole('heading', { name: heading }).closest('section')

function openClaimFile() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'File a claim' }))
}

/** Fills the minimum photos and runs the scripted assessment to completion. */
async function reachAssessment() {
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  for (const slot of ['Front', 'Rear', 'Damage close-up']) {
    fireEvent.click(screen.getByRole('button', { name: `Capture ${slot}` }))
  }
  fireEvent.click(screen.getByRole('button', { name: 'Analyse damage' }))
  await act(async () => {
    vi.advanceTimersByTime(4000)
  })
}

test('step 1 pre-selects accident damage and fills in the vehicle', () => {
  openClaimFile()
  expect(
    screen.getByRole('button', { name: 'Accident damage' }).getAttribute('aria-pressed'),
  ).toBe('true')
  expect(screen.getByRole('button', { name: 'Theft' }).getAttribute('aria-pressed')).toBe(
    'false',
  )

  const text = body()
  expect(text).toContain('MH-02-CD-4471')
  expect(text).toContain('Andheri West, Mumbai')
  expect(text).toContain('Detected')
  expect(screen.getByRole('button', { name: 'Not this vehicle?' })).toBeTruthy()
})

test('"Not this vehicle?" does something rather than nothing', () => {
  openClaimFile()
  fireEvent.click(screen.getByRole('button', { name: 'Not this vehicle?' }))
  expect(screen.getByRole('status').textContent).toContain('Only one vehicle on your policy')
})

test('analysis unlocks only after three photos', () => {
  openClaimFile()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

  const analyse = screen.getByRole('button', { name: 'Analyse damage' })
  expect(analyse.disabled).toBe(true)
  expect(body()).toContain('0 of 4 added')

  fireEvent.click(screen.getByRole('button', { name: 'Capture Front' }))
  fireEvent.click(screen.getByRole('button', { name: 'Capture Rear' }))
  expect(analyse.disabled, 'two is not enough').toBe(true)

  fireEvent.click(screen.getByRole('button', { name: 'Capture Damage close-up' }))
  expect(analyse.disabled).toBe(false)
})

test('a captured slot can be retaken', () => {
  openClaimFile()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: 'Capture Front' }))

  const slot = screen.getByRole('button', { name: /Front captured/ })
  expect(slot.getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(slot)
  expect(screen.getByRole('button', { name: 'Capture Front' })).toBeTruthy()
})

test('the assessment reveals findings one at a time, then the estimate', async () => {
  vi.useFakeTimers()
  try {
    openClaimFile()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    for (const slot of ['Front', 'Rear', 'Damage close-up']) {
      fireEvent.click(screen.getByRole('button', { name: `Capture ${slot}` }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Analyse damage' }))

    // Scanning, nothing revealed yet.
    expect(body()).toContain('Analysing your photos')
    expect(body()).not.toContain('Rear bumper — moderate impact')

    await act(async () => {
      vi.advanceTimersByTime(1250)
    })
    expect(body()).toContain('Rear bumper — moderate impact damage detected')
    expect(body(), 'second finding waits its turn').not.toContain('Tail lamp assembly')

    await act(async () => {
      vi.advanceTimersByTime(700)
    })
    expect(body()).toContain('Tail lamp assembly — intact')

    await act(async () => {
      vi.advanceTimersByTime(1400)
    })
    expect(body()).toContain('No structural or chassis damage')
    expect(body()).toContain('₹18,400')
    expect(body()).toContain('Based on 2,847 similar Baleno claims')
    expect(body(), 'the NCB tip').toContain('₹22,000')
  } finally {
    vi.useRealTimers()
  }
})

test('cashless is pre-selected with the garage and a pickup slot', async () => {
  vi.useFakeTimers()
  try {
    openClaimFile()
    await reachAssessment()
    fireEvent.click(screen.getByRole('button', { name: 'Choose repair' }))

    const cashless = screen.getByRole('button', { name: /Cashless at a network garage/ })
    expect(cashless.getAttribute('aria-pressed')).toBe('true')
    expect(cashless.textContent).toContain('Sai Service, Andheri East')
    expect(cashless.textContent).toContain('2.4 km')
    expect(cashless.textContent).toContain('you pay ₹0')

    expect(
      screen.getByRole('button', { name: 'Today 4 PM' }).getAttribute('aria-pressed'),
    ).toBe('true')
  } finally {
    vi.useRealTimers()
  }
})

test('submitting shows the claim ID and routes to the tracker', async () => {
  vi.useFakeTimers()
  try {
    openClaimFile()
    await reachAssessment()
    fireEvent.click(screen.getByRole('button', { name: 'Choose repair' }))
    fireEvent.click(screen.getByRole('button', { name: 'Submit claim' }))

    expect(body()).toContain('CLM-MTR-2026-04471')
    expect(body()).toContain('Approved in 2 minutes')
    expect(body()).toContain('₹18,400')

    fireEvent.click(screen.getByRole('button', { name: 'Track this claim' }))
    expect(screen.getByRole('heading', { name: 'Your claim' })).toBeTruthy()
  } finally {
    vi.useRealTimers()
  }
})

// --- Tracker -------------------------------------------------------------

function openTracker() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Claims' }))
}

test('the tracker header carries the claim identity', () => {
  openTracker()
  const text = body()
  expect(text).toContain('CLM-MTR-2026-04471')
  expect(text).toContain('MH-02-CD-4471')
  expect(text).toContain('In repair')
  expect(text).toContain('₹18,400')
  expect(text).toContain('12 Jul 2026')
})

test('all five stages render with the right visual state', () => {
  openTracker()
  const stages = section('Progress').querySelectorAll('li')
  expect(stages.length).toBe(5)

  // Three done: a sage check circle each, plus a solid sage connector below each.
  expect(section('Progress').querySelectorAll('.rounded-full.bg-sage').length).toBe(3)
  expect(section('Progress').querySelectorAll('.w-0\\.5.bg-sage').length).toBe(3)
  expect(
    section('Progress').querySelectorAll('.border-dashed').length,
    'line below the current stage is dashed',
  ).toBe(1)
  expect(
    section('Progress').querySelectorAll('[class*="pulseRing"]').length,
    'exactly one stage should pulse',
  ).toBe(1)
})

test('the current stage shows its live detail, others do not', () => {
  openTracker()
  const text = section('Progress').textContent
  expect(text).toContain('Bumper panel ordered · fitting scheduled for 20 Jul')
  expect(text).toContain('Reported')
  expect(text).toContain('12 Jul, 9:14 AM')
  expect(text).toContain('Est. 21 Jul')
})

test('the settlement adds up', () => {
  openTracker()
  const settlement = section('Settlement').textContent
  // 18,400 approved − 1,000 excess = 17,400 to the garage, 1,000 from Rohan.
  expect(settlement).toContain('₹18,400')
  expect(settlement).toContain('− ₹1,000')
  expect(settlement).toContain('₹17,400')
  expect(settlement).toContain('You pay')
})

test('garage actions and the assist escape hatch all work', () => {
  openTracker()
  fireEvent.click(screen.getByRole('button', { name: /Call garage/ }))
  expect(screen.getByRole('status').textContent).toContain('+91 22 4890 2210')

  fireEvent.click(screen.getByRole('button', { name: /Get directions/ }))
  expect(screen.getByRole('status').textContent).toContain('Opening directions')

  expect(body()).toContain('Imran Shaikh')
  fireEvent.click(screen.getByRole('button', { name: /Something wrong\? Ask Assist/ }))
  expect(body()).toContain('Assist')
})
