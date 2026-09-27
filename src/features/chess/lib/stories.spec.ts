import { describe, expect, it } from 'bun:test'
import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js'
import { chapterFile } from './chapterFile'
import { applyMove, isPosition, resolvePosition, STARTING_FEN } from './moves'
import { CHESS_STORIES } from './stories'

const storiesDir = (path: string): URL => new URL(`../stories/${path}`, import.meta.url)

/** Every chapter of the index, with the `story/chapter` key the content names it by. */
const chapters = CHESS_STORIES.flatMap((story) =>
  story.chapters.map((chapter) => ({ key: `${story.id}/${chapter.id}`, chapter }))
)

/** The original's two ways of writing "the starting position". */
const KEYWORDS = ['start', 'startpos']

/** The position a chapter is played from, as the screens resolve it. */
const positionOf = (key: string): string => {
  const question = moveQuestion(key)

  return resolvePosition(question.initialPosition)
}

/** The move-based question a chapter asks, which is the only kind this spec plays. */
function moveQuestion(key: string) {
  const found = chapters.find((entry) => entry.key === key)
  const question = found?.chapter.question

  if (question?.type !== 'move-based') throw new Error(`${key} is no move-based chapter`)

  return question
}

/**
 * Plays the chapter's intended answer the way the board does — the port's own
 * `applyMove`, not the engine directly — and hands back the position it leaves.
 */
const playAnswer = (key: string): { game: Chess; from: string; to: string } => {
  const answer = moveQuestion(key).correctAnswer[0]

  if (answer === undefined) throw new Error(`${key} accepts no answer`)

  const played = applyMove(positionOf(key), answer.slice(0, 2), answer.slice(2, 4))

  if (played === null) throw new Error(`${key}: ${answer} is not legal where the chapter plays it`)

  return { game: new Chess(played.fen), from: played.uci.slice(0, 2), to: played.uci.slice(2, 4) }
}

/** The square a side's piece of that type stands on, `undefined` when it has none. */
const squareOf = (game: Chess, color: Color, type: PieceSymbol): string | undefined =>
  game
    .board()
    .flat()
    .find((standing) => standing?.color === color && standing?.type === type)?.square

/** Whether the piece standing on `from` attacks `target`, as the engine reads it. */
const attacks = (game: Chess, from: string, target: string): boolean =>
  game.attackers(target as Square, 'w').some((attacker) => attacker === from)

/** The material one side has left, as a sorted list of its pieces' letters. */
const materialOf = (game: Chess, color: Color): PieceSymbol[] =>
  game
    .board()
    .flat()
    .flatMap((standing) => (standing?.color === color ? [standing.type] : []))
    .sort()

/** Every square of the board, for the claims that sweep it. */
const SQUARES = 'abcdefgh'
  .split('')
  .flatMap((file) => '12345678'.split('').map((rank) => `${file}${rank}`))

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
        const heading = text.trimStart().split('\n')[0] ?? ''

        expect(heading.startsWith('## ')).toBe(true)
        expect(text.trim().length).toBeGreaterThan(0)

        // and the index carries that name, so the lessons' table of contents reads
        // without loading a chapter's text
        expect(chapter.title).toBe(heading.slice(3).trim())
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
})

/**
 * The guard the naive check let through: it asked only for six space-separated
 * fields, so a position naming two black kings, or none, shipped green and the
 * screens silently replaced it with the starting position. These assert what the
 * engine reads and what each chapter teaches, never a restatement of its FEN.
 */
