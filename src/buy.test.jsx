import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App'

afterEach(cleanup)

/** Health purchase, reached the way a user reaches it. */
function openBuy() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Get covered' }))
  fireEvent.click(screen.getAllByRole('button', { name: 'View plan' })[0])
  fireEvent.click(screen.getByRole('button', { name: 'Buy this plan' }))
}

const chip = (name) => screen.getByRole('button', { name })
const body = () => document.querySelector('main').textContent

test('step 1 pre-fills everything from KYC and asks for no typing', () => {
  openBuy()
  expect(screen.getByRole('heading', { name: 'We already have this' })).toBeTruthy()

  const text = body()
  expect(text).toContain('Rohan Mehta')
  expect(text).toContain('14 Mar 1994')
  expect(text).toContain('ABCPM••••K')
  expect(text).toContain('Oberoi Springs')
  expect(text).toContain('From your IndusInd KYC')

  expect(document.querySelectorAll('input, textarea').length, 'no keyboard input').toBe(0)
})

test('members start fully selected and toggle off', () => {
  openBuy()
  for (const member of ['Self', 'Spouse', 'Child']) {
    expect(chip(member).getAttribute('aria-pressed'), member).toBe('true')
  }
  fireEvent.click(chip('Child'))
  expect(chip('Child').getAttribute('aria-pressed')).toBe('false')
})

test('conditions default to None and are mutually exclusive with it', () => {
  openBuy()
  expect(chip('None').getAttribute('aria-pressed')).toBe('true')

  fireEvent.click(chip('Diabetes'))
  expect(chip('Diabetes').getAttribute('aria-pressed')).toBe('true')
  expect(chip('None').getAttribute('aria-pressed'), 'None must clear').toBe('false')

  fireEvent.click(chip('None'))
  expect(chip('Diabetes').getAttribute('aria-pressed')).toBe('false')

  // Unticking the last real condition falls back to None rather than nothing.
  fireEvent.click(chip('Thyroid'))
  fireEvent.click(chip('Thyroid'))
  expect(chip('None').getAttribute('aria-pressed')).toBe('true')
})

test('step 2 re-prices live as cover and add-ons change', () => {
  openBuy()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

  const bar = document.querySelector('.sticky')
  expect(bar.textContent).toContain('₹11,400')

  fireEvent.click(screen.getByRole('button', { name: /₹25L cover/ }))
  expect(bar.textContent).toContain('₹18,200')

  // 18,200 + 3,200 maternity = 21,400
  fireEvent.click(screen.getByRole('button', { name: /Maternity cover/ }))
  expect(bar.textContent).toContain('₹21,400')
  expect(bar.textContent).toContain('1 add-on')

  // + 1,400 OPD = 22,800
  fireEvent.click(screen.getByRole('button', { name: /OPD & diagnostics/ }))
  expect(bar.textContent).toContain('₹22,800')
  expect(bar.textContent).toContain('2 add-ons')
})

test('step 3 itemises the bill and the GST arithmetic holds', () => {
  openBuy()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: /Maternity cover/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }))

  const text = body()
  // 11,400 base + 3,200 maternity = 14,600; GST 18% = 2,628; total 17,228
  expect(text).toContain('₹11,400')
  expect(text).toContain('+₹3,200')
  expect(text).toContain('GST 18%')
  expect(text).toContain('₹2,628')
  expect(text).toContain('₹17,228')

  expect(screen.getByRole('button', { name: /Pay ₹17,228 and activate cover/ })).toBeTruthy()
})

test('the account is pre-selected and shows its balance', () => {
  openBuy()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }))

  const account = screen.getByRole('button', { name: /IndusInd Savings/ })
  expect(account.getAttribute('aria-pressed')).toBe('true')
  expect(account.textContent).toContain('XXXX 4471')
  expect(account.textContent).toContain('₹2,47,800')

  fireEvent.click(screen.getByRole('button', { name: /UPI/ }))
  expect(account.getAttribute('aria-pressed')).toBe('false')
})

test('paying is blocked until consent is given, and says why', () => {
  openBuy()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }))

  const pay = screen.getByRole('button', { name: /Pay .* and activate cover/ })
  expect(pay.disabled).toBe(true)
  expect(body()).toContain('Tick the box above to activate your cover')

  fireEvent.click(screen.getByRole('checkbox'))
  expect(pay.disabled).toBe(false)
})

test('back steps through the flow without leaving it', () => {
  openBuy()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  expect(screen.getByRole('heading', { name: 'Choose your cover' })).toBeTruthy()

  fireEvent.click(screen.getByRole('button', { name: 'Back' }))
  expect(screen.getByRole('heading', { name: 'We already have this' })).toBeTruthy()
})

test('paying lands on the confirmation and closes the loop on the score', () => {
  openBuy()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }))
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.click(screen.getByRole('button', { name: /Pay .* and activate cover/ }))

  expect(screen.getByRole('heading', { name: /You’re covered/ })).toBeTruthy()
  const text = document.body.textContent
  expect(text, 'policy number').toContain('IHF/2026/4471903')
  expect(text).toContain('Immediately')
  expect(text).toContain('₹10,00,000')

  // The visible figure animates; the label carries the destination value.
  expect(
    screen.getByLabelText('Your Protection Score went from 62 to 78'),
  ).toBeTruthy()
})

test('the score counter actually converges on 78', async () => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
  try {
    openBuy()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }))
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /Pay .* and activate cover/ }))

    await act(async () => {
      vi.advanceTimersByTime(1500)
    })

    const line = screen.getByLabelText('Your Protection Score went from 62 to 78')
    expect(line.textContent.replace(/\s+/g, ' ')).toContain('62 to 78')
  } finally {
    vi.useRealTimers()
  }
})

test('both exits from the confirmation work', () => {
  openBuy()
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }))
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.click(screen.getByRole('button', { name: /Pay .* and activate cover/ }))

  fireEvent.click(screen.getByRole('button', { name: 'Back to home' }))
  expect(body()).toContain('Good morning')
})

test('a motor purchase offers motor add-ons, not maternity', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Renew' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

  expect(screen.getByRole('button', { name: /Engine protect/ })).toBeTruthy()
  expect(screen.queryByRole('button', { name: /Maternity cover/ })).toBeNull()
  expect(body(), 'zero-dep is already included in this plan').not.toContain(
    'Zero depreciation',
  )
})
