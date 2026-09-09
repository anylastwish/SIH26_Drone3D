import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { AppPage } from './pages/AppPage'

/**
 * App — Root router
 *
 * Routes:
 *   /      → Landing page (minimal entry point)
 *   /app   → Main application (Cesium viewer + upload flow)
 *   *      → Redirect to /
 *
 * Future routes:
 *   /about → About page (currently not built)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"    element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
        {/* Catch-all: redirect unknown paths to landing */}
        <Route path="*"    element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
