import { BackToList } from '~/components/BackToList'
import { Link } from '~/lib/router'
import { firstChapter } from '../lib/navigation'
import { chapterPath } from '../lib/routes'
import { CHESS_STORIES } from '../lib/stories'
import { buttonClass } from './Button'

/** The three cards under the entry's button, word for word the original's. */
const ENTRY_CARDS = [
  { icon: '📚', title: 'Histoires', text: 'Apprends avec des récits' },
  { icon: '♟️', title: 'Échiquier', text: 'Pratique les coups' },
  { icon: '🎯', title: 'Exercices', text: 'Teste tes connaissances' }
]

/**
 * The original's entry screen (`pages/HomePage.tsx`): the pawn, the welcome, the
 * button that opens the first chapter, and the three cards that say what the app
 * holds. The button was hard-coded to the first chapter's URL; the port reads that
 * chapter from the story index, so the entry and the reading order cannot disagree.
 */
export const ChessEntry = () => {
  const start = firstChapter(CHESS_STORIES)

  return (
    <>
      <BackToList />

      <section className='flex flex-col items-center px-6 py-8 text-center'>
        <div className='mb-8 text-6xl' aria-hidden='true'>
          ♟️
        </div>

        <h2 className='mb-4 text-center text-4xl font-semibold text-zinc-100'>
          Bienvenue dans votre apprentissage des échecs
        </h2>

        <p className='mb-12 max-w-xl text-center text-lg leading-relaxed text-zinc-300'>
          Découvre le monde des échecs à travers des histoires captivantes.
        </p>

        {start !== null && (
          <Link
            to={chapterPath(start.storyId, start.chapterId)}
            className={`mb-20 px-10 py-3.5 ${buttonClass('primary')}`}
            aria-label="Commencer l'apprentissage des échecs"
          >
            Commencer l’apprentissage
          </Link>
        )}

        <div className='grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3'>
          {ENTRY_CARDS.map((card) => (
            <div
              key={card.title}
              className='rounded-lg border border-zinc-700 bg-zinc-800 p-8 text-center'
            >
              <div className='mb-3 text-3xl' aria-hidden='true'>
                {card.icon}
              </div>
              <h3 className='mb-2 text-base font-medium text-zinc-100'>{card.title}</h3>
              <p className='text-sm text-zinc-400'>{card.text}</p>
            </div>
          ))}
        </div>

        <nav className='mt-20 w-full max-w-4xl text-left' aria-label='Sommaire des leçons'>
          <h3 className='mb-6 text-center text-lg font-medium text-zinc-100'>
            Sommaire des leçons
          </h3>

          <ol className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {CHESS_STORIES.map((story) => (
              <li key={story.id} className='rounded-lg border border-zinc-700 bg-zinc-800 p-6'>
                <p className='mb-3 font-medium text-amber-300'>{story.title}</p>

                <ul className='space-y-1.5'>
                  {story.chapters.map((chapter, index) => (
                    <li key={chapter.id}>
                      <Link
                        to={chapterPath(story.id, chapter.id)}
                        className='text-sm text-zinc-300 hover:text-amber-400 hover:underline'
                      >
                        {index + 1}. {chapter.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </nav>
      </section>
    </>
  )
}
