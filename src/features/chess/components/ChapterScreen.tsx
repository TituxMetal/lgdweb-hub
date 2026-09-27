import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { BackToList } from '~/components/BackToList'
import { Link, navigate } from '~/lib/router'
import { useChapterContent } from '../hooks/useChapterContent'
import {
  chapterById,
  chapterPosition,
  nextChapter,
  previousChapter,
  storyById
} from '../lib/navigation'
import { CHESS_BRANCH, chapterPath, completionPath } from '../lib/routes'
import { CHESS_STORIES, type ChessChapter, type ChessStory } from '../lib/stories'
import { ChessBoard } from './ChessBoard'
import { NavigationButtons } from './NavigationButtons'
import { ProgressBar } from './ProgressBar'
import { Question } from './Question'

type ChapterScreenProps = {
  storyId: string
  chapterId: string
  onComplete: (storyId: string, chapterId: string) => void
}

/**
 * One chapter of the story, at its own address: what the original's `StoryViewer`
 * showed — the progress bar, the text, the position the chapter demonstrates, the
 * question — with the step back and the step on under it. A chapter the index does
 * not hold answers with the state the original showed for a chapter it could not
 * load, rather than with a blank page.
 */
export const ChapterScreen = ({ storyId, chapterId, onComplete }: ChapterScreenProps) => {
  const story = storyById(CHESS_STORIES, storyId)
  const chapter = story === undefined ? undefined : chapterById(story, chapterId)

  if (story === undefined || chapter === undefined) {
    return <ChapterMissing storyId={storyId} chapterId={chapterId} />
  }

  // Keyed by the chapter: walking to the next one mounts a fresh screen, so no
  // answer, no played move and no highlight is carried over.
  return (
    <Chapter
      key={`${story.id}/${chapter.id}`}
      story={story}
      chapter={chapter}
      onComplete={onComplete}
    />
  )
}

type ChapterProps = {
  story: ChessStory
  chapter: ChessChapter
  onComplete: (storyId: string, chapterId: string) => void
}

const Chapter = ({ story, chapter, onComplete }: ChapterProps) => {
  const content = useChapterContent(story.id, chapter.id)
  const [answered, setAnswered] = useState(false)

  const position = chapterPosition(story, chapter.id)
  const next = nextChapter(CHESS_STORIES, story.id, chapter.id)
  const previous = previousChapter(CHESS_STORIES, story.id, chapter.id)

  // A chapter that asks a move draws the question's own board, so it never carries a
  // position of its own to draw beside it: the read-only board below belongs to the
  // chapters that only tell a story, and the index spec pins that split.
  const showsPosition = chapter.chessPosition !== undefined

  // The original marked a chapter complete as soon as its question was answered
  // right, and again when the visitor walked past it. The set both write into leaves
  // an already-complete chapter alone, so the two cannot double-count.
  const handleAnswer = (correct: boolean): void => {
    setAnswered(true)

    if (correct) onComplete(story.id, chapter.id)
  }

  // The last chapter of a story hands over to its completion screen, as it did in
  // the original; anything else steps to the chapter after it.
  const goNext = (): void => {
    if (chapter.question === undefined || answered) onComplete(story.id, chapter.id)

    if (next === null || next.storyId !== story.id) {
      navigate(completionPath(story.id))
      return
    }

    navigate(chapterPath(next.storyId, next.chapterId))
  }

  return (
    <>
      <BackToList />

      {position !== null && (
        <ProgressBar current={position.number} total={position.total} className='mb-10' />
      )}

      <div className='mb-10 rounded-lg border border-zinc-700 bg-zinc-800 p-6 sm:p-12'>
        {content.state === 'loading' && (
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-400' />
            <p className='text-zinc-300'>Chargement du chapitre…</p>
          </div>
        )}

        {content.state === 'error' && (
          <p className='text-zinc-300'>Le texte de ce chapitre n’a pas pu être chargé.</p>
        )}

        {content.state === 'ready' && (
          <>
            {/* The chapter's own text, as the original rendered it: the file opens on
                its title, which the feature's stylesheet sets in the era's hand. */}
            <div className='chess-chapter'>
              <ReactMarkdown>{content.text}</ReactMarkdown>
            </div>

            {showsPosition && chapter.chessPosition !== undefined && (
              <div className='mt-8 flex justify-center'>
                <ChessBoard position={chapter.chessPosition} interactive={false} />
              </div>
            )}

            {chapter.question !== undefined && (
              <div className='mt-8'>
                <Question question={chapter.question} onAnswer={handleAnswer} />
              </div>
            )}
          </>
        )}
      </div>

      <NavigationButtons
        previous={previous}
        nextEnabled={chapter.question === undefined || answered}
        onNext={goNext}
      />
    </>
  )
}

/** A chapter whose story, or whose chapter, the index does not hold. */
const ChapterMissing = ({ storyId, chapterId }: { storyId: string; chapterId: string }) => (
  <>
    <BackToList />
    <section className='space-y-4'>
      <h2 className='font-medium text-zinc-100'>Chapitre introuvable</h2>
      <p className='text-zinc-400'>
        Aucun chapitre « {chapterId} » dans l’histoire « {storyId} ».
      </p>
      <Link to={CHESS_BRANCH} className='text-amber-400 hover:underline'>
        ← Revenir à l’entrée du jeu d’échecs
      </Link>
    </section>
  </>
)
