import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Sheet = SheetPrimitive.Root
export const SheetTrigger = SheetPrimitive.Trigger
export const SheetClose = SheetPrimitive.Close

export function SheetContent({
  className,
  children,
  side = 'left',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: 'left' | 'right' }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <SheetPrimitive.Content
        dir="rtl"
        className={cn(
          'fixed inset-y-0 z-50 flex w-full max-w-md flex-col bg-background shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:duration-200',
          side === 'left'
            ? 'left-0 border-e-2 border-ink data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left'
            : 'right-0 border-s-2 border-ink data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-4 end-4 grid size-10 place-items-center rounded-lg border-2 border-ink bg-card outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <XIcon className="size-5" />
          <span className="sr-only">إغلاق</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

export const SheetTitle = (p: React.ComponentProps<typeof SheetPrimitive.Title>) => (
  <SheetPrimitive.Title className={cn('font-display text-3xl', p.className)} {...p} />
)
export const SheetDescription = (p: React.ComponentProps<typeof SheetPrimitive.Description>) => (
  <SheetPrimitive.Description className={cn('text-sm text-muted-foreground', p.className)} {...p} />
)
