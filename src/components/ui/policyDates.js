import { DEMO_TODAY, parseExpiry } from '../../data/mockData'

/** Whole days from the fixed demo date to a policy's expiry. */
export function daysUntil(expiry) {
  return Math.ceil((parseExpiry(expiry) - DEMO_TODAY) / 86400000)
}