describe('the positions the chapters are played from', () => {
  it('reads every position the content names as one a game can stand in', () => {
    const refused = chapters.flatMap(({ key, chapter }) =>
      [chapter.chessPosition, chapter.question?.initialPosition]
        .filter((position): position is string => position !== undefined)
        .filter((position) => !KEYWORDS.includes(position))
        .filter((position) => !isPosition(position))
        .map((position) => `${key}: ${position}`)
    )

    expect(refused).toEqual([])
  })

  it('never substitutes the starting position for a position the content names', () => {
    const substituted = chapters
      .flatMap(({ key, chapter }) => [
        { key, position: chapter.chessPosition },
        { key, position: chapter.question?.initialPosition }
      ])
      .filter((named): named is { key: string; position: string } => named.position !== undefined)
      .filter(({ position }) => !KEYWORDS.includes(position) && position !== STARTING_FEN)
      .filter(({ position }) => resolvePosition(position) === STARTING_FEN)

    // The screens draw the starting position for a FEN the engine refuses, so a
    // chapter that lands here asks its question on a position it never wrote. The
    // count has to be zero: that is what makes the substitution impossible to ship.
    expect(substituted.map(({ key, position }) => `${key}: ${position}`)).toEqual([])
    expect(substituted.length).toBe(0)
  })

  it('plays every move-based chapter from the white-to-move position it declares', () => {
    for (const { key, chapter } of chapters) {
      const question = chapter.question

      if (question?.type !== 'move-based') continue

      // The position has one home: the question's own, which the board draws. A copy
      // on the chapter is read by nothing, so it can go wrong unnoticed.
      expect(chapter.chessPosition).toBeUndefined()

      const declared = question.initialPosition

      expect(declared).toBeDefined()

      if (declared !== undefined && !KEYWORDS.includes(declared)) {
        expect(positionOf(key)).toBe(declared)
      }

      const game = new Chess(positionOf(key))

      expect(game.turn()).toBe('w')
      expect(game.isCheck()).toBe(false)

      for (const answer of question.correctAnswer) {
        const played = applyMove(positionOf(key), answer.slice(0, 2), answer.slice(2, 4))

        expect(played?.uci).toBe(answer)
      }
    }
  })

  it('gives each side only the material a game could have produced', () => {
    const START: Record<PieceSymbol, number> = { k: 1, q: 1, r: 2, b: 2, n: 2, p: 8 }

    const impossible = chapters.flatMap(({ key, chapter }) => {
      const position = chapter.chessPosition ?? chapter.question?.initialPosition

      if (position === undefined || KEYWORDS.includes(position)) return []

      const game = new Chess(position)

      return (['w', 'b'] as const).flatMap((color) => {
        const left = materialOf(game, color)
        const missingPawns = START.p - left.filter((piece) => piece === 'p').length
        const promoted = (['q', 'r', 'b', 'n'] as const).reduce(
          (count, piece) =>
            count +
            Math.max(0, left.filter((standing) => standing === piece).length - START[piece]),
          0
        )

        // a third rook, or a third bishop with all eight pawns still home, is a
        // position no game reaches: the extra piece has to come from a promotion.
        return promoted > missingPawns ? [`${key} (${color}): ${promoted} extra piece(s)`] : []
      })
    })

    expect(impossible).toEqual([])
  })
})

