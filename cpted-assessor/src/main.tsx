import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import './styles/globals.css'
import App from './App.tsx'
import { backfillRevisions } from './services/touch'

// Give pre-existing assessments a starting revision. Fire-and-forget at module
// scope rather than in an effect, because StrictMode double-invokes effects;
// idempotent, so the double would be harmless anyway. A failure here must never
// stop the app opening — every reader defaults a missing revision to 1, and
// this retries on the next launch.
backfillRevisions().catch((err) => console.warn('Revision backfill skipped:', err))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
