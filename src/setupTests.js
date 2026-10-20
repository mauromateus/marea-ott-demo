import '@testing-library/jest-dom'
import { TextEncoder } from 'util'

// jsdom does not ship TextEncoder; the qrcode package needs it (every real browser has it).
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}
