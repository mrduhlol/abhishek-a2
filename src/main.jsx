import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ExpeditionApp from './pixel/PixelApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ExpeditionApp />
  </StrictMode>,
)
