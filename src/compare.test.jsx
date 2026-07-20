import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import App from './App'

afterEach(cleanup)

/** Health comparison, reached the way a user reaches it. */
function openHealthCompare() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Get covered' }))
  fireEvent.click(screen.getAllByRole('button', { name: 'View plan' })[0])
}

const table = () =>
  [...document.querySelectorAll('main section')].find((section) =>
    section.textContent.includes('IndusShield'),
  )

test('the comparison names its competitors', () => {
  openHealthCompare()
  const text = table().textContent
  expect(text).toContain('IndusShield')
  expect(text).toContain('HDFC Ergo Optima')
  expect(text).toContain('Star Health Comprehensive')
})

test('changing the cover amount re-prices every column', () => {
  openHealthCompare()
  expect(table().textContent).toContain('₹11,400')
  expect(table().textContent).toContain('₹12,980')
  expect(table().textContent).toContain('₹11,900')

  fireEvent.click(screen.getByRole('button', { name: '₹25L' }))
  const at25 = table().textContent
  expect(at25).toContain('₹18,200')
  expect(at25).toContain('₹20,400')
  expect(at25).toContain('₹19,100')
  expect(at25).not.toContain('₹11,400')

  fireEvent.click(screen.getByRole('button', { name: '₹50L' }))
  expect(table().textContent).toContain('₹24,800')
})

test('the sticky buy bar tracks the selected cover', () => {
  openHealthCompare()
  const bar = document.querySelector('.sticky')
  expect(bar.textContent).toContain('₹11,400')

  fireEvent.click(screen.getByRole('button', { name: '₹25L' }))
  expect(bar.textContent).toContain('₹18,200')
})

test('IndusShield loses a row, and says so', () => {
  openHealthCompare()
  const text = table().textContent
  // Network hospitals: ours 12,400 against HDFC Ergo's 16,300.
  expect(text).toContain('12,400')
  expect(text).toContain('16,300')
})

test('tapping a jargon term explains it in Rohan\'s own terms', () => {
  openHealthCompare()
  expect(screen.queryByRole('dialog')).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'Room rent limit' }))

  const sheet = screen.getByRole('dialog')
  expect(sheet.textContent).toContain('The most your insurer will pay per day')
  expect(sheet.textContent).toContain('For you, this means:')
  expect(sheet.textContent, 'must tie back to the Lilavati signal').toContain('₹18,600')
})

test('the sheet closes on scrim tap', () => {
  openHealthCompare()
  fireEvent.click(screen.getByRole('button', { name: 'Restore benefit' }))
  expect(screen.getByRole('dialog')).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('only terms with a glossary entry are tappable', () => {
  openHealthCompare()
  // "Premium" is not jargon, so it must not be a button.
  expect(screen.queryByRole('button', { name: 'Premium' })).toBeNull()
  expect(screen.getByRole('button', { name: 'Claim settlement ratio' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Waiting period' })).toBeTruthy()
})

test('"Buy this plan" carries the product forward', () => {
  openHealthCompare()
  fireEvent.click(screen.getByRole('button', { name: 'Buy this plan' }))
  expect(screen.getByRole('heading', { name: 'Buy' })).toBeTruthy()
})

test('the motor comparison puts his real insurer in a column', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Import and compare' }))

  const text = table().textContent
  expect(text).toContain('ICICI Lombard')
  expect(text, 'his actual premium').toContain('₹8,420')
  expect(text, 'ours').toContain('₹7,890')
  expect(document.querySelector('header').textContent).toContain('IndusDrive Comprehensive')
})

test('single-option products show no cover selector', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Import and compare' }))
  expect(screen.queryByRole('button', { name: '₹25L' })).toBeNull()
  expect(document.querySelector('main').textContent).toContain('₹6.2L')
})
