import { useEffect, useRef } from 'react'
import { drawFrame } from '../lib/draw'
import type { GameState } from '../types'

type SnakeCanvasProps = {
  state: GameState
  blockSize: number
}

export const SnakeCanvas = ({ state, blockSize }: SnakeCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    const ctx = canvas.getContext('2d')
    if (ctx === null) return

    drawFrame(ctx, state, blockSize)
  }, [state, blockSize])

  const width = state.gridSize.width * blockSize
  const height = state.gridSize.height * blockSize

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className='block h-auto w-full touch-none rounded border-2 border-neutral-700'
      style={{ aspectRatio: `${state.gridSize.width} / ${state.gridSize.height}` }}
    />
  )
}
