import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        'peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-inner transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[rgb(var(--accent))]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-6 w-6 rounded-full bg-[rgb(var(--foreground))] shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-1',
        )}
      />
    </SwitchPrimitives.Root>
  )
}

export { Switch }
