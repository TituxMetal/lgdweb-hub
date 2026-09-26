import { BackToList } from '~/components/BackToList'
import { useMemoryGame } from '../hooks/useMemoryGame'
import { MAX_BEST_RUNS } from '../lib/bestRuns'
import { MemoryBoard } from './MemoryBoard'

type BestRunSlot = { rank: number; moves: number | undefined }

const BestRunsPanel = ({ runs }: { runs: number[] }) => {
  const slots: BestRunSlot[] = Array.from({ length: MAX_BEST_RUNS }, (_, index) => ({
    rank: index + 1,
    moves: runs[index]
  }))

  return (
    <div className='flex flex-col items-center gap-2'>
      <h2 className='text-[12px] tracking-wider text-neutral-500 uppercase'>Meilleures parties</h2>
      <ol aria-label={`Top ${MAX_BEST_RUNS} parties`} className='text-[14px] tabular-nums'>
        {slots.map((slot) => (
          <li key={slot.rank} className='flex justify-center gap-2'>
            <span className='text-neutral-500'>{slot.rank}.</span>
            <span className={slot.moves === undefined ? 'text-neutral-500' : 'text-neutral-100'}>
              {slot.moves === undefined ? '—' : `${slot.moves} coups`}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export const Memory = () => {
  const { state, bestRuns, flipCard, reset } = useMemoryGame()

  return (
    <section className='space-y-4'>
      <BackToList />

      <div className='flex flex-col items-center gap-6 bg-neutral-800 px-4 py-8 text-neutral-100'>
        <h1 className='text-center text-[24px] font-semibold'>Memory Game by Tuxi Metal</h1>

        <p className='text-[14px] tabular-nums'>
          Coups : <span className='font-semibold text-orange-300'>{state.moves}</span>
        </p>

        <MemoryBoard cards={state.cards} onFlip={flipCard} />

        {state.status === 'won' && (
          <p className='rounded-[5px] bg-violet-800 px-4 py-2 text-center text-[14px] text-orange-300'>
            Plateau vidé en {state.moves} coups !
          </p>
        )}

        <button
          type='button'
          onClick={reset}
          className='cursor-pointer rounded-[5px] bg-orange-300 px-4 py-2 text-[14px] font-semibold text-neutral-800 hover:opacity-90'
        >
          Nouvelle partie
        </button>

        <BestRunsPanel runs={bestRuns} />
      </div>
    </section>
  )
}
