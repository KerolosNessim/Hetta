import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      accent: 'bg-accent text-accent-foreground',
      highlight: 'bg-orange-strong text-white',
      success: 'bg-[#e8f5ec] text-[#1e7b3c]',
      warning: 'bg-[#fff8e6] text-[#8a5a05]',
      muted: 'bg-secondary text-muted-foreground',
      tealSubtle: 'bg-teal-subtle text-teal-strong',
    },
  },
  defaultVariants: { variant: 'default' },
})

export function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card" className={cn('rounded-xl border bg-card text-card-foreground', className)} {...props} />
}

export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-0', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 className={cn('text-base font-bold', className)} {...props} />
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-4 p-5', className)} {...props} />
}

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('animate-pulse rounded-lg bg-secondary', className)} {...props} />
}

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
}
export const TableHeader = (p: React.ComponentProps<'thead'>) => <thead className={cn('bg-[#faf7f0] [&_tr]:border-b', p.className)} {...p} />
export const TableBody = (p: React.ComponentProps<'tbody'>) => <tbody className={cn('[&_tr:last-child]:border-0', p.className)} {...p} />
export const TableRow = (p: React.ComponentProps<'tr'>) => <tr className={cn('border-b transition-colors hover:bg-[#faf7f0]', p.className)} {...p} />
export const TableHead = (p: React.ComponentProps<'th'>) => (
  <th className={cn('h-11 px-4 text-start align-middle font-medium whitespace-nowrap text-muted-foreground', p.className)} {...p} />
)
export const TableCell = (p: React.ComponentProps<'td'>) => <td className={cn('px-4 py-3 align-middle', p.className)} {...p} />

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}
