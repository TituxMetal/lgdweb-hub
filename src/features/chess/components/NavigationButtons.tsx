import { Link } from '~/lib/router'
import type { ChapterRef } from '../lib/navigation'
import { CHESS_BRANCH, chapterPath } from '../lib/routes'
import { Button, buttonClass } from './Button'

type NavigationButtonsProps = {
  /** The chapter before this one, when the reading order has one. */
  previous: ChapterRef | null
  /** Whether the successor opens a chapter or the story's completion screen — the
   *  successor button asks for it only when a question has not been answered yet. */
  nextEnabled: boolean
  onNext: () => void
}

/**
 * The original's `NavigationButtons.tsx`: back to the previous chapter — or to the
 * feature's entry when this is the first one — and on to the next step. The step
 * back is a link, because it is always there; the step forward is a button, because
 * an unanswered question keeps it disabled, and a wrong answer keeps it disabled too
 * until the answer is right. Between them sits the way out of the reading order and
 * into the lessons' table of contents, which the original did not have and a reader
 * asked for.
 */
export const NavigationButtons = ({ previous, nextEnabled, onNext }: NavigationButtonsProps) => {
  const back = previous === null ? CHESS_BRANCH : chapterPath(previous.storyId, previous.chapterId)

  return (
    <div className='mt-10 flex items-center justify-between gap-3'>
      <Link to={back} className={buttonClass('neutral')}>
        ← {previous === null ? 'Accueil' : 'Précédent'}
      </Link>

      <Link
        to={CHESS_BRANCH}
        className='text-sm text-zinc-400 hover:text-amber-400 hover:underline'
      >
        Sommaire
      </Link>

      <Button onClick={onNext} disabled={!nextEnabled} variant='primary'>
        Suivant →
      </Button>
    </div>
  )
}
