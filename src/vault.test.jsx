import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App'

afterEach(cleanup)

function openVault() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
}

const section = (heading) => screen.getByRole('heading', { name: heading }).closest('section')
const body = () => document.querySelector('main').textContent

test('owned policies are listed, the detected one is not', () => {
  openVault()
  const active = section('Active policies').textContent
  expect(active).toContain('IndusHealth Corporate')
  expect(active).toContain('IndusTerm Secure')
  expect(active, 'not imported yet').not.toContain('ICICI Lombard Comprehensive')
})

test('the detected policy is shown as a statement line with inferred details', () => {
  openVault()
  const found = section('Found in your account')
  expect(found.textContent).toContain('We spotted these in your transaction history')
  expect(found.textContent, 'ledger merchant').toContain('ICICI LOMBARD GIC')
  expect(found.textContent, 'ledger amount').toContain('₹8,420')
  expect(found.textContent, 'inferred policy number').toContain('3005/K1147299/00/000')
  expect(found.textContent).toContain('MH-02-CD-4471')
  expect(found.textContent).toContain('₹6,20,000')
  expect(found.textContent, 'urgency').toContain('11 days')
})

test('importing moves the policy into Active and raises the score', async () => {
  vi.useFakeTimers()
  try {
    openVault()
    expect(body()).toContain('62')

    fireEvent.click(screen.getByRole('button', { name: 'Import policy' }))

    // The ledger row animates out before the card lands.
    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    expect(section('Active policies').textContent).toContain('ICICI Lombard Comprehensive')
    expect(
      screen.queryByRole('button', { name: 'Import policy' }),
      'detected section should empty out',
    ).toBeNull()

    await act(async () => {
      vi.advanceTimersByTime(1500)
    })
    expect(body(), 'score climbs after import').toContain('66')
  } finally {
    vi.useRealTimers()
  }
})

test('importing confirms with a toast naming the reminder date', async () => {
  vi.useFakeTimers()
  try {
    openVault()
    fireEvent.click(screen.getByRole('button', { name: 'Import policy' }))
    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    const toast = screen.getByRole('status')
    expect(toast.textContent).toContain('ICICI Lombard policy imported')
    expect(toast.textContent).toContain('Renewal reminder set for 23 Jul')
  } finally {
    vi.useRealTimers()
  }
})

test('the renewal timeline calls out the nearest renewal in alert', () => {
  openVault()
  const timeline = section('Renewals ahead')
  expect(timeline.textContent).toContain('ICICI Lombard Comprehensive renews in 11 days')

  const alert = timeline.querySelector('.text-alert')
  expect(alert, 'nearest renewal must be flagged').not.toBeNull()
  expect(alert.textContent).toContain('11 days')
})

test('timeline markers sit at the right point in the 12 months', () => {
  openVault()
  const timeline = section('Renewals ahead')
  const markers = [...timeline.querySelectorAll('span[title]')]

  const positions = Object.fromEntries(
    markers.map((marker) => [marker.getAttribute('title'), parseFloat(marker.style.left)]),
  )

  // Track runs Jul 2026 -> Jun 2027. Nov 2026 is ~4/12; Mar 2027 is ~8/12.
  const life = positions['IndusTerm Secure · 12 Nov 2026']
  const health = positions['IndusHealth Corporate · 31 Mar 2027']
  expect(life).toBeGreaterThan(30)
  expect(life).toBeLessThan(40)
  expect(health).toBeGreaterThan(68)
  expect(health).toBeLessThan(76)
})

test('every policy card opens its detail screen', () => {
  openVault()
  fireEvent.click(screen.getAllByRole('button', { name: /IndusTerm Secure/ })[0])
  expect(screen.getByRole('heading', { name: 'Policy' })).toBeTruthy()
  expect(body()).toContain('ITS/2023/4471882')
})
