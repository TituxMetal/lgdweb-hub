import { resolvePosition } from '../lib/moves'
import type { ChessQuestion } from '../lib/stories'
import { ChoiceQuestion } from './ChoiceQuestion'
import { MoveQuestion } from './MoveQuestion'

type QuestionProps = {
  question: ChessQuestion
  /** The chapter's own position, for a question that names none of its own. */
  fallbackPosition?: string
  onAnswer: (correct: boolean) => void
}

/** The question a chapter asks, in the shape its type calls for. */
export const Question = ({ question, fallbackPosition, onAnswer }: QuestionProps) => {
  if (question.type === 'move-based') {
    return (
      <MoveQuestion
        question={question}
        position={resolvePosition(question.initialPosition ?? fallbackPosition)}
        onAnswer={onAnswer}
      />
    )
  }

  return <ChoiceQuestion question={question} onAnswer={onAnswer} />
}
