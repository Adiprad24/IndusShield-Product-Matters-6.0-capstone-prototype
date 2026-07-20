import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import App from './App'
import PolicyCard from './components/PolicyCard'
import Toast from './components/Toast'
import { HomeSkeleton } from './screens/Home'
import { POLICIES } from './data/mockData'

afterEach(cleanup)

const body = () => document.querySelector('main').textContent

test('the loading skeleton is decorative but announces itself', () => {
  const { container } = render(<HomeSkeleton />)

  expect(
    container.querySelectorAll('[class*="shimmer"]').length,
    'shimmer blocks',
  ).toBeGreaterThan(3)
  expect(screen.getByRole('status').textContent).toContain('Loading your protection')

  // Skeleton blocks must not be read out as content.
  for (const block of container.querySelectorAll('.bg-ink\\/8')) {
    expect(block.getAttribute('aria-hidden')).toBe('true')
  }
})

test('screens animate in on every move, including back', () => {
  render(<App />)
  const main = () => document.querySelector('main')
  expect(main().className).toContain('screenIn')

  const first = main()
  fireEvent.click(screen.getByRole('button', { name: 'Get covered' }))
  expect(main(), 'main remounts so the animation replays').not.toBe(first)

  const second = main()
  fireEvent.click(screen.getByLabelText('Go back'))
  expect(main()).not.toBe(second)
})

test('the toast renders dark with a sage check, and can drop the icon', () => {
  const { container, rerender } = render(<Toast message="Saved" shown />)
  expect(container.querySelector('.bg-ink')).not.toBeNull()
  expect(container.querySelector('.text-sage'), 'check icon').not.toBeNull()
  expect(screen.getByRole('status').getAttribute('aria-live')).toBe('polite')

  rerender(<Toast message="Calling" shown icon={false} />)
  expect(container.querySelector('.text-sage')).toBeNull()
})

test('the toast clears the bottom nav rather than covering it', () => {
  render(<Toast message="Saved" shown />)
  expect(screen.getByRole('status').className).toContain('bottom-20')
})

// --- dead ends found in the audit -----------------------------------------

test('the policy detail header is a card, not a button to nowhere', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /IndusHealth Corporate/ }))

  // On the detail screen the same card must not be tappable.
  expect(screen.queryByRole('button', { name: /IndusHealth Corporate/ })).toBeNull()
  expect(body()).toContain('IndusHealth Corporate')
})

test('PolicyCard is a button only when it has somewhere to go', () => {
  const { container, rerender } = render(<PolicyCard policy={POLICIES[0]} />)
  expect(container.querySelector('button')).toBeNull()

  rerender(<PolicyCard policy={POLICIES[0]} onPress={() => {}} />)
  expect(container.querySelector('button')).not.toBeNull()
})

test('dismissing the signal confirms rather than silently vanishing', () => {
  render(<App />)
  expect(screen.queryByRole('status')).toBeNull()

  fireEvent.click(screen.getByLabelText('Dismiss this suggestion'))
  expect(screen.getByRole('status').textContent).toContain('Suggestion hidden')
})

test('buying cover with no policy record routes to the vault, not the wrong policy', () => {
  render(<App />)
  // Travel: there is no travel policy on file, so "View policy" would have
  // opened the health policy.
  fireEvent.click(screen.getByRole('button', { name: 'Get covered' }))
  fireEvent.click(screen.getByRole('button', { name: 'Travel' }))
  fireEvent.click(screen.getByRole('button', { name: 'View plan' }))
  fireEvent.click(screen.getByRole('button', { name: 'Buy this plan' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }))
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.click(screen.getByRole('button', { name: /Pay .* and activate cover/ }))

  const exit = screen.getByRole('button', { name: 'See it in your vault' })
  fireEvent.click(exit)
  expect(screen.getByRole('heading', { name: 'My protection' })).toBeTruthy()
  expect(body(), 'must not show the health policy detail').not.toContain(
    'What you’re covered for',
  )
})

test('buying a product that does have a policy still opens it', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Get covered' }))
  fireEvent.click(screen.getAllByRole('button', { name: 'View plan' })[0])
  fireEvent.click(screen.getByRole('button', { name: 'Buy this plan' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continue to payment' }))
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.click(screen.getByRole('button', { name: /Pay .* and activate cover/ }))

  fireEvent.click(screen.getByRole('button', { name: 'View policy' }))
  expect(screen.getByRole('heading', { name: 'Policy' })).toBeTruthy()
  expect(body()).toContain('IHC/2024/8841003')
})

test('every icon-only button carries an accessible name', () => {
  const visit = ['Policies', 'Claims', 'Assist', 'Services', 'Home']
  render(<App />)

  for (const tab of visit) {
    fireEvent.click(screen.getByRole('button', { name: tab }))
    for (const button of document.querySelectorAll('button')) {
      const hasText = button.textContent.trim().length > 0
      const hasLabel = button.getAttribute('aria-label')
      expect(
        hasText || hasLabel,
        `icon-only button on ${tab} needs an aria-label: ${button.outerHTML.slice(0, 90)}`,
      ).toBeTruthy()
    }
  }
})

test('the ring straddles the header without colliding with the greeting', () => {
  const { container } = render(<App />)

  const header = container.querySelector('header')
  expect(header.className, 'deep padding is the clear space the ring sits in').toContain(
    'pb-20',
  )
  expect(header.className, 'header must sit under the ring').toContain('z-0')

  const ringSection = header.nextElementSibling
  expect(ringSection.className).toContain('-mt-16')
  expect(ringSection.className, 'ring must sit over the header edge').toContain('z-10')

  // A white medallion behind the arcs keeps the score legible over maroon.
  const disc = ringSection.querySelector('.rounded-full.bg-white')
  expect(disc, 'backing disc').not.toBeNull()
  expect(disc.className).toContain('shadow-md')

  // 190px ring, 162px disc: centre sits 31px below the header edge, on paper.
  const svg = ringSection.querySelector('svg')
  expect(svg.getAttribute('width')).toBe('190')
})

test('the skeleton reserves the same space the ring will occupy', () => {
  const { container } = render(<HomeSkeleton />)
  const banner = container.querySelector('.rounded-b-3xl')
  expect(banner.className, 'same header padding as the real screen').toContain('pb-20')
  expect(banner.nextElementSibling.className, 'same ring offset').toContain('-mt-16')
})
