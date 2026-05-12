import { Link } from '~/lib/router'

type BackToListProps = {
  fullReload?: boolean
}

export const BackToList = ({ fullReload = false }: BackToListProps) => {
  if (fullReload) {
    return (
      <a href='/' className='text-amber-400 hover:underline'>
        ← Retour
      </a>
    )
  }

  return (
    <Link to='/' className='text-amber-400 hover:underline'>
      ← Retour
    </Link>
  )
}
