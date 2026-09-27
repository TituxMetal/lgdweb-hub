import { describe, expect, it } from 'bun:test'
import {
  chapterById,
  chapterPosition,
  firstChapter,
  nextChapter,
  previousChapter,
  storyById
} from './navigation'
import { CHESS_STORIES, type ChessStory } from './stories'

/** A story order shaped like the real one, small enough to reason about: the middle
 *  story holds a single chapter, so a two-step jump has to cross it. */
const storyOrder: ChessStory[] = [
  {
    id: 'one',
    title: 'One',
    chapters: [
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' }
    ],
    nextStory: 'two'
  },
  {
    id: 'two',
    title: 'Two',
    chapters: [{ id: 'c', title: 'C' }],
    previousStory: 'one',
    nextStory: 'three'
  },
  {
    id: 'three',
    title: 'Three',
    chapters: [
      { id: 'd', title: 'D' },
      { id: 'e', title: 'E' },
      { id: 'f', title: 'F' }
    ],
    previousStory: 'two'
  }
]

describe('storyById', () => {
  it('finds the story a URL names', () => {
    expect(storyById(storyOrder, 'two')?.title).toBe('Two')
  })

  it('answers nothing for a story the index does not hold', () => {
    expect(storyById(storyOrder, 'nope')).toBeUndefined()
  })
})

describe('chapterById', () => {
  it('finds the chapter of a story', () => {
    expect(chapterById(storyOrder[2] as ChessStory, 'e')?.id).toBe('e')
  })

  it('answers nothing for a chapter the story does not hold', () => {
    expect(chapterById(storyOrder[0] as ChessStory, 'c')).toBeUndefined()
  })
})

describe('firstChapter', () => {
  it('is the opening chapter of the first story', () => {
    expect(firstChapter(storyOrder)).toEqual({ storyId: 'one', chapterId: 'a' })
  })

  it('is nothing when the index is empty', () => {
    expect(firstChapter([])).toBeNull()
  })

  it('is nothing when the first story holds no chapter', () => {
    expect(firstChapter([{ id: 'one', title: 'One', chapters: [] }])).toBeNull()
  })

  it('is the chapter the original hard-coded on its entry screen', () => {
    expect(firstChapter(CHESS_STORIES)).toEqual({
      storyId: '01-introduction',
      chapterId: '01-what-is-chess'
    })
  })
})

describe('chapterPosition', () => {
  it('numbers a chapter from one and counts its story', () => {
    expect(chapterPosition(storyOrder[2] as ChessStory, 'e')).toEqual({ number: 2, total: 3 })
  })

  it('is nothing for a chapter the story does not hold', () => {
    expect(chapterPosition(storyOrder[0] as ChessStory, 'c')).toBeNull()
  })
})

describe('nextChapter', () => {
  it('steps to the next chapter of the same story', () => {
    expect(nextChapter(storyOrder, 'one', 'a')).toEqual({ storyId: 'one', chapterId: 'b' })
  })

  it('opens the next story at the end of one', () => {
    expect(nextChapter(storyOrder, 'one', 'b')).toEqual({ storyId: 'two', chapterId: 'c' })
  })

  it('steps across a story that holds a single chapter', () => {
    expect(nextChapter(storyOrder, 'two', 'c')).toEqual({ storyId: 'three', chapterId: 'd' })
  })

  it('is nothing at the end of the order', () => {
    expect(nextChapter(storyOrder, 'three', 'f')).toBeNull()
  })

  it('is nothing for a story the index does not hold', () => {
    expect(nextChapter(storyOrder, 'nope', 'a')).toBeNull()
  })

  it('is nothing for a chapter the story does not hold', () => {
    expect(nextChapter(storyOrder, 'one', 'zzz')).toBeNull()
  })

  it('is nothing when the next story the index names is not in it', () => {
    const broken: ChessStory[] = [
      { id: 'one', title: 'One', chapters: [{ id: 'a', title: 'A' }], nextStory: 'gone' }
    ]

    expect(nextChapter(broken, 'one', 'a')).toBeNull()
  })

  it('is nothing when the next story holds no chapter', () => {
    const empty: ChessStory[] = [
      { id: 'one', title: 'One', chapters: [{ id: 'a', title: 'A' }], nextStory: 'two' },
      { id: 'two', title: 'Two', chapters: [], previousStory: 'one' }
    ]

    expect(nextChapter(empty, 'one', 'a')).toBeNull()
  })
})

describe('previousChapter', () => {
  it('steps back inside the same story', () => {
    expect(previousChapter(storyOrder, 'three', 'f')).toEqual({ storyId: 'three', chapterId: 'e' })
  })

  it('steps back into the last chapter of the story before', () => {
    expect(previousChapter(storyOrder, 'two', 'c')).toEqual({ storyId: 'one', chapterId: 'b' })
  })

  it('is nothing at the very beginning of the order', () => {
    expect(previousChapter(storyOrder, 'one', 'a')).toBeNull()
  })

  it('is nothing for a story the index does not hold', () => {
    expect(previousChapter(storyOrder, 'nope', 'a')).toBeNull()
  })

  it('is nothing for a chapter the story does not hold', () => {
    expect(previousChapter(storyOrder, 'one', 'zzz')).toBeNull()
  })

  it('is nothing when the story before the one named is not in the index', () => {
    const broken: ChessStory[] = [
      { id: 'one', title: 'One', chapters: [{ id: 'a', title: 'A' }], previousStory: 'gone' }
    ]

    expect(previousChapter(broken, 'one', 'a')).toBeNull()
  })
})

describe('the archived story order', () => {
  it('walks every chapter exactly once, from the first to the end', () => {
    const walked: string[] = []
    let step = firstChapter(CHESS_STORIES)

    while (step !== null) {
      walked.push(`${step.storyId}/${step.chapterId}`)
      step = nextChapter(CHESS_STORIES, step.storyId, step.chapterId)
    }

    const every = CHESS_STORIES.flatMap((story) =>
      story.chapters.map((chapter) => `${story.id}/${chapter.id}`)
    )

    expect(walked).toEqual(every)
  })

  it('walks back to the first chapter from the last', () => {
    const last = CHESS_STORIES[CHESS_STORIES.length - 1]
    const chapter = last?.chapters[last.chapters.length - 1]

    expect(chapter).toBeDefined()

    let step = previousChapter(CHESS_STORIES, last?.id ?? '', chapter?.id ?? '')
    const backwards: string[] = []

    while (step !== null) {
      backwards.push(`${step.storyId}/${step.chapterId}`)
      step = previousChapter(CHESS_STORIES, step.storyId, step.chapterId)
    }

    expect(backwards[backwards.length - 1]).toBe('01-introduction/01-what-is-chess')
  })
})
