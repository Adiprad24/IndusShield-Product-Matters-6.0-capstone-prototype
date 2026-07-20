import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App'
import { ASSISTANT_QA, DEFAULT_ANSWER, QUICK_PROMPTS, matchAnswer } from './data/mockData'

afterEach(cleanup)

function openAssist() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Assist' }))
}

const body = () => document.querySelector('main').textContent

/** Sends a question and runs out the typing delay. */
async function ask(text) {
  const field = screen.getByLabelText('Ask Assist a question')
  fireEvent.change(field, { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
  await act(async () => {
    vi.advanceTimersByTime(1200)
  })
}

test('opens grounded in his actual data', () => {
  openAssist()
  expect(body()).toContain('Hi Rohan')
  expect(body(), 'counts his real policies').toContain('3 policies')
  expect(body()).toContain('Knows your policies. Answers in plain English.')
})

test('every quick prompt is answerable — none fall through to the fallback', () => {
  for (const prompt of QUICK_PROMPTS) {
    expect(matchAnswer(prompt).answer, prompt).not.toBe(DEFAULT_ANSWER)
  }
})

test('quick prompts show first, then disappear once the chat starts', async () => {
  vi.useFakeTimers()
  try {
    openAssist()
    for (const prompt of QUICK_PROMPTS) {
      expect(screen.getByRole('button', { name: prompt })).toBeTruthy()
    }

    fireEvent.click(screen.getByRole('button', { name: QUICK_PROMPTS[0] }))
    await act(async () => {
      vi.advanceTimersByTime(1200)
    })

    expect(screen.queryByRole('button', { name: QUICK_PROMPTS[1] })).toBeNull()
  } finally {
    vi.useRealTimers()
  }
})

test('a typing indicator precedes the answer', async () => {
  vi.useFakeTimers()
  try {
    openAssist()
    const field = screen.getByLabelText('Ask Assist a question')
    fireEvent.change(field, { target: { value: 'what is idv' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByLabelText('Assist is typing')).toBeTruthy()
    expect(body(), 'answer must not appear before the delay').not.toContain(
      'stolen or damaged beyond repair',
    )

    await act(async () => {
      vi.advanceTimersByTime(1200)
    })

    expect(screen.queryByLabelText('Assist is typing')).toBeNull()
    expect(body()).toContain('stolen or damaged beyond repair')
  } finally {
    vi.useRealTimers()
  }
})

test('the flood answer is the demo answer', async () => {
  vi.useFakeTimers()
  try {
    openAssist()
    fireEvent.click(screen.getByRole('button', { name: 'Am I covered for monsoon flooding?' }))
    await act(async () => {
      vi.advanceTimersByTime(1200)
    })

    const text = body()
    expect(text, 'covered under own-damage').toContain('waterlogged seats')
    expect(text, 'the exception that matters').toContain('hydrostatic lock')
    expect(text, 'the cost of getting it wrong').toContain('₹80,000 to ₹1,50,000')
    expect(text, 'the fix, priced').toContain('₹740 a year')
    expect(text, 'the actionable instruction').toContain('do not restart a stalled car')

    // Grounded in the actual motor policy, with a way to act on it.
    expect(text).toContain('ICICI Lombard Comprehensive')
    expect(screen.getByRole('button', { name: /Add Engine Protect/ })).toBeTruthy()
  } finally {
    vi.useRealTimers()
  }
})

test('answers are grounded with a chip naming the policy they read from', async () => {
  vi.useFakeTimers()
  try {
    openAssist()
    await ask('what about room rent')
    expect(body(), 'health question cites the health policy').toContain(
      'IndusHealth Corporate',
    )

    cleanup()
    openAssist()
    await ask('how does ncb work')
    expect(body(), 'motor question cites the motor policy').toContain(
      'ICICI Lombard Comprehensive',
    )
  } finally {
    vi.useRealTimers()
  }
})

test('gap answers offer a way to close the gap', async () => {
  vi.useFakeTimers()
  try {
    openAssist()
    await ask('is my cover enough')

    expect(body()).toContain('belongs to your employer')
    fireEvent.click(screen.getByRole('button', { name: /See top-up options/ }))
    expect(screen.getByRole('heading', { name: 'Recommended for you' })).toBeTruthy()
  } finally {
    vi.useRealTimers()
  }
})

test('an unmatched question falls back without pretending', async () => {
  vi.useFakeTimers()
  try {
    openAssist()
    await ask('what is the capital of Peru')
    expect(body()).toContain("I don't have a good answer for that one yet")
  } finally {
    vi.useRealTimers()
  }
})

test('send is blocked on empty input and while replying', async () => {
  vi.useFakeTimers()
  try {
    openAssist()
    expect(screen.getByRole('button', { name: 'Send' }).disabled).toBe(true)

    const field = screen.getByLabelText('Ask Assist a question')
    fireEvent.change(field, { target: { value: '   ' } })
    expect(screen.getByRole('button', { name: 'Send' }).disabled, 'whitespace only').toBe(true)

    fireEvent.change(field, { target: { value: 'renewal' } })
    expect(screen.getByRole('button', { name: 'Send' }).disabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByRole('button', { name: 'Send' }).disabled, 'while typing').toBe(true)
    await act(async () => {
      vi.advanceTimersByTime(1200)
    })
    expect(field.value, 'field clears after send').toBe('')
  } finally {
    vi.useRealTimers()
  }
})

test('matching is case-insensitive and substring based', () => {
  expect(matchAnswer('MONSOON').keywords).toContain('monsoon')
  expect(matchAnswer('Tell me about my NCB please').keywords).toContain('ncb')
  expect(matchAnswer('').answer).toBe(DEFAULT_ANSWER)
})

test('every QA entry that cites a policy points at a real one', () => {
  const ids = ['P1', 'P2', 'P3']
  for (const entry of ASSISTANT_QA) {
    if (entry.policyId) expect(ids, entry.keywords[0]).toContain(entry.policyId)
  }
})
