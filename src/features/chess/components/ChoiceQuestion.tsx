import { useCallback, useEffect, useState } from 'react'
import { stepChoice } from '../lib/choices'
import type { ChessQuestion } from '../lib/stories'
import { Button } from './Button'

/**
 * The controls that own Enter (or an arrow) themselves. The question listener is on
 * `window`, so without this guard it would `preventDefault()` the activation a
 * button, link or field is entitled to and cancel it.
 */
const INTERACTIVE_TARGETS = 'button, a[href], input, select, textarea, [contenteditable]'

type ChoiceQuestionProps = {
  question: ChessQuestion
  /** Called once, with whether the visitor found the answer. */
  onAnswer: (correct: boolean) => void
}

/**
 * A multiple-choice question, as the original's live path rendered it
 * (`QuestionComponent.tsx:48-139`): a card of choices, immediate feedback on the one
 * picked, the explanation once it is right, and a retry while it is not. The arrow
 * keys and Enter reach the same choices — the keyboard the original had written in
 * the component beside this one (`MultipleChoice.tsx:60-78`) but never wired to the
 * question it actually showed.
 *
 * A choice is not one of the era's buttons: the original declared its own plate and
 * padding for each one, so the port writes them on the element rather than over a
 * base whose padding would have won.
 */
export const ChoiceQuestion = ({ question, onAnswer }: ChoiceQuestionProps) => {
  const options = question.options ?? []
  const [picked, setPicked] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  const choose = useCallback(
    (option: string) => {
      if (solved) return

      setPicked(option)

      if (question.correctAnswer.includes(option)) {
        setSolved(true)
        onAnswer(true)
      }
    },
    [question.correctAnswer, solved, onAnswer]
  )

  // The one resource this feature opens: while the question stands, the arrow keys
  // and Enter reach it from anywhere on the page that is not already a control.
  // Leaving the screen — or answering — removes the listener again.
  const count = options.length

  useEffect(() => {
    if (solved || count === 0) return

    const onKeyDown = (event: KeyboardEvent): void => {
      // A control under the key keeps it: Enter on a focused `Réessayer` or a
      // navigation link must activate that control, not pick a choice for it.
      const target = event.target

      if (target instanceof Element && target.closest(INTERACTIVE_TARGETS) !== null) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHighlighted((current) => stepChoice(current, 1, count))
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setHighlighted((current) => stepChoice(current, -1, count))
        return
      }

      if (event.key !== 'Enter') return

      const option = options[highlighted]

      if (option === undefined) return

      event.preventDefault()
      choose(option)
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [choose, count, highlighted, options, solved])

  const correct = picked !== null && question.correctAnswer.includes(picked)

  const optionClass = (option: string, index: number): string => {
    const base = 'w-full cursor-pointer rounded-lg border p-4 text-left text-base transition-colors'

    if (picked === null) {
      const mark =
        index === highlighted ? ' ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-800' : ''

      return `${base} border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-700${mark}`
    }

    if (question.correctAnswer.includes(option)) {
      return `${base} border-emerald-700 bg-emerald-900 text-zinc-100`
    }

    return option === picked
      ? `${base} border-zinc-700 bg-zinc-800 text-zinc-400`
      : `${base} border-zinc-700 bg-zinc-800 text-zinc-300`
  }

  return (
    <div className='rounded-lg border border-zinc-700 bg-zinc-800 p-8'>
      <h3 className='mb-6 text-xl font-medium text-zinc-100'>{question.prompt}</h3>

      <div className='space-y-3'>
        {options.map((option, index) => (
          <button
            key={option}
            type='button'
            onClick={() => choose(option)}
            disabled={solved}
            className={`${optionClass(option, index)}${solved ? ' cursor-not-allowed' : ''}`}
          >
            {option}
          </button>
        ))}
      </div>

      {picked !== null && (
        <div className='mt-6 rounded-lg border border-zinc-700 bg-zinc-800 p-5'>
          <div className='mb-3 flex items-center justify-between'>
            <span
              className={`text-base font-medium ${correct ? 'text-emerald-300' : 'text-zinc-300'}`}
            >
              {correct ? '✓ Correct' : '✗ Incorrect'}
            </span>
            {!solved && (
              // The original asked for a smaller retry — `px-5 py-2 text-sm` — but
              // wrote it beside a base that also carried padding, and the stylesheet's
              // own order gave the base the last word. The port writes the size that
              // took effect.
              <Button
                onClick={() => {
                  setPicked(null)
                  setHighlighted(0)
                }}
                variant='secondary'
              >
                Réessayer
              </Button>
            )}
          </div>
          {correct && (
            <p className='mt-2 text-base leading-relaxed text-zinc-300'>{question.explanation}</p>
          )}
        </div>
      )}
    </div>
  )
}
