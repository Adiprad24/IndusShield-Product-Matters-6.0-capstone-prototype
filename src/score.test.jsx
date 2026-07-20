import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import App from './App'

afterEach(cleanup)

function openScore() {
  const utils = render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /Protection score/ }))
  return utils
}

test('categories are listed worst-first', () => {
  openScore()
  const rows = screen.getAllByRole('button', { expanded: false })
  const categories = rows
    .map((row) => row.textContent)
    .filter((text) => /Adequate|Thin|Exposed/.test(text))
  const names = ['Travel', 'Home', 'Cyber', 'Life', 'Health', 'Motor']
  const order = categories.map((text) => names.find((name) => text.startsWith(name)))
  expect(order).toEqual(['Travel', 'Home', 'Cyber', 'Life', 'Health', 'Motor'])
})

test('status chips follow the score thresholds', () => {
  openScore()
  const rowFor = (category) =>
    screen
      .getAllByRole('button')
      .find((button) => new RegExp(`^${category}`).test(button.textContent.trim()))

  expect(rowFor('Motor').textContent).toContain('Adequate') // 85
  expect(rowFor('Health').textContent).toContain('Thin') // 55
  expect(rowFor('Life').textContent).toContain('Thin') // 40, the boundary
  expect(rowFor('Cyber').textContent).toContain('Exposed') // 30
  expect(rowFor('Travel').textContent).toContain('Exposed') // 0
})

test('"How this is calculated" is closed by default and opens on tap', () => {
  openScore()
  const toggle = screen.getByRole('button', { name: /How this is calculated/ })
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
  expect(screen.queryByText(/weight four things/)).toBeNull()

  fireEvent.click(toggle)
  expect(toggle.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByText(/weight four things/)).toBeTruthy()
})

test('expanding a category reveals its reason, target and fix', () => {
  openScore()
  const row = screen
    .getAllByRole('button')
    .find((button) => /^Health/.test(button.textContent.trim()))

  expect(screen.queryByText(/Only ₹5L corporate cover/)).toBeNull()
  fireEvent.click(row)

  const panel = row.parentElement.textContent
  expect(panel).toContain('Only ₹5L corporate cover')
  expect(panel, 'target figure in Indian numerals').toContain('₹25,00,000')
  expect(panel).toContain('for a family of three in Mumbai')
})

test('"Fix this" carries the category into Discover', () => {
  openScore()
  fireEvent.click(
    screen.getAllByRole('button').find((b) => /^Travel/.test(b.textContent.trim())),
  )
  fireEvent.click(screen.getByRole('button', { name: /Fix this/ }))
  expect(screen.getByRole('heading', { name: 'Recommended for you' })).toBeTruthy()
})

test('footer CTA quotes a figure the catalogue can actually honour', () => {
  openScore()
  // Travel 1,240 + Home 2,100 + Cyber 899 = 4,239/yr = 353/mo
  const cta = screen.getByRole('button', { name: /Close all/ })
  expect(cta.textContent).toContain('3 gaps')
  expect(cta.textContent).toContain('₹353')
})

test('the hero ring is presentational here, not a link back to itself', () => {
  const { container } = openScore()
  const rings = container.querySelectorAll('svg path[stroke-dasharray="2 3"]')
  expect(rings.length).toBe(6)
  expect(screen.queryByRole('button', { name: /Protection score \d+ out of 100/ })).toBeNull()
})

test('benchmark shows both the user and the peer average', () => {
  openScore()
  expect(screen.getByText(/Customers like you in Mumbai average/)).toBeTruthy()
  expect(screen.getByText('You 62')).toBeTruthy()
  expect(screen.getByText('Peers 74')).toBeTruthy()
})
