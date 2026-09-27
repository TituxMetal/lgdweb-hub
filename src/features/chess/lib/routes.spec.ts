import { describe, expect, it } from 'bun:test'
import { CHESS_BRANCH, chapterPath, chessRoute, completionPath } from './routes'

describe('chessRoute', () => {
  it('reads the branch itself as the entry screen', () => {
    expect(chessRoute(CHESS_BRANCH)).toEqual({ screen: 'entry' })
  })

  it('reads the branch with a trailing slash as the entry screen too', () => {
    expect(chessRoute(`${CHESS_BRANCH}/`)).toEqual({ screen: 'entry' })
  })

  it('reads a chapter at its own address, however deep the path goes', () => {
    expect(chessRoute('/projects/chess/story/01-introduction/chapter/01-what-is-chess')).toEqual({
      screen: 'chapter',
      storyId: '01-introduction',
      chapterId: '01-what-is-chess'
    })
  })

  it('reads a chapter of a story the index does not hold — existence is the index’s business', () => {
    expect(chessRoute('/projects/chess/story/nope/chapter/also-nope')).toEqual({
      screen: 'chapter',
      storyId: 'nope',
      chapterId: 'also-nope'
    })
  })

  it('reads a completion screen', () => {
    expect(chessRoute('/projects/chess/story/02-piece-moves/completion')).toEqual({
      screen: 'completion',
      storyId: '02-piece-moves'
    })
  })

  it('reads a path the feature answers for as none of its screens', () => {
    expect(chessRoute('/projects/chess/junk')).toEqual({ screen: 'not-found' })
    expect(chessRoute('/projects/chess/story/01-introduction')).toEqual({ screen: 'not-found' })
    expect(chessRoute('/projects/chess/story/01-introduction/chapter')).toEqual({
      screen: 'not-found'
    })
    expect(chessRoute('/projects/chess/story/01-introduction/chapter/a/extra')).toEqual({
      screen: 'not-found'
    })
  })

  it('reads a path outside the branch as none of its screens', () => {
    expect(chessRoute('/')).toEqual({ screen: 'not-found' })
    expect(chessRoute('/projects')).toEqual({ screen: 'not-found' })
    expect(chessRoute('/projects/snake')).toEqual({ screen: 'not-found' })
    expect(chessRoute('/about/projects/chess')).toEqual({ screen: 'not-found' })
  })

  it('does not take a branch that merely starts with the same letters', () => {
    expect(chessRoute('/projects/chessmate')).toEqual({ screen: 'not-found' })
    expect(chessRoute('/projects/chessboard/story/a/chapter/b')).toEqual({ screen: 'not-found' })
  })
})

describe('the feature’s own URLs', () => {
  it('build the chapter address the parser reads back', () => {
    expect(chessRoute(chapterPath('02-piece-moves', '01-pawn'))).toEqual({
      screen: 'chapter',
      storyId: '02-piece-moves',
      chapterId: '01-pawn'
    })
  })

  it('build the completion address the parser reads back', () => {
    expect(chessRoute(completionPath('02-piece-moves'))).toEqual({
      screen: 'completion',
      storyId: '02-piece-moves'
    })
  })

  it('live under the branch the manifest gives the project', () => {
    expect(CHESS_BRANCH).toBe('/projects/chess')
    expect(chapterPath('a', 'b')).toBe('/projects/chess/story/a/chapter/b')
    expect(completionPath('a')).toBe('/projects/chess/story/a/completion')
  })
})
