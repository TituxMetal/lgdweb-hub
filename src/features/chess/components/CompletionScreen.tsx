import { BackToList } from '~/components/BackToList'
import { Link } from '~/lib/router'
import { openingChapter, storyById } from '../lib/navigation'
import { type CompletedChapters, completedCount, percentage } from '../lib/progress'
import { CHESS_BRANCH, chapterPath } from '../lib/routes'
import { CHESS_STORIES } from '../lib/stories'
import { buttonClass } from './Button'
import { ChessNotFound } from './ChessNotFound'

type CompletionScreenProps = {
  storyId: string
  completed: CompletedChapters
}

/**
 * The original's completion screen (`pages/CompletionPage.tsx`): the cheer, the
 * story's name, and what the visit added up to — the chapters finished and how far
 * through the story that is. Its two blocks the original never showed are not here:
 * the key-concept list (no story declared any) and the question score (nothing
 * recorded a question result), so both rendered only as absent.
 *
 * Reloaded directly, the counters start at zero, which is what the original did
 * with the progress its session no longer held.
 */
export const CompletionScreen = ({ storyId, completed }: CompletionScreenProps) => {
  const story = storyById(CHESS_STORIES, storyId)

  if (story === undefined) return <ChessNotFound />

  const done = completedCount(completed, story)
  const percent = percentage(done, story.chapters.length)
  const opening =
    story.nextStory === undefined ? null : openingChapter(CHESS_STORIES, story.nextStory)

  return (
    <>
      <BackToList />

      <section className='rounded-xl border border-zinc-700 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-6 py-16 text-center'>
        <div className='mb-6 text-6xl' aria-hidden='true'>
          🎉
        </div>

        <h2 className='mb-4 bg-linear-to-r from-green-400 to-blue-500 bg-clip-text text-4xl font-bold text-transparent'>
          Bravo !
        </h2>

        <h3 className='mb-6 text-2xl font-semibold text-zinc-100'>
          Tu as terminé « {story.title} »
        </h3>

        <p className='mb-4 text-lg text-zinc-300'>
          Excellent travail ! Tu as maîtrisé les concepts de cette histoire.
        </p>

        <p className='text-zinc-400'>
          Continue ton apprentissage pour devenir un véritable maître des échecs !
        </p>
      </section>

      <section className='mt-8 mb-8 animate-pulse rounded-xl border border-zinc-700 bg-zinc-800 p-8'>
        <div className='mb-6 grid grid-cols-2 gap-6'>
          <div className='text-center'>
            <div className='mb-2 text-3xl font-bold text-blue-400'>{done}</div>
            <div className='text-zinc-300'>Chapitres complétés</div>
          </div>
          <div className='text-center'>
            <div className='mb-2 text-3xl font-bold text-purple-400'>{percent}%</div>
            <div className='text-zinc-300'>Progression</div>
          </div>
        </div>

        <div className='mb-6 h-3 w-full rounded-full bg-zinc-700'>
          <div
            className='h-3 rounded-full bg-linear-to-r from-green-500 to-blue-500 transition-all duration-500'
            style={{ width: `${percent}%` }}
            role='progressbar'
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${percent}% de progression`}
          />
        </div>

        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
          {opening !== null && (
            <Link
              to={chapterPath(opening.storyId, opening.chapterId)}
              className={`px-8 py-4 text-lg font-semibold ${buttonClass('primary')}`}
              aria-label="Continuer vers l'histoire suivante"
            >
              Continuer →
            </Link>
          )}

          <Link
            to={CHESS_BRANCH}
            className={`px-8 py-4 text-lg font-semibold ${buttonClass('secondary')}`}
            aria-label="Retour à l'accueil"
          >
            Retour à l’accueil
          </Link>
        </div>
      </section>
    </>
  )
}
