import { cleanup } from '@testing-library/react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock PointerEvent
class MockPointerEvent extends Event {
  button: number
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  altKey: boolean
  constructor(type: string, props: PointerEventInit) {
    super(type, props)
    this.button = props.button || 0
    this.ctrlKey = props.ctrlKey || false
    this.metaKey = props.metaKey || false
    this.shiftKey = props.shiftKey || false
    this.altKey = props.altKey || false
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.PointerEvent = MockPointerEvent as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.PointerEvent = MockPointerEvent as any

// Mock hasPointerCapture
Element.prototype.hasPointerCapture = () => false
Element.prototype.setPointerCapture = () => {}
Element.prototype.releasePointerCapture = () => {}

afterEach(() => {
  cleanup()
})