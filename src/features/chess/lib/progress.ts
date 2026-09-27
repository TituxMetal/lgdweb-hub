import type { ChessStory } from './stories'

/**
 * The chapters a visitor got through, by key: the port's replacement for the
 * original's `progressStore`, which kept a `Set` of `story-chapter` strings in
 * memory. Keeping it as a value — not a module-level store — is what releases the
 * progress when the visitor leaves the feature.
 */
export type CompletedChapters = ReadonlySet<string>

/** The key both a chapter's completion and its lookup are written with. */
export const chapterKey = (storyId: string, chapterId: string): string => `${storyId}/${chapterId}`

/**
 * The same set with one more chapter in it. The set it is given is left alone —
 * React compares by identity — and an already-finished chapter hands it back
 * untouched, so re-reading a chapter costs no render.
 */
export const withChapterCompleted = (
  completed: CompletedChapters,
  storyId: string,
  chapterId: string
): CompletedChapters => {
  const key = chapterKey(storyId, chapterId)

  if (completed.has(key)) return completed

  const next = new Set(completed)
  next.add(key)

  return next
}

/** Whether a chapter is one the visitor got through. */
export const chapterCompleted = (
  completed: CompletedChapters,
  storyId: string,
  chapterId: string
): boolean => completed.has(chapterKey(storyId, chapterId))

/** How many of a story's chapters are complete — what the completion screen counts. */
export const completedCount = (completed: CompletedChapters, story: ChessStory): number =>
  story.chapters.filter((chapter) => chapterCompleted(completed, story.id, chapter.id)).length

/**
 * A rounded percentage. Nothing out of nothing reads as 0 rather than as a
 * division by zero, which is what the original's completion screen showed when a
 * visitor reloaded it directly and the session's progress was gone.
 */
export const percentage = (part: number, whole: number): number =>
  whole === 0 ? 0 : Math.round((part / whole) * 100)
