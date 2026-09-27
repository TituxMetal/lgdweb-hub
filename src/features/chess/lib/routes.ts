import { projectPath } from '~/data/projects'
import { matchRoute } from '~/lib/router'

/** The slug the showroom serves this feature under. */
const CHESS_SLUG = 'chess'

/**
 * The feature's own branch: the prefix the central map matches, and the prefix
 * the feature strips to read what is its own. It comes from the manifest's URL
 * shape, so the branch cannot drift from the URL the cards link to.
 */
export const CHESS_BRANCH = projectPath(CHESS_SLUG)

/** The original's two internal URL shapes, past the branch. */
const CHAPTER_PATTERN = '/story/:storyId/chapter/:chapterId'
const COMPLETION_PATTERN = '/story/:storyId/completion'

export type ChessRoute =
  | { screen: 'entry' }
  | { screen: 'chapter'; storyId: string; chapterId: string }
  | { screen: 'completion'; storyId: string }
  | { screen: 'not-found' }

/** The URL of a chapter, inside the branch. */
export const chapterPath = (storyId: string, chapterId: string): string =>
  `${CHESS_BRANCH}/story/${storyId}/chapter/${chapterId}`

/** The URL of a story's completion screen, inside the branch. */
export const completionPath = (storyId: string): string =>
  `${CHESS_BRANCH}/story/${storyId}/completion`

/** What one of the feature's own paths says — the entry, a chapter, a completion — or none of them. */
export const chessRoute = (path: string): ChessRoute => {
  const rest = branchRemainder(path)

  if (rest === null) return { screen: 'not-found' }
  if (rest === '') return { screen: 'entry' }

  const chapter = matchRoute(rest, CHAPTER_PATTERN)
  if (chapter?.storyId !== undefined && chapter.chapterId !== undefined) {
    return { screen: 'chapter', storyId: chapter.storyId, chapterId: chapter.chapterId }
  }

  const completion = matchRoute(rest, COMPLETION_PATTERN)
  if (completion?.storyId !== undefined) {
    return { screen: 'completion', storyId: completion.storyId }
  }

  return { screen: 'not-found' }
}

/**
 * The path past the feature's branch — `''` for the branch itself, `null` for a
 * path that belongs to another branch. The central map mounts this feature only
 * under its own prefix, so a `null` here means someone followed a path the feature
 * does not answer for.
 */
const branchRemainder = (path: string): string | null => {
  if (path === CHESS_BRANCH) return ''
  if (!path.startsWith(`${CHESS_BRANCH}/`)) return null

  return path.slice(CHESS_BRANCH.length + 1)
}
