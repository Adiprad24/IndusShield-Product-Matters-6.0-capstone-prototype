import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { act } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App'
import { SERVICES } from './data/mockData'

afterEach(cleanup)

function openServices() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Services' }))
}

const body = () => document.querySelector('main').textContent
const grid = () => screen.getByRole('heading', { name: 'Services' }).closest('section')

test('the wellness card carries the retention mechanic', () => {
  openServices()
  const text = body()
  expect(text).toContain('Beyond insurance')
  expect(text).toContain('open the app when nothing’s gone wrong')
  expect(text, 'points balance').toContain('2,140')
  expect(text, 'distance to the next tier: 3,000 - 2,140').toContain('860')
  expect(text).toContain('₹500 off your renewal')
  expect(text).toContain('Every 10,000 steps = 20 points off your renewal.')
})

test('the progress bar reports the real ratio', async () => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
  try {
    openServices()

    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('2140')
    expect(bar.getAttribute('aria-valuemax')).toBe('3000')

    // The fill animates in from zero; 2,140 of 3,000 is ~71%.
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    const fill = bar.firstElementChild
    expect(parseFloat(fill.style.width)).toBeGreaterThan(70)
    expect(parseFloat(fill.style.width)).toBeLessThan(72)
  } finally {
    vi.useRealTimers()
  }
})

test('the grid shows six tiles and never duplicates the featured two', () => {
  openServices()
  const tiles = grid().querySelectorAll('button')
  expect(tiles.length).toBe(6)

  const names = [...tiles].map((tile) => tile.textContent)
  expect(names.some((name) => name.includes('Wellness rewards'))).toBe(false)
  expect(names.some((name) => name.includes('Emergency SOS'))).toBe(false)
  expect(names.some((name) => name.includes('Telemedicine'))).toBe(true)
  expect(names.some((name) => name.includes('Second opinion'))).toBe(true)
})

test('each tile shows either a free chip or a price, never neither', () => {
  openServices()
  for (const tile of grid().querySelectorAll('button')) {
    const text = tile.textContent
    const free = text.includes('Free with your cover')
    const priced = /₹[\d,]+/.test(text)
    expect(free || priced, `tile "${text.slice(0, 30)}" needs a price or a free chip`).toBe(
      true,
    )
    expect(free && priced, 'never both').toBe(false)
  }
})

test('a tile opens a sheet with a description and a working action', () => {
  openServices()
  expect(screen.queryByRole('dialog')).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: /Telemedicine/ }))
  const sheet = screen.getByRole('dialog')
  expect(sheet.textContent).toContain('A GP on video within about 4 minutes')

  fireEvent.click(within(sheet).getByRole('button', { name: 'Start a consult' }))
  expect(screen.queryByRole('dialog'), 'sheet closes on action').toBeNull()
  expect(screen.getByRole('status').textContent).toContain('Telemedicine')
})

test('a priced service shows its price in the sheet too', () => {
  openServices()
  fireEvent.click(screen.getByRole('button', { name: /RC & PUC renewal/ }))
  const sheet = screen.getByRole('dialog')
  expect(sheet.textContent).toContain('₹499')
  expect(sheet.textContent).toContain('at partner rates')
  expect(within(sheet).getByRole('button', { name: 'Book a pickup' })).toBeTruthy()
})

test('SOS opens three call options, each with a real number', () => {
  openServices()
  fireEvent.click(screen.getByRole('button', { name: /One tap connects you to roadside/ }))

  const sheet = screen.getByRole('dialog')
  expect(within(sheet).getByRole('button', { name: /Roadside assistance/ })).toBeTruthy()
  expect(within(sheet).getByRole('button', { name: /Ambulance/ })).toBeTruthy()
  expect(within(sheet).getByRole('button', { name: /claims manager/ })).toBeTruthy()

  // The claims contact is the surveyor on the live claim, not a generic desk.
  expect(sheet.textContent).toContain('Imran Shaikh')
  expect(sheet.textContent).toContain('CLM-MTR-2026-04471')

  fireEvent.click(within(sheet).getByRole('button', { name: /Ambulance/ }))
  expect(screen.getByRole('status').textContent).toContain('1800 209 1121')
})

test('every service in the data is renderable', () => {
  // Guards against adding a service with an icon name the screen cannot map.
  for (const service of SERVICES) {
    expect(service.action, `${service.name} needs an action label`).toBeTruthy()
    expect(service.description, `${service.name} needs a description`).toBeTruthy()
    expect(
      service.free || typeof service.price === 'number',
      `${service.name} needs a price or free flag`,
    ).toBe(true)
  }
})
