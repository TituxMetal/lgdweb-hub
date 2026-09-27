import type { ChessChapter, ChessStory } from './stories'

/** A chapter, as a URL names it. */
export type ChapterRef = { storyId: string; chapterId: string }

/** The story a URL names, or `undefined` when the index holds no such story. */
export const storyById = (
  stories: readonly ChessStory[],
  storyId: string
): ChessStory | undefined => stories.find((story) => story.id === storyId)

/** The chapter of that story, or `undefined` when the story does not hold one. */
export const chapterById = (story: ChessStory, chapterId: string): ChessChapter | undefined =>
  story.chapters.find((chapter) => chapter.id === chapterId)

/** The chapter's place in its story, or `-1` when it is not one of them. */
const chapterIndex = (story: ChessStory, chapterId: string): number =>
  story.chapters.findIndex((chapter) => chapter.id === chapterId)

/** The first chapter of a story, or `null` when the index holds no such story. */
export const openingChapter = (
  stories: readonly ChessStory[],
  storyId: string
): ChapterRef | null => {
  const story = storyById(stories, storyId)
  const chapter = story?.chapters[0]

  if (story === undefined || chapter === undefined) return null

  return { storyId: story.id, chapterId: chapter.id }
}

/**
 * Where the story order starts: the opening chapter of the first story. The original
 * hard-coded that chapter's URL on its entry screen; the port reads it from the
 * index, so the two can never disagree.
 */
export const firstChapter = (stories: readonly ChessStory[]): ChapterRef | null => {
  const first = stories[0]

  return first === undefined ? null : openingChapter(stories, first.id)
}

/** The chapter's 1-based position in its story, `null` when it is not one of them. */
export const chapterPosition = (
  story: ChessStory,
  chapterId: string
): { number: number; total: number } | null => {
  const index = chapterIndex(story, chapterId)

  if (index === -1) return null

  return { number: index + 1, total: story.chapters.length }
}

/**
 * The step after a chapter: the next one in its story, or the opening chapter of
 * the story the index names next — `null` at the end of the reading order.
 */
export const nextChapter = (
  stories: readonly ChessStory[],
  storyId: string,
  chapterId: string
): ChapterRef | null => {
  const story = storyById(stories, storyId)
  if (story === undefined) return null

  const index = chapterIndex(story, chapterId)
  if (index === -1) return null

  const following = story.chapters[index + 1]
  if (following !== undefined) return { storyId: story.id, chapterId: following.id }

  return story.nextStory === undefined ? null : openingChapter(stories, story.nextStory)
}

/**
 * The step before a chapter: the one preceding it in its story, or the last
 * chapter of the story the index names before — `null` at the very beginning.
 */
export const previousChapter = (
  stories: readonly ChessStory[],
  storyId: string,
  chapterId: string
): ChapterRef | null => {
  const story = storyById(stories, storyId)
  if (story === undefined) return null

  const index = chapterIndex(story, chapterId)
  if (index === -1) return null

  const preceding = story.chapters[index - 1]
  if (preceding !== undefined) return { storyId: story.id, chapterId: preceding.id }

  const before =
    story.previousStory === undefined ? undefined : storyById(stories, story.previousStory)
  const last = before?.chapters[before.chapters.length - 1]

  if (before === undefined || last === undefined) return null

  return { storyId: before.id, chapterId: last.id }
}
