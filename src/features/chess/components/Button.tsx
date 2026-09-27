import type { ReactNode } from 'react'

/** The original's three button tones. */
export type ButtonVariant = 'primary' | 'secondary' | 'neutral'

/**
 * The original's button (`Button.tsx:13-27`), as a class string: the focus ring is
 * the era's amber, the plate the era's zinc, and a disabled button keeps its edge
 * and drops to a dimmed label. It is exported so a link that navigates wears the
 * same clothes as the button that does not.
 */
export const buttonClass = (variant: ButtonVariant, disabled = false): string => {
  const base =
    'rounded-lg px-6 py-3 font-medium transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900'

  if (variant === 'primary') {
    return `${base} ${
      disabled
        ? 'cursor-not-allowed border border-zinc-700 bg-zinc-800 text-zinc-500'
        : 'bg-amber-700 text-amber-100 hover:bg-amber-600'
    }`
  }

  if (variant === 'secondary') return `${base} bg-zinc-700 text-zinc-200 hover:bg-zinc-600`

  return `${base} bg-zinc-800 text-zinc-200 hover:bg-zinc-700`
}

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  disabled?: boolean
  /** The control's spoken name, when its visible text is not enough on its own. */
  'aria-label'?: string
}

/** The button itself, for the controls that are not a navigation: the move field's
 *  submit, and the successor button a wrong answer keeps disabled. */
export const Button = ({
  children,
  onClick,
  variant = 'neutral',
  disabled = false,
  'aria-label': ariaLabel
}: ButtonProps) => (
  <button
    type='button'
    onClick={onClick}
    disabled={disabled}
    className={buttonClass(variant, disabled)}
    aria-label={ariaLabel}
  >
    {children}
  </button>
)
