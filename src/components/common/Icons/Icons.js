import React from 'react'

const base = { width: '1em', height: '1em', viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true', focusable: 'false' }

export const PlayIcon = () => (
  <svg {...base}><path d='M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z' /></svg>
)

export const PauseIcon = () => (
  <svg {...base}><rect x='6' y='5' width='4.5' height='14' rx='1.2' /><rect x='13.5' y='5' width='4.5' height='14' rx='1.2' /></svg>
)

export const SpinnerIcon = () => (
  <svg {...base} fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round'>
    <path d='M12 3a9 9 0 1 0 9 9' opacity='0.9' />
  </svg>
)

export const InstallIcon = () => (
  <svg {...base} fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M12 4v11' /><path d='m7.5 11 4.5 4.5 4.5-4.5' /><path d='M5 19h14' />
  </svg>
)

// iOS-style share glyph: open box with an arrow leaving it.
export const ShareIcon = () => (
  <svg {...base} fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M12 15V4' /><path d='m8 7.5 4-4 4 4' /><path d='M7 11H6a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-1' />
  </svg>
)

export const CloseIcon = () => (
  <svg {...base} fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
    <path d='M6 6l12 12' /><path d='M18 6 6 18' />
  </svg>
)
