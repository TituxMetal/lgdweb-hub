import { BackToList } from '~/components/BackToList'
import { Link } from '~/lib/router'
import { CHESS_BRANCH } from '../lib/routes'

/**
 * A path under the feature's branch that answers for no screen of it — the original
 * had no catch-all of its own and showed an empty page for one. The shell's own
 * not-found page is shaped the same way.
 */
export const ChessNotFound = () => (
  <>
    <BackToList />
    <section className='space-y-4'>
      <h2 className='font-medium text-zinc-100'>Page introuvable</h2>
      <p className='text-zinc-400'>Cette adresse ne mène à aucune page du jeu d’échecs.</p>
      <Link to={CHESS_BRANCH} className='text-amber-400 hover:underline'>
        ← Revenir à l’entrée du jeu d’échecs
      </Link>
    </section>
  </>
)
