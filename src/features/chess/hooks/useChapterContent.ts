import { useEffect, useState } from 'react'
import { chapterFile } from '../lib/chapterFile'

/**
 * Every chapter's text, by module path: the files sit beside this hook, and the
 * bundler hands each one back as a chunk of its own, fetched when a visitor opens
 * that chapter rather than with the feature.
 */
const CHAPTER_TEXTS = import.meta.glob('../stories/*/*.md', {
  query: '?raw',
  import: 'default'
}) as Record<string, () => Promise<string>>

/**
 * Where a chapter's text stands: still coming, there, or nowhere — the last one is
 * what the original showed when its markdown could not be loaded.
 */
export type ChapterContent =
  | { state: 'loading'; text: null }
  | { state: 'ready'; text: string }
  | { state: 'error'; text: null }

/** The one "still coming" value, so a mount that keeps it re-renders nothing. */
const LOADING: ChapterContent = { state: 'loading', text: null }

/**
 * The chapter's text, loaded when its screen mounts. What a chapter load opens is
 * released with the screen: a text that lands after the visitor has gone is
 * dropped, so a slow load can never write over the chapter they are reading now.
 */
export const useChapterContent = (storyId: string, chapterId: string): ChapterContent => {
  const [content, setContent] = useState<ChapterContent>(LOADING)

  useEffect(() => {
    const load = CHAPTER_TEXTS[`../stories/${chapterFile(storyId, chapterId)}`]

    if (load === undefined) {
      setContent({ state: 'error', text: null })
      return
    }

    let current = true
    setContent(LOADING)

    load()
      .then((text) => {
        if (current) setContent({ state: 'ready', text })
      })
      .catch(() => {
        if (current) setContent({ state: 'error', text: null })
      })

    return () => {
      current = false
    }
  }, [storyId, chapterId])

  return content
}
