import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from 'react'
import { CELL_SIZE, type Cursor, paintGrid } from '../lib/canvas'
import { isAlive } from '../lib/grid'
import { CellState, type Grid, type GridSize } from '../types'

type GameCanvasProps = {
  grid: Grid
  size: GridSize
  onPaint: (row: number, col: number, state: CellState) => void
}

/** One drag in progress: the pointer that owns it, its last painted cell, and the state to paint. */
type Stroke = {
  pointerId: number
  row: number
  col: number
  state: CellState
}

/** The arrow keys, as the step each of them takes across the board. */
const CURSOR_STEP: Record<string, Cursor> = {
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 }
}

/**
 * The board: the original's grid of bordered cells, drawn on a canvas so a
 * generation costs one repaint rather than six hundred elements, and the surface
 * the visitor draws on — with the pointer, or with the arrow keys and Space.
 * A drag paints every cell it crosses with the state the first one was flipped
 * to, so a stroke neither skips nor flip-flops; a stroke belongs to the pointer
 * that started it, and to the primary button alone.
 */
export const GameCanvas = ({ grid, size, onPaint }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const strokeRef = useRef<Stroke | null>(null)
  const [cursor, setCursor] = useState<Cursor>({
    row: Math.floor(size.rows / 2),
    col: Math.floor(size.cols / 2)
  })
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    const paint = () => {
      const ctx = canvas.getContext('2d')
      if (ctx === null) return

      // The backing store follows the element's rendered size at the screen's own
      // pixel ratio: a fixed 720x480 store would be stretched across a retina
      // display's pixels, softening the one-pixel cell borders. `paintGrid` keeps
      // drawing on the board's own coordinates, and this transform maps them over.
      const width = Math.round(canvas.clientWidth * devicePixelRatio)
      const height = Math.round(canvas.clientHeight * devicePixelRatio)
      if (width === 0 || height === 0) return

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      ctx.setTransform(
        width / (size.cols * CELL_SIZE),
        0,
        0,
        height / (size.rows * CELL_SIZE),
        0,
        0
      )
      paintGrid(ctx, grid, size, focused ? cursor : null)
    }

    paint()

    // The column narrows with the viewport and the board's sharpness with it, so
    // the store follows the element's box rather than being measured once.
    const observer = new ResizeObserver(paint)
    observer.observe(canvas)

    return () => observer.disconnect()
  }, [grid, size, cursor, focused])

  const cellAt = (event: PointerEvent<HTMLCanvasElement>): Cursor | null => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null

    const row = Math.floor(((event.clientY - rect.top) / rect.height) * size.rows)
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * size.cols)

    if (row < 0 || row >= size.rows || col < 0 || col >= size.cols) return null

    return { row, col }
  }

  const startStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    // The primary button of the primary pointer only: a right-click must not flip
    // a cell under the context menu, and a second finger must not take the stroke
    // away from the first.
    if (event.button !== 0 || !event.isPrimary) return
    if (strokeRef.current !== null) return

    const cell = cellAt(event)
    if (cell === null) return

    const state = isAlive(grid, cell.row, cell.col) ? CellState.dead : CellState.alive

    strokeRef.current = { pointerId: event.pointerId, ...cell, state }
    // Capture keeps the stroke alive when the pointer leaves the canvas, and
    // guarantees the matching `pointerup` comes back to it.
    event.currentTarget.setPointerCapture(event.pointerId)
    onPaint(cell.row, cell.col, state)
  }

  const continueStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    const stroke = strokeRef.current
    if (stroke === null) return
    if (event.pointerId !== stroke.pointerId) return

    // A `pointerup` that never arrived leaves the ref armed with no button held;
    // the moves that follow carry `buttons === 0`, so the stroke ends here.
    if ((event.buttons & 1) === 0) {
      strokeRef.current = null
      return
    }

    const cell = cellAt(event)
    if (cell === null) return

    // The browser samples a pointer at most once per frame, so the cursor can
    // cross several cells between two moves. Walk the segment one cell at a time
    // (Bresenham along the dominant axis) and paint each cell, or a fast stroke
    // would leave every crossed cell unpainted.
    let row = stroke.row
    let col = stroke.col
    const rowDistance = Math.abs(cell.row - row)
    const colDistance = Math.abs(cell.col - col)
    const rowStep = Math.sign(cell.row - row)
    const colStep = Math.sign(cell.col - col)
    let error = colDistance - rowDistance

    while (row !== cell.row || col !== cell.col) {
      const doubledError = 2 * error
      if (doubledError > -rowDistance) {
        error -= rowDistance
        col += colStep
      }
      if (doubledError < colDistance) {
        error += colDistance
        row += rowStep
      }

      onPaint(row, col, stroke.state)
    }

    strokeRef.current = {
      pointerId: stroke.pointerId,
      row: cell.row,
      col: cell.col,
      state: stroke.state
    }
  }

  const endStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    // Only the pointer that owns the stroke may end it; another pointer's up must
    // leave the stroke running.
    if (strokeRef.current?.pointerId !== event.pointerId) return

    strokeRef.current = null
  }

  // The canvas owes a keyboard visitor the one gesture the toolbar cannot carry:
  // the arrows walk the cursor across the board and Space flips the cell under it.
  const onKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const step = CURSOR_STEP[event.key]

    if (step !== undefined) {
      event.preventDefault()
      setCursor((current) => ({
        row: Math.min(Math.max(current.row + step.row, 0), size.rows - 1),
        col: Math.min(Math.max(current.col + step.col, 0), size.cols - 1)
      }))
      return
    }

    if (event.key !== ' ' && event.key !== 'Enter') return

    event.preventDefault()
    onPaint(
      cursor.row,
      cursor.col,
      isAlive(grid, cursor.row, cursor.col) ? CellState.dead : CellState.alive
    )
  }

  return (
    <canvas
      ref={canvasRef}
      width={size.cols * CELL_SIZE}
      height={size.rows * CELL_SIZE}
      tabIndex={0}
      aria-label='Grille du jeu de la vie. Cliquez ou glissez pour dessiner ; au clavier, les flèches déplacent le curseur et Espace inverse la cellule.'
      className='block h-auto w-full cursor-crosshair touch-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600'
      style={{ aspectRatio: `${size.cols} / ${size.rows}` }}
      onPointerDown={startStroke}
      onPointerMove={continueStroke}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
      onLostPointerCapture={endStroke}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={onKeyDown}
    />
  )
}
