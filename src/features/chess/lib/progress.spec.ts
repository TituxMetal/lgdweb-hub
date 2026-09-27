import { describe, expect, it } from 'bun:test'
import {
  chapterCompleted,
  chapterKey,
  completedCount,
  percentage,
  withChapterCompleted
} from './progress'
import type { ChessStory } from './stories'

const story: ChessStory = {
  id: 'one',
  title: 'One',
  chapters: [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
}

describe('chapterKey', () => {
  it('names a chapter by its story and itself', () => {
    expect(chapterKey('01-introduction', '01-what-is-chess')).toBe(
      '01-introduction/01-what-is-chess'
    )
  })
})

describe('withChapterCompleted', () => {
  it('adds a chapter to the chapters already done', () => {
    const completed = withChapterCompleted(new Set(), 'one', 'a')

    expect([...completed]).toEqual(['one/a'])
    expect(chapterCompleted(completed, 'one', 'a')).toBe(true)
  })

  it('leaves the set it is given alone', () => {
    const before = withChapterCompleted(new Set(), 'one', 'a')
    const after = withChapterCompleted(before, 'one', 'b')

    expect([...before]).toEqual(['one/a'])
    expect([...after]).toEqual(['one/a', 'one/b'])
  })

  it('hands the same set back when the chapter is already done', () => {
    const before = withChapterCompleted(new Set(), 'one', 'a')

    expect(withChapterCompleted(before, 'one', 'a')).toBe(before)
  })
})

describe('chapterCompleted', () => {
  it('is false for a chapter of another story with the same id', () => {
    const completed = withChapterCompleted(new Set(), 'one', 'a')

    expect(chapterCompleted(completed, 'two', 'a')).toBe(false)
    expect(chapterCompleted(completed, 'one', 'b')).toBe(false)
  })
})

describe('completedCount', () => {
  it('counts only the chapters of the story it is given', () => {
    const completed = withChapterCompleted(withChapterCompleted(new Set(), 'one', 'a'), 'two', 'a')

    expect(completedCount(completed, story)).toBe(1)
  })

  it('counts none of a story nobody started', () => {
    expect(completedCount(new Set(), story)).toBe(0)
  })
})

describe('percentage', () => {
  it('rounds a part of a whole', () => {
    expect(percentage(1, 3)).toBe(33)
    expect(percentage(2, 3)).toBe(67)
    expect(percentage(3, 3)).toBe(100)
    expect(percentage(0, 4)).toBe(0)
  })

  it('reads nothing out of nothing as zero, not as a division by zero', () => {
    expect(percentage(1, 0)).toBe(0)
  })
})
