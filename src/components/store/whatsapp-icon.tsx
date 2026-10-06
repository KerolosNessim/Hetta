import type { SVGProps } from 'react'

/** Generic chat-bubble glyph (not the WhatsApp trademark logo). */
export function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      <path d="M9 10.5c.5 1.6 1.9 3 3.5 3.5" />
    </svg>
  )
}
