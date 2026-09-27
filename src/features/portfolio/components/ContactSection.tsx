import { type ChangeEvent, useState } from 'react'
import contactBackground from '../assets/sectionContactBackground.jpg'

/** The original's four fields, verbatim (`20210406-portfolio/src/index.html:403-447`). */
const FIELDS = [
  { name: 'contactName', label: 'Votre nom', type: 'text' },
  { name: 'contactEmail', label: 'Votre email', type: 'email' },
  { name: 'contactSubject', label: 'Sujet', type: 'text' },
  { name: 'contactMessage', label: 'Votre message', type: 'textarea' }
] as const

type FieldName = (typeof FIELDS)[number]['name']

/** Only the fields the visitor has touched hold a value. */
type FieldValues = Partial<Record<FieldName, string>>

const FIELD_CLASS =
  'relative block w-full bg-transparent p-0 text-base leading-normal text-neutral-50 outline-none'

/**
 * `#contact` — the original's form, layout included, and nothing behind it.
 *
 * The original's 2021 rewrite only animated this form: its `contactForm.js`
 * toggles `is-focused` and `has-label` classes and registers no submit handler,
 * so nothing was ever delivered (`_contact.scss`). The port keeps exactly that,
 * and says so under the button rather than leaving a visitor to guess whether a
 * message left.
 */
export const ContactSection = () => {
  const [values, setValues] = useState<FieldValues>({})
  const [focused, setFocused] = useState<FieldName | null>(null)

  return (
    <section
      id='contact'
      className='flex scroll-mt-16 bg-cover bg-center bg-fixed bg-no-repeat md:scroll-mt-20'
      style={{ backgroundImage: `url(${contactBackground})` }}
    >
      <article className='mx-auto my-12 w-full max-w-[90%] bg-neutral-800/80 p-[2em_1em] md:max-w-[80%] lg:max-w-[60%]'>
        <h2 className='px-8 leading-normal text-2xl font-bold text-orange-500'>Contactez-moi</h2>

        <form onSubmit={(event) => event.preventDefault()}>
          {FIELDS.map((field) => {
            const value = values[field.name] ?? ''
            const multiline = field.type === 'textarea'
            const focusedHere = focused === field.name
            const floated = focusedHere || value !== ''
            const expanded = multiline && floated

            const fieldProps = {
              id: field.name,
              name: field.name,
              value,
              onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setValues((current) => ({ ...current, [field.name]: event.target.value })),
              onFocus: () => setFocused(field.name),
              onBlur: () => setFocused(null)
            }

            return (
              <div
                key={field.name}
                className={`relative pt-[1em] pb-[0.5em] transition-[height] duration-300 ${expanded ? 'h-50' : 'h-18'}`}
              >
                <label
                  htmlFor={field.name}
                  className={`relative block origin-left text-base leading-none transition-transform duration-300 ${floated ? 'translate-y-0 scale-75' : 'translate-y-6'} ${focusedHere ? 'text-orange-400' : 'text-neutral-300'}`}
                >
                  {field.label}
                </label>

                {multiline ? (
                  <textarea
                    {...fieldProps}
                    className={`${FIELD_CLASS} ${expanded ? 'h-39.5 overflow-auto' : 'h-8 resize-none overflow-hidden'}`}
                  />
                ) : (
                  <input {...fieldProps} type={field.type} className={`${FIELD_CLASS} h-8`} />
                )}

                <span
                  aria-hidden='true'
                  className='absolute bottom-1.5 left-0 block h-0.5 w-full bg-neutral-50'
                />
                <span
                  aria-hidden='true'
                  className={`absolute bottom-1.5 left-0 block h-0.5 w-full origin-left bg-orange-400 transition-transform duration-300 ${focusedHere ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </div>
            )
          })}

          <div className='mx-auto my-[4em] flex w-full items-center justify-center'>
            <button
              type='submit'
              value='send'
              title='Envoyez un message à Guillaume LANG'
              className='mx-auto block w-auto min-w-[10%] cursor-pointer border-2 border-orange-500 bg-transparent px-7.5 py-5 text-base font-bold tracking-[2px] text-neutral-50 uppercase transition-[background-color,border-color,color,min-width] duration-200 hover:min-w-full hover:border-orange-400 hover:text-orange-400'
            >
              Envoyer
            </button>
          </div>
        </form>

        <p className='mx-auto max-w-[80%] text-center text-base text-neutral-300'>
          Reconstitution du portfolio de 2021 : ce formulaire n'envoie rien et n'ouvre aucune boîte
          de réception.
        </p>
      </article>
    </section>
  )
}
