export type Direction = 'up' | 'down' | 'left' | 'right'

export type Cell = readonly [number, number]

export type GridSize = {
  width: number
  height: number
}

export type Snake = {
  direction: Direction
  body: ReadonlyArray<Cell>
  ateApple: boolean
}

export type Apple = {
  position: Cell
}

export type GameStatus = 'idle' | 'running' | 'over'

export type GameState = {
  status: GameStatus
  score: number
  snake: Snake
  apple: Apple
  gridSize: GridSize
  delay: number
}
