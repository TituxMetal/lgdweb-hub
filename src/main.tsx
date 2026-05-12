import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-sans/400.css'
import '@fontsource/geist-sans/500.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '~/App'
import '~/styles/globals.css'

const root = document.getElementById('root')

if (root === null) throw new Error('Missing #root element')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
