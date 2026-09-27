import { useCallback, useState } from 'react'
import { useCurrentPath } from '~/lib/router'
import '../chess.css'
import { type CompletedChapters, withChapterCompleted } from '../lib/progress'
import { chessRoute } from '../lib/routes'
import { ChapterScreen } from './ChapterScreen'
import { ChessEntry } from './ChessEntry'
import { ChessNotFound } from './ChessNotFound'
import { CompletionScreen } from './CompletionScreen'

/**
 * The 2025 chess app, modernized: a story in six parts that teaches chess from zero,
 * with a board to read positions on and to answer move questions with.
 *
 * The central map mounts this feature for anything under `/projects/chess`, and the
 * feature reads what follows its own branch — the original's own three URLs, the
 * entry, a chapter and a story's completion, all of them addressable and reloadable.
 * The progress a visit makes lives here, in this component's state, so leaving the
 * feature releases it.
 */
export const Chess = () => {
  const path = useCurrentPath()
  const route = chessRoute(path)
  const [completed, setCompleted] = useState<CompletedChapters>(new Set())

  const complete = useCallback((storyId: string, chapterId: string): void => {
    setCompleted((previous) => withChapterCompleted(previous, storyId, chapterId))
  }, [])

  switch (route.screen) {
    case 'entry':
      return <ChessEntry />
    case 'chapter':
      return (
        <ChapterScreen storyId={route.storyId} chapterId={route.chapterId} onComplete={complete} />
      )
    case 'completion':
      return <CompletionScreen storyId={route.storyId} completed={completed} />
    case 'not-found':
      return <ChessNotFound />
  }
}
