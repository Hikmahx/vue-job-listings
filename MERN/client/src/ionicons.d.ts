import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & { name?: string; size?: string },
        HTMLElement
      >
    }
  }
}

export {}
