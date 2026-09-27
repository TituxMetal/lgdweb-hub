import { type SubmitEvent, useCallback, useEffect, useState } from 'react'
import { BackToList } from '~/components/BackToList'
import {
  formatEndTime,
  formatRemaining,
  IDLE_DISPLAY,
  PRESETS,
  remainingSeconds,
  secondsFromMinutes
} from '../lib/timer'

/**
 * The 2018 pomodoro timer, rewritten: the four preset buttons and the free
 * minutes field in a row across the top, the countdown centred under them, the
 * end time under that — the original's own plate colour and monospace face
 * (`src/scss/_timer.scss`).
 *
 * The original's behaviour is kept whole, including what it did *not* offer:
 * there is no pause and no reset, a new length simply replaces the running
 * countdown, and the display starts on the value its markup carried. The one
 * bound the port adds is the free field's domain — 1 to 120 minutes, a longer
 * entry capped, anything below refused — because the original armed whatever the
 * field held. The countdown also writes the remaining time into the page title and
 * restores the title it found when the visitor leaves, alongside the interval it
 * clears.
 */
export const Pomodoro = () => {
  const [deadline, setDeadline] = useState<number | null>(null)
  const [display, setDisplay] = useState(IDLE_DISPLAY)
  const [minutes, setMinutes] = useState('')

  // The countdown's one writer: the display and the page title move together,
  // as the original moved them (`app.js:34-35`).
  const show = useCallback((seconds: number): void => {
    const text = formatRemaining(seconds)
    setDisplay(text)
    document.title = text
  }, [])

  // The countdown, released with the feature: the interval is cleared on every
  // re-arm and on unmount, so nothing keeps ticking after the visitor leaves.
  useEffect(() => {
    if (deadline === null) return

    const interval = window.setInterval(() => {
      const left = remainingSeconds(deadline, Date.now())

      // Past zero the original stopped without drawing again, so the last
      // second it showed stays on screen.
      if (left < 0) {
        window.clearInterval(interval)
        return
      }

      show(left)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [deadline, show])

  // The feature borrows the page title while it runs; the shell gets it back.
  useEffect(() => {
    const shellTitle = document.title

    return () => {
      document.title = shellTitle
    }
  }, [])

  const start = (seconds: number): void => {
    show(seconds)
    setDeadline(Date.now() + seconds * 1000)
  }

  const onSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const seconds = secondsFromMinutes(minutes)

    // Nothing is armed for an entry the field has no duration for: no display
    // change and no title write.
    if (seconds === null) return

    start(seconds)
    setMinutes('')
  }

  return (
    <section className='space-y-4'>
      <BackToList />

      <div className='flex min-h-144 flex-col bg-purple-800 font-mono text-red-300 [&>nav>*]:flex-1'>
        <nav className='flex max-w-full'>
          {PRESETS.map((preset) => (
            <button
              key={preset.seconds}
              type='button'
              onClick={() => start(preset.seconds)}
              className='cursor-pointer border-r-3 border-b-3 border-neutral-950/20 bg-neutral-950/10 px-2 py-4 text-base font-bold text-orange-300 uppercase hover:bg-neutral-950/20 focus-visible:bg-neutral-950/20 focus-visible:outline-none'
            >
              {preset.label}
            </button>
          ))}

          <form onSubmit={onSubmit} className='flex bg-neutral-950/10'>
            <input
              type='text'
              inputMode='numeric'
              name='minutes'
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
              placeholder='Minutes'
              aria-label='Durée en minutes'
              className='min-w-0 max-w-20 flex-1 bg-transparent px-2 py-4 text-base font-bold text-orange-300 outline-none placeholder:text-orange-300'
            />
          </form>
        </nav>

        <section className='flex flex-1 flex-col items-center justify-center'>
          <h1 className='m-0 text-[77px] font-bold text-red-300 text-shadow-[4px_4px_0] text-shadow-neutral-950/5'>
            {display}
          </h1>
          <p className='text-[19px] font-normal text-red-300'>
            {deadline === null ? '' : formatEndTime(deadline)}
          </p>
        </section>
      </div>
    </section>
  )
}
