import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background))] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[rgb(var(--accent))] text-[rgb(var(--accent-fg))] shadow-sm hover:opacity-90',
        secondary:
          'bg-[rgb(var(--card))] text-[rgb(var(--card-fg))] border border-[rgb(var(--border))] shadow-sm hover:bg-[rgb(var(--background))]',
        outline:
          'border border-[rgb(var(--border))] bg-[var(--glass)] backdrop-blur-md text-[rgb(var(--foreground))] hover:bg-[rgb(var(--card))]',
        ghost: 'hover:bg-[rgb(var(--card))] text-[rgb(var(--foreground))]',
        link: 'text-[rgb(var(--accent))] underline-offset-4 hover:underline',
        start:
          'rounded-full bg-[rgb(var(--pb-cta))] text-[rgb(var(--pb-cta-label))] shadow-[0_8px_32px_rgba(55,48,42,0.22)] hover:bg-[rgb(var(--pb-cta-hover))] active:scale-[0.99] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 rounded-xl px-8',
        start: 'h-[3.75rem] min-w-[12rem] px-12 text-sm font-semibold uppercase tracking-[0.28em]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
