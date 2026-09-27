import { percentage } from '../lib/progress'

type ProgressBarProps = {
  current: number
  total: number
  className?: string
}

/**
 * The original's `ProgressBar.tsx`: the chapter's place in its story over a bar
 * that fills as far as it goes, in the era's amber. The fill's width is the one
 * value a utility cannot carry, so it is an inline width — the original took the
 * same route through a CSS variable.
 */
export const ProgressBar = ({ current, total, className = '' }: ProgressBarProps) => {
  const percent = percentage(current, total)

  return (
    <div className={`w-full ${className}`}>
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-sm font-medium text-zinc-300'>
          Chapitre {current} sur {total}
        </span>
        <span className='text-sm font-medium text-zinc-300'>{percent}%</span>
      </div>
      <div className='h-2 w-full rounded-full bg-zinc-800'>
        <div
          className='h-2 rounded-full bg-amber-600 transition-all duration-300'
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
