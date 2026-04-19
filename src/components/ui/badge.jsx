import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[rgb(var(--accent))]/15 text-[rgb(var(--accent))]',
        outline: 'border-[rgb(var(--border))] text-[rgb(var(--muted))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
