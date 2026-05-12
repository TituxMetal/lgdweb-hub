import { type ReactNode, Suspense } from 'react'

type LayoutProps = {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => (
  <div className='min-h-full flex flex-col'>
    <header className='border-b border-zinc-700 py-8'>
      <div className='mx-auto max-w-3xl px-6'>
        <h1 className='font-medium text-zinc-100'>lgdweb</h1>
        <p className='mt-1 text-sm text-zinc-400'>Vitrine de projets</p>
      </div>
    </header>

    <main className='flex-1 py-12'>
      <div className='mx-auto max-w-3xl px-6'>
        <Suspense fallback={<p className='text-zinc-400'>Chargement…</p>}>{children}</Suspense>
      </div>
    </main>

    <footer className='border-t border-zinc-700 py-6'>
      <div className='mx-auto max-w-3xl px-6 text-sm text-zinc-400'>
        <p>lgdweb.fr</p>
      </div>
    </footer>
  </div>
)
