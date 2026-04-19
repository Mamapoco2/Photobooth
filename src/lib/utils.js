import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}
