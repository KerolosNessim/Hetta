import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import * as SelectPrimitive from '@radix-ui/react-select'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full min-w-0 rounded-lg border border-input bg-card px-3 text-base outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm'

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input data-slot="input" className={cn(fieldBase, 'h-11', className)} {...props} />
}

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea data-slot="textarea" className={cn(fieldBase, 'min-h-24 py-2 leading-7', className)} {...props} />
}

const EMPTY = '__empty__'

type SelectProps = {
  value: string
  onChange: (e: { target: { value: string } }) => void
  children: React.ReactNode
  id?: string
  className?: string
  placeholder?: string
  disabled?: boolean
  'aria-invalid'?: boolean
}

/**
 * shadcn-style select (Radix, popper-positioned under the trigger). Takes <option>
 * children so call sites stay as simple as a native select; an option with value=""
 * is the "none" choice.
 */
export function Select({ value, onChange, children, id, className, disabled, ...rest }: SelectProps) {
  const options = React.Children.toArray(children)
    .filter((c): c is React.ReactElement<{ value?: string; children?: React.ReactNode }> => React.isValidElement(c))
    .map((c) => {
      const label = c.props.children
      const v = c.props.value ?? (typeof label === 'string' ? label : String(label))
      return { value: v, label }
    })
  const current = options.find((o) => o.value === value)

  return (
    <SelectPrimitive.Root dir="rtl" value={value === '' ? EMPTY : value} onValueChange={(v) => onChange({ target: { value: v === EMPTY ? '' : v } })} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        data-slot="select"
        aria-invalid={rest['aria-invalid']}
        className={cn(fieldBase, 'flex h-11 cursor-pointer items-center justify-between gap-2 text-start data-[placeholder]:text-muted-foreground', className)}
      >
        <span className="truncate">{current?.label ?? rest.placeholder}</span>
        <ChevronDownIcon className="size-4 shrink-0 opacity-60" aria-hidden="true" />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className="z-[60] max-h-[min(20rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] min-w-40 overflow-hidden rounded-xl border-2 border-ink bg-popover text-popover-foreground shadow-sticker-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          <SelectPrimitive.Viewport className="p-1.5">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value === '' ? EMPTY : o.value}
                className="relative flex cursor-pointer items-center rounded-lg py-2 ps-3 pe-8 text-sm outline-none select-none data-[highlighted]:bg-secondary data-[state=checked]:font-semibold"
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute end-2.5">
                  <CheckIcon className="size-4 text-primary" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn('flex items-center gap-2 text-sm leading-none font-medium select-none', className)}
      {...props}
    />
  )
}

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        className,
      )}
      {...props}
    >
      {/* RTL: the thumb starts on the right and slides left when checked */}
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 rounded-full bg-white shadow transition-transform data-[state=checked]:-translate-x-5 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  )
}

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
