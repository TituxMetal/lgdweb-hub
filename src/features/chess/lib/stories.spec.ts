import { describe, expect, it } from 'bun:test'
import { chapterFile } from './chapterFile'
import { CHESS_STORIES } from './stories'

const storiesDir = (path: string): URL => new URL(`../stories/${path}`, import.meta.url)

describe('the archived story index', () => {
  it('lists every story once', () => {
    const ids = CHESS_STORIES.map((story) => story.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('lists every chapter once, inside the story that holds it', () => {
    const keys = CHESS_STORIES.flatMap((story) =>
      story.chapters.map((chapter) => `${story.id}/${chapter.id}`)
    )

    expect(new Set(keys).size).toBe(keys.length)
    expect(keys).toContain('01-introduction/01-what-is-chess')
    expect(keys).toContain('06-opening-fundamentals/05-simple-openings')
  })

  it('holds no empty story', () => {
    for (const story of CHESS_STORIES) {
      expect(story.title.length).toBeGreaterThan(0)
      expect(story.chapters.length).toBeGreaterThan(0)
    }
  })

  it('chains the stories in reading order, from the first to the last', () => {
    CHESS_STORIES.forEach((story, index) => {
      const before = CHESS_STORIES[index - 1]
      const after = CHESS_STORIES[index + 1]

      expect(story.previousStory).toBe(before?.id)
      expect(story.nextStory).toBe(after?.id)
    })
  })

  it('gives every chapter its file, opening on its own title', async () => {
    for (const story of CHESS_STORIES) {
      for (const chapter of story.chapters) {
        const file = Bun.file(storiesDir(chapterFile(story.id, chapter.id)))

        expect(await file.exists()).toBe(true)

        const text = await file.text()

        expect(text.trimStart().startsWith('## ')).toBe(true)
        expect(text.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('asks every chapter something, with an answer to compare against', () => {
    for (const story of CHESS_STORIES) {
      for (const chapter of story.chapters) {
        const question = chapter.question

        expect(question).toBeDefined()

        if (question === undefined) continue

        expect(question.prompt.length).toBeGreaterThan(0)
        expect(question.explanation.length).toBeGreaterThan(0)
        expect(question.correctAnswer.length).toBeGreaterThan(0)
      }
    }
  })

  it('offers the choices a multiple-choice question answers with', () => {
    for (const story of CHESS_STORIES) {
      for (const chapter of story.chapters) {
        const question = chapter.question

        if (question?.type !== 'multiple-choice') continue

        expect(question.options).toBeDefined()

        for (const answer of question.correctAnswer) {
          expect(question.options).toContain(answer)
        }
      }
    }
  })

  it('writes every move-based answer as two squares of the board', () => {
    for (const story of CHESS_STORIES) {
      for (const chapter of story.chapters) {
        const question = chapter.question

        if (question?.type !== 'move-based') continue

        for (const answer of question.correctAnswer) {
          expect(answer).toMatch(/^[a-h][1-8][a-h][1-8]$/)
        }
      }
    }
  })

  it('writes every position as a FEN or as the original’s keyword', () => {
    for (const story of CHESS_STORIES) {
      for (const chapter of story.chapters) {
        for (const position of [chapter.chessPosition, chapter.question?.initialPosition]) {
          if (position === undefined) continue

          if (position === 'startpos' || position === 'start') continue

          expect(position.split(' ').length).toBe(6)
        }
      }
    }
  })
})
