import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import App from './App'

afterEach(cleanup)

function openDiscover() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Get covered' }))
}

const cards = () => document.querySelectorAll('article')

test('all five products are listed, badged ones first', () => {
  openDiscover()
  const names = [...cards()].map((card) => card.querySelector('h2').textContent)
  expect(names).toEqual([
    'IndusHealth Family Floater',
    'IndusDrive Comprehensive',
    'IndusTravel Shield',
    'IndusHome Contents',
    'IndusCyber Guard',
  ])
})

test('badges render only where mockData sets them', () => {
  openDiscover()
  const list = [...cards()]
  expect(list[0].textContent).toContain('Best match')
  expect(list[1].textContent).toContain('Most bought')
  expect(list[2].textContent).not.toContain('Best match')
  expect(list[2].textContent).not.toContain('Most bought')
})

test('the motor card undercuts the competitor with their own figure', () => {
  openDiscover()
  const motor = [...cards()][1]
  expect(motor.textContent).toContain('₹7,890')
  expect(motor.textContent).toContain('you paid')

  const struck = motor.querySelector('.line-through')
  expect(struck, 'old premium must be struck through').not.toBeNull()
  expect(struck.textContent).toBe('₹8,420')
})

test('every card earns its recommendation with a bank-signal fact', () => {
  openDiscover()
  expect([...cards()][0].textContent).toContain('₹18,600 Lilavati bill')
  expect([...cards()][1].textContent).toContain('₹530 less than you paid last year')
  expect([...cards()][2].textContent).toContain('₹42,800 MakeMyTrip booking')
})

test('filter chips narrow the list', () => {
  openDiscover()
  expect(cards().length).toBe(5)

  fireEvent.click(screen.getByRole('button', { name: 'Motor' }))
  expect(cards().length).toBe(1)
  expect([...cards()][0].textContent).toContain('IndusDrive Comprehensive')

  fireEvent.click(screen.getByRole('button', { name: 'All' }))
  expect(cards().length).toBe(5)
})

test('arriving from a category gap pre-filters the list', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /Protection score/ }))
  fireEvent.click(
    screen.getAllByRole('button').find((b) => /^Travel/.test(b.textContent.trim())),
  )
  fireEvent.click(screen.getByRole('button', { name: /Fix this/ }))

  expect(cards().length).toBe(1)
  expect([...cards()][0].textContent).toContain('IndusTravel Shield')
  expect(screen.getByRole('button', { name: 'Travel' }).getAttribute('aria-pressed')).toBe(
    'true',
  )
})

test('"View plan" opens that product\'s comparison', () => {
  openDiscover()
  fireEvent.click(screen.getAllByRole('button', { name: 'View plan' })[0])
  expect(screen.getByRole('heading', { name: 'Compare plans' })).toBeTruthy()
  expect(document.querySelector('header').textContent).toContain(
    'IndusHealth Family Floater',
  )
})
