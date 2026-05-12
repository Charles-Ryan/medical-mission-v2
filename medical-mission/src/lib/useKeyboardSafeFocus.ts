'use client'

import { RefObject } from 'react'

export function useKeyboardSafeFocus<T extends HTMLElement>() {
  const handleFocus = (ref: RefObject<T | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 250)
  }

  return { handleFocus }
}