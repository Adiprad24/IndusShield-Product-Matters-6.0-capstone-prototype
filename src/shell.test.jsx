import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import App from './App'

afterEach(cleanup)

// Home has no literal "Home" text of its own — the greeting identifies it.
const ON_HOME = 'Good morning'

const body = () => document.querySelector('main').textContent
const nav = () => document.querySelector('nav')
const tab = (label) => screen.getByRole('button', { name: new RegExp(`^${label}$`) })

test('every tab shows its own screen', () => {
  render(<App />)
  expect(body()).toContain(ON_HOME)

  const tabs = [
    ['Policies', 'My protection'],
    ['Claims', 'Your claim'],
    ['Assist', 'Assist'],
    ['Services', 'Services'],
    ['Home', ON_HOME],
  ]

  for (const [label, expected] of tabs) {
    fireEvent.click(tab(label))
    expect(body(), `tab ${label}`).toContain(expected)
    expect(nav(), `nav on ${label}`).not.toBeNull()
  }
})

test('active tab is marked for styling', () => {
  render(<App />)
  expect(tab('Home').getAttribute('aria-current')).toBe('page')
  fireEvent.click(tab('Assist'))
  expect(tab('Assist').getAttribute('aria-current')).toBe('page')
  expect(tab('Home').getAttribute('aria-current')).toBeNull()
})

test('sub-screen swaps the bottom nav for a back header, and back returns', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /Protection score/ }))

  expect(screen.getByRole('heading', { name: 'Protection Score' })).toBeTruthy()
  expect(nav(), 'bottom nav must be hidden on sub-screens').toBeNull()
  expect(body()).toContain('Score')

  fireEvent.click(screen.getByLabelText('Go back'))
  expect(body()).toContain(ON_HOME)
  expect(nav()).not.toBeNull()
})

test('back returns to the tab the sub-screen was opened from', () => {
  render(<App />)
  fireEvent.click(tab('Assist'))
  fireEvent.click(tab('Home'))
  fireEvent.click(screen.getByRole('button', { name: /IndusHealth Corporate/ }))
  expect(screen.getByRole('heading', { name: 'Policy' })).toBeTruthy()

  fireEvent.click(screen.getByLabelText('Go back'))
  expect(body()).toContain(ON_HOME)
})

test('back is never a dead end even with an empty history', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Renew' }))
  fireEvent.click(screen.getByLabelText('Go back'))
  fireEvent.click(screen.getByRole('button', { name: 'Import and compare' }))
  fireEvent.click(screen.getByLabelText('Go back'))
  expect(body()).toContain(ON_HOME)
  expect(nav()).not.toBeNull()
})

test('every sub-screen is reachable from Home', () => {
  const routes = [
    [/Protection score/, 'Protection Score'],
    ['Get covered', 'Recommended for you'],
    ['Import and compare', 'Compare plans'],
    ['Renew', 'Buy'],
    [/IndusHealth Corporate/, 'Policy'],
    ['File a claim', 'File a claim'],
  ]

  for (const [button, title] of routes) {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: button }))
    expect(screen.getByRole('heading', { name: title }), `sub-screen ${title}`).toBeTruthy()
    cleanup()
  }
})

test('Home passes the tapped policy through to the policy screen', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /ICICI Lombard Comprehensive/ }))
  expect(screen.getByRole('heading', { name: 'Policy' })).toBeTruthy()
})

test('Home renders real data, not placeholders', () => {
  render(<App />)
  const home = body()
  expect(home).toContain('Rohan')
  expect(home).toContain('62')
  expect(home).toContain('3 gaps')
  expect(home, 'ledger row must show the real debit').toContain('ICICI LOMBARD GIC')
  expect(home).toContain('₹8,420')
  expect(home, 'sum insured in Indian numerals').toContain('₹5,00,000')
  expect(home).toContain('₹6,20,000')
})

test('dismissing the signal leaves a way forward, not a hole', () => {
  render(<App />)
  fireEvent.click(screen.getByLabelText('Dismiss this suggestion'))
  expect(body()).not.toContain('ICICI LOMBARD GIC')
  fireEvent.click(screen.getByRole('button', { name: /See all your options/ }))
  expect(screen.getByRole('heading', { name: 'Recommended for you' })).toBeTruthy()
})

test('every category has a ghost track, including the zero-score one', () => {
  const { container } = render(<App />)
  const dashed = container.querySelectorAll('path[stroke-dasharray="2 3"]')
  expect(dashed.length).toBe(6)
})
