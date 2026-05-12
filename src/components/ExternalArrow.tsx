type ExternalArrowProps = {
  className?: string
}

export const ExternalArrow = ({ className }: ExternalArrowProps) => (
  <span aria-hidden='true' className={`text-amber-400 ${className ?? ''}`}>
    ↗
  </span>
)
