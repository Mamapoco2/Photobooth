import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

function Slider({ className, ...props }) {
  return (
    <SliderPrimitive.Root
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[rgb(var(--border))]">
        <SliderPrimitive.Range className="absolute h-full bg-[rgb(var(--accent))]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-md ring-[rgb(var(--accent))]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]" />
    </SliderPrimitive.Root>
  )
}

export { Slider }
