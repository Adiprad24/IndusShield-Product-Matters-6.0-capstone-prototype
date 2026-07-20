import { createContext, useContext } from 'react'

/**
 * Node inside the phone frame that overlays (sheets, scrims) portal into, so a
 * "full screen" overlay covers the device and not the whole browser window.
 */
export const OverlayContext = createContext(null)

export function useOverlayContainer() {
  return useContext(OverlayContext)
}
