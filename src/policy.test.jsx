import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import App from './App'

afterEach(cleanup)

/** The ₹5L corporate health policy — the one with the gap. */
function openHealthPolicy() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /IndusHealth Corporate/ }))
}

const section = (heading) => screen.getByRole('heading', { name: heading }).closest('section')
const body = () => document.querySelector('main').textContent

test('the header identifies the policy', () => {
  openHealthPolicy()
  const text = body()
  expect(text).toContain('IndusInd')
  expect(text).toContain('IndusHealth Corporate')
  expect(text, 'policy number in mono').toContain('IHC/2024/8841003')
  expect(text).toContain('₹5,00,000')
})

test('cover is described in plain language, not policy jargon', () => {
  openHealthPolicy()
  const covered = section(/What you.re covered for/).textContent

  expect(covered).toContain('Your wife and son on the same cover')
  expect(covered).toContain('paid directly to the hospital')
  expect(covered, 'no jargon leaks in').not.toContain('sublimit')
  expect(covered).not.toContain('Room rent:')
})

test('exclusions are shown as prominently as cover', () => {
  openHealthPolicy()
  const excluded = section(/What you.re not covered for/).textContent

  expect(excluded).toContain('more than ₹5,000 a night')
  expect(excluded).toContain('you pay the difference')
  expect(excluded).toContain('outside India')
})

test('the gap callout uses the real transaction as evidence', () => {
  openHealthPolicy()
  const gap = screen.getByRole('heading', { name: 'This cover has a hole in it' })
  const callout = gap.closest('section')

  expect(callout.textContent).toContain('Room rent capped at ₹5,000/day')
  expect(callout.textContent, 'ledger evidence').toContain('LILAVATI HOSPITAL')
  expect(callout.textContent).toContain('18 Jan 2026')
  expect(callout.textContent).toContain('₹18,600')

  fireEvent.click(screen.getByRole('button', { name: /Add a top-up/ }))
  expect(screen.getByRole('heading', { name: 'Recommended for you' })).toBeTruthy()
})

test('policies without a gap do not invent one', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Policies' }))
  fireEvent.click(screen.getAllByRole('button', { name: /IndusTerm Secure/ })[0])

  expect(screen.queryByRole('heading', { name: 'This cover has a hole in it' })).toBeNull()
  expect(body()).toContain('Suicide within the first 12 months')
})

test('documents confirm the download with a toast', () => {
  openHealthPolicy()
  expect(screen.queryByRole('status')).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: /Certificate of insurance/ }))
  expect(screen.getByRole('status').textContent).toContain(
    'Certificate of insurance downloaded',
  )
})

test('every management action does something', () => {
  openHealthPolicy()

  fireEvent.click(screen.getByRole('button', { name: 'Share' }))
  expect(screen.getByRole('status').textContent).toContain('ready to share')

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(screen.getByRole('status').textContent).toContain('ring you within 2 hours')

  fireEvent.click(screen.getByRole('button', { name: 'File a claim' }))
  expect(screen.getByRole('heading', { name: 'File a claim' })).toBeTruthy()
})

test('the motor policy shows its own cover and the flood exclusion', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /ICICI Lombard Comprehensive/ }))

  const text = body()
  expect(text).toContain('MH-02-CD-4471')
  expect(text).toContain('cashless at 5,600 garages')
  expect(text, 'the single most useful warning for a Mumbai owner').toContain(
    'Engine damage if water gets in and you restart the car',
  )
})
