/**
 * LandingPage — Minimal entry point
 *
 * A dark, intentionally sparse screen with one centered action.
 * No marketing content — this will be designed properly later.
 */

import { useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.root} aria-label="Landing page">
      {/* Subtle background grid */}
      <div className={styles.grid} aria-hidden="true" />

      {/* Ambient glow */}
      <div className={styles.glow} aria-hidden="true" />

      {/* Center content */}
      <div className={styles.center}>
        <div className={styles.brandMark} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button
          id="enter-app-btn"
          className={styles.enterBtn}
          onClick={() => navigate('/app')}
          aria-label="Enter the 3D reconstruction application"
        >
          Enter Application
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
