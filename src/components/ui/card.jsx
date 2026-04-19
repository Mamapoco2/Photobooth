import * as React from 'react'
import { cn } from '@/lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-[var(--glass)] text-[rgb(var(--card-fg))] shadow-[var(--shadow-glass)] backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1.5 p-6 pb-3', className)} {...props} />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-[rgb(var(--foreground))]',
        className,
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-sm text-[rgb(var(--muted))]', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return <div className={cn('p-6 pt-3', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