describe('the claims the chapters make', () => {
  it('lands the kingside knight where it attacks a square in front of a white pawn', () => {
    const key = '02-piece-moves/02-knight'
    const before = new Chess(positionOf(key))
    const pawns = before
      .board()
      .flat()
      .flatMap((standing) =>
        standing !== null && standing.color === 'w' && standing.type === 'p'
          ? [standing.square]
          : []
      )

    expect(pawns.length).toBeGreaterThan(0)

    for (const answer of moveQuestion(key).correctAnswer) {
      const line = new Chess(positionOf(key))
      const played = line.move({ from: answer.slice(0, 2), to: answer.slice(2, 4) })

      expect(played.piece).toBe('n')

      // the prompt's clause: where the knight lands, it attacks a square standing in
      // front of one of Alex's own pawns — the point of the L-shaped jump
      const ahead = SQUARES.filter(
        (square) =>
          attacks(line, played.to, square) &&
          pawns.some((pawn) => pawn[0] === square[0] && Number(pawn[1]) < Number(square[1]))
      )

      expect(ahead.length).toBeGreaterThan(0)
    }
  })

  it('takes the knight the prompt names, leaving the black king alone', () => {
    const { game, to } = playAnswer('02-piece-moves/04-rook')

    // the prompt asks for the capture, so the move has to be one: the rook stands on
    // the knight's square, and black has nothing but his king left
    expect(to).toBe('f6')
    expect(game.get(to as Square)).toMatchObject({ color: 'w', type: 'r' })
    expect(materialOf(game, 'b')).toEqual(['k'])
  })

  it('forks the black king and a black rook with one knight move', () => {
    const { game, to } = playAnswer('04-essential-tactics/01-fork-attack')
    const king = squareOf(game, 'b', 'k')
    const rook = squareOf(game, 'b', 'r')

    expect(king).toBeDefined()
    expect(rook).toBeDefined()

    if (king === undefined || rook === undefined) return

    // a royal fork: the same knight attacks both
    expect(attacks(game, to, king)).toBe(true)
    expect(attacks(game, to, rook)).toBe(true)

    // and it wins the rook: nothing black has takes the knight, and the rook is loose
    const replies = game.moves({ verbose: true })

    expect(replies.length).toBeGreaterThan(0)
    expect(replies.filter((reply) => reply.to === to)).toEqual([])
    expect(game.attackers(rook as Square, 'b')).toEqual([])
  })

  it('uncovers a bishop check with the knight that blocked it, and attacks the queen', () => {
    const key = '04-essential-tactics/03-discovered-attack'
    const before = new Chess(positionOf(key))
    const { game, from, to } = playAnswer(key)
    const king = squareOf(game, 'b', 'k')
    const queen = squareOf(game, 'b', 'q')

    if (king === undefined || queen === undefined) throw new Error(`${key}: a target is missing`)

    const checkers = game.attackers(king as Square, 'w')

    // the discovery the prose describes: one bishop, checked by nothing before the
    // move because the knight stood on its line, checking the king once it steps off
    expect(before.attackers(king as Square, 'w')).toEqual([])
    expect(checkers).toHaveLength(1)
    expect(before.get(checkers[0] as Square)?.type).toBe('b')
    expect(attacks(before, checkers[0] as string, from)).toBe(true)
    expect(game.isCheck()).toBe(true)

    // and the knight it moved attacks the queen the explanation names
    expect(attacks(game, to, queen)).toBe(true)

    // black has to answer the check, and every answer still loses the queen
    const replies = game.moves({ verbose: true })

    expect(replies.length).toBeGreaterThan(0)

    for (const reply of replies) {
      const line = new Chess(game.fen())

      line.move(reply.san)

      expect(line.moves({ verbose: true }).some((move) => move.captured === 'q')).toBe(true)
    }
  })

  it('pins the knight standing in front of the queen, so moving it loses her', () => {
    const key = '04-essential-tactics/02-pin-skewer'
    const { game, to } = playAnswer(key)
    const knight = squareOf(game, 'b', 'n')
    const queen = squareOf(game, 'b', 'q')

    if (knight === undefined || queen === undefined) throw new Error(`${key}: a target is missing`)

    // the geometry the prose names: the bishop's square, the knight's, then the queen's,
    // one diagonal step apart in the same direction — the knight stands in front of her
    const step = (from: string, onto: string): [number, number] => [
      onto.charCodeAt(0) - from.charCodeAt(0),
      Number(onto[1]) - Number(from[1])
    ]

    expect(step(to, knight)).toEqual(step(knight, queen))
    expect(game.get(knight as Square)?.type).toBe('n')
    expect(attacks(game, to, knight)).toBe(true)

    // the pin itself: every move the knight has uncovers the bishop on the queen
    const knightMoves = (
      game.moves({ verbose: true }) as { from: string; to: string; san: string }[]
    ).filter((move) => move.from === knight)

    expect(knightMoves.length).toBeGreaterThan(0)

    for (const move of knightMoves) {
      const line = new Chess(game.fen())

      line.move(move.san)

      expect(line.moves({ verbose: true }).some((taken) => taken.captured === 'q')).toBe(true)
    }
  })

  it('threatens two black pieces that cannot both be saved', () => {
    const key = '04-essential-tactics/04-double-attack'
    const { game, to } = playAnswer(key)
    const king = squareOf(game, 'b', 'k')
    const rook = squareOf(game, 'b', 'r')

    if (king === undefined || rook === undefined) throw new Error(`${key}: a target is missing`)

    // the queen attacks both, and neither target can take her where she stands
    expect(attacks(game, to, king)).toBe(true)
    expect(attacks(game, to, rook)).toBe(true)
    expect(game.attackers(to as Square, 'b')).toEqual([])

    // the two targets do not defend each other
    expect(game.attackers(rook as Square, 'b')).not.toContain(king)
    expect(game.attackers(king as Square, 'b')).not.toContain(rook)

    // whatever black answers the check with, the rook falls to a queen nothing takes
    const replies = game.moves({ verbose: true })
    const unanswered = replies.flatMap((reply) => {
      const line = new Chess(game.fen())

      line.move(reply.san)

      const capture = line.moves({ verbose: true }).find((move) => move.to === rook)

      if (capture === undefined) return [`${reply.san}: the rook is not capturable`]

      line.move(capture.san)

      return line
        .moves({ verbose: true })
        .filter((move) => move.to === rook)
        .map((move) => `${reply.san}: ${move.san} recaptures the rook`)
    })

    expect(replies.length).toBeGreaterThan(0)
    expect(unanswered).toEqual([])
  })

  it('mates a lone king with the queen, and with the rook', () => {
    for (const [key, piece] of [
      ['05-basic-endgames/01-king-queen-vs-king', 'q'],
      ['05-basic-endgames/02-king-rook-vs-king', 'r']
    ] as const) {
      const { game, to } = playAnswer(key)

      expect(game.isCheckmate()).toBe(true)
      expect(to).toBe('e8')

      // the material each title promises: a king and one piece against a lone king
      expect(materialOf(game, 'w')).toEqual(['k', piece])
      expect(materialOf(game, 'b')).toEqual(['k'])
    }
  })

  it('mates the cornered king, and names the one queen move that would have stalemated him', () => {
    const key = '05-basic-endgames/05-stalemate-traps'
    const before = new Chess(positionOf(key))
    const queen = squareOf(before, 'w', 'q')
    const { game } = playAnswer(key)

    if (queen === undefined) throw new Error(`${key}: the white queen is missing`)

    // the answer is mate: the king is checked and has nowhere to go
    expect(game.isCheckmate()).toBe(true)

    // and the trap the chapter warns about is real on this board — the same queen one
    // square away leaves him no move and no check, which is the pat
    const trap = new Chess(before.fen())

    trap.move({ from: queen, to: 'c3' })

    expect(trap.isCheck()).toBe(false)
    expect(trap.isStalemate()).toBe(true)

    // so the warning has exactly one square to point at, and the answer one mate
    const after = (san: string): Chess => {
      const line = new Chess(before.fen())

      line.move(san)

      return line
    }

    const moves = (before.moves({ verbose: true }) as { san: string }[]).map((move) => move.san)

    expect(moves.filter((san) => after(san).isStalemate())).toEqual(['Qc3'])
    expect(moves.filter((san) => after(san).isCheckmate())).toEqual(['Qb2#'])
  })

  it('takes the opposition: the kings face each other with one empty square between', () => {
    const { game, to } = playAnswer('05-basic-endgames/04-opposition')
    const white = squareOf(game, 'w', 'k')
    const black = squareOf(game, 'b', 'k')

    if (white === undefined || black === undefined) throw new Error('a king is missing')

    expect(white).toBe(to)
    expect(white[0]).toBe(black[0])
    expect(Math.abs(Number(white[1]) - Number(black[1]))).toBe(2)

    const between = `${white[0]}${(Number(white[1]) + Number(black[1])) / 2}` as Square

    expect(game.get(between)).toBeUndefined()
  })

  it('opens with a pawn that occupies a central square — and answers every one of them', () => {
    const key = '06-opening-fundamentals/01-center-control'
    const { game, to } = playAnswer(key)
    const centre = ['d4', 'd5', 'e4', 'e5']

    expect(game.get(to as Square)).toMatchObject({ color: 'w', type: 'p' })
    expect(centre).toContain(to)

    // the prompt admits every pawn move onto a central square, so the answer list has
    // to be exactly those: anything else tells a visitor his central pawn is wrong
    const ontoTheCentre = (
      new Chess(positionOf(key)).moves({ verbose: true }) as {
        from: string
        to: string
        piece: string
      }[]
    )
      .filter((move) => move.piece === 'p' && centre.includes(move.to))
      .map((move) => `${move.from}${move.to}`)

    expect(ontoTheCentre.sort()).toEqual([...moveQuestion(key).correctAnswer].sort())
  })

  it('develops a knight that attacks the centre, after 1.e4', () => {
    const key = '06-opening-fundamentals/02-piece-development'
    const position = positionOf(key)
    const before = new Chess(position)
    const { from, to } = playAnswer(key)

    // the position the prose names: Alex has played e4 and it is his move again
    expect(before.turn()).toBe('w')
    expect(before.get('e4' as Square)).toMatchObject({ color: 'w', type: 'p' })
    expect(before.fen()).not.toBe(STARTING_FEN)

    // knights before bishops: it is a knight, and it lands where it hits the centre
    expect(before.get(from as Square)?.type).toBe('n')

    const centralSquaresHit = (move: string): number => {
      const line = new Chess(position)

      line.move({ from: move.slice(0, 2), to: move.slice(2, 4) })

      return ['d4', 'd5', 'e4', 'e5'].filter((square) => attacks(line, move.slice(2, 4), square))
        .length
    }

    expect(centralSquaresHit(`${from}${to}`)).toBeGreaterThanOrEqual(2)

    // and the answer list is exactly what the prompt describes — every knight move that
    // attacks two or more central squares — so the knight on the other wing, which does
    // the same job, is not answered with "wrong"
    const covering = (
      before.moves({ verbose: true }) as { from: string; to: string; piece: string }[]
    )
      .filter((move) => move.piece === 'n')
      .map((move) => `${move.from}${move.to}`)
      .filter((move) => centralSquaresHit(move) >= 2)

    expect(covering.sort()).toEqual([...moveQuestion(key).correctAnswer].sort())
  })

  it('wins the queen with a knight fork the king cannot answer', () => {
    const key = '04-essential-tactics/05-tactical-puzzles'
    const { game, to } = playAnswer(key)
    const king = squareOf(game, 'b', 'k')
    const queen = squareOf(game, 'b', 'q')

    if (king === undefined || queen === undefined) throw new Error(`${key}: a target is missing`)

    // the fork the explanation names: the knight checks the king and attacks the queen
    expect(to).toBe('f6')
    expect(game.isCheck()).toBe(true)
    expect(attacks(game, to, king)).toBe(true)
    expect(attacks(game, to, queen)).toBe(true)

    // the king cannot take it — the e5 pawn defends the square the knight lands on
    const replies = game.moves({ verbose: true })

    expect(replies.length).toBeGreaterThan(0)
    expect(replies.filter((reply) => reply.to === to)).toEqual([])

    // and whatever the king does, the queen falls to the knight, and only the
    // knight is given back — a queen for a knight, which is the material it wins
    for (const reply of replies) {
      const line = new Chess(game.fen())

      line.move(reply.san)

      const capture = line.moves({ verbose: true }).find((move) => move.to === queen)

      expect(capture?.captured).toBe('q')
      expect(capture?.piece).toBe('n')

      if (capture === undefined) continue

      line.move(capture.san)

      const recapture = line.moves({ verbose: true }).find((move) => move.to === queen)

      if (recapture !== undefined) expect(recapture.captured).toBe('n')
    }
  })

  it('draws the mistake the answer names: the queen out early, attacked and undefended', () => {
    const chapter = chapters.find(
      (entry) => entry.key === '06-opening-fundamentals/04-common-mistakes'
    )
    const position = chapter?.chapter.chessPosition

    expect(position).toBeDefined()

    if (position === undefined) throw new Error('the chapter draws no position')
    if (KEYWORDS.includes(position)) throw new Error('the chapter draws the starting position')

    const game = new Chess(position)
    const queen = squareOf(game, 'w', 'q')

    if (queen === undefined) throw new Error('the white queen is missing')

    // the mistake the answer names: she has left her home square, a black piece attacks
    // her, and nothing of hers defends her — the board never says what the text denies
    expect(queen).not.toBe('d1')
    expect(game.attackers(queen as Square, 'b').length).toBeGreaterThan(0)
    expect(game.attackers(queen as Square, 'w')).toEqual([])
  })
})
