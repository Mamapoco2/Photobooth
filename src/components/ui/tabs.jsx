import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive.Root className={cn('w-full', className)} {...props} />
  )
}

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-xl bg-[rgb(var(--card))]/70 p-1 text-[rgb(var(--muted))] backdrop-blur-md border border-[rgb(var(--border))]',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-[rgb(var(--background))] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[rgb(var(--accent))] data-[state=active]:text-[rgb(var(--accent-fg))] data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'mt-4 ring-offset-[rgb(var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]',
        className,
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
