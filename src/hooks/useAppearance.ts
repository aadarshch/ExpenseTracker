import { useEffect, useState } from 'react'

const BLUR_KEY = 'expense-tracker:glass-blur'
const DUST_KEY = 'expense-tracker:golden-dust'
const DEFAULT_PERCENT = 70
const MIN = 25
const MAX = 100

const clamp = (value: number) => Math.min(MAX, Math.max(MIN, Math.round(value / 5) * 5))

export const blurToPx = (percent: number) => Math.round(4 + percent * 0.32)

function readStoredPercent(): number {
  try {
    const raw = Number(localStorage.getItem(BLUR_KEY))
    return Number.isFinite(raw) && raw >= MIN && raw <= MAX ? clamp(raw) : DEFAULT_PERCENT
  } catch {
    return DEFAULT_PERCENT
  }
}

function readStoredDust(): boolean {
  try {
    const raw = localStorage.getItem(DUST_KEY)
    return raw === null ? true : raw === 'true'
  } catch {
    return true
  }
}

const hasStorage = typeof localStorage !== 'undefined'
const initialPercent = hasStorage ? readStoredPercent() : DEFAULT_PERCENT
const initialDust = hasStorage ? readStoredDust() : true

if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--glass-blur', `${blurToPx(initialPercent)}px`)
}

export function useAppearance() {
  const [percent, setPercent] = useState(initialPercent)
  const [dust, setDust] = useState(initialDust)

  useEffect(() => {
    document.documentElement.style.setProperty('--glass-blur', `${blurToPx(percent)}px`)
    try {
      localStorage.setItem(BLUR_KEY, String(percent))
    } catch {
      // Private mode can block storage; the setting still works for this session.
    }
  }, [percent])

  useEffect(() => {
    try {
      localStorage.setItem(DUST_KEY, String(dust))
    } catch {
      // Ignore storage failures.
    }
  }, [dust])

  return {
    percent,
    setPercent: (value: number) => setPercent(clamp(value)),
    reset: () => setPercent(DEFAULT_PERCENT),
    blurPx: blurToPx(percent),
    dust,
    toggleDust: () => setDust((value) => !value),
  }
}
