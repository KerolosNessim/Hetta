import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Storefront "sticker" buttons: ink outline + hard shadow that presses in on click.
        sticker:
          'border-2 border-ink bg-accent text-accent-foreground shadow-sticker-sm hover:-translate-y-px hover:shadow-sticker active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
        stickerPrimary:
          'border-2 border-ink bg-primary text-primary-foreground shadow-sticker-sm hover:-translate-y-px hover:shadow-sticker active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
        outlineInk: 'border-2 border-ink bg-card text-foreground hover:bg-secondary',
        // Dashboard (plain shadcn look)
        default: 'bg-primary text-primary-foreground hover:bg-teal-strong',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline: 'border border-input bg-card hover:bg-secondary',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-secondary',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-9 px-3',
        lg: 'h-13 px-6 text-base',
        icon: 'size-11',
        iconSm: 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
