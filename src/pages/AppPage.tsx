/**
 * AppPage — Main application page
 *
 * Manages the core state machine:
 *   UPLOAD → PROCESSING → MODEL_READY
 *
 * The CesiumViewer always occupies the full viewport (z-index 0).
 * The floating panel overlays it at z-index 10.
 */

import { useState, useEffect } from 'react'
import { CesiumViewer } from '../components/CesiumViewer'
import { UploadPanel } from '../components/UploadPanel'
import { ProcessingPanel } from '../components/ProcessingPanel'
import { useReconstruction } from '../hooks/useReconstruction'
import type { AppState, UploadedFiles } from '../types/reconstruction'
import styles from './AppPage.module.css'

export function AppPage() {
  const [appState, setAppState] = useState<AppState>('UPLOAD')
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
  const { job, start, reset } = useReconstruction()

  // ── State transitions driven by job status ─────────────────
  useEffect(() => {
    if (!job) return

    if (job.status === 'completed' && job.modelUrl) {
      // Small delay so the user sees "100% complete" before panel disappears
      const timeout = setTimeout(() => {
        setAppState('MODEL_READY')
        setIsPanelOpen(false)
      }, 800)
      return () => clearTimeout(timeout)
    }

    if (
      job.status === 'queued'        ||
      job.status === 'uploading'     ||
      job.status === 'processing'    ||
      job.status === 'reconstructing'||
      job.status === 'generating'
    ) {
      setAppState('PROCESSING')
      setIsPanelOpen(true)
    }
  }, [job])

  // ── Handlers ───────────────────────────────────────────────
  const handleGenerate = async (files: UploadedFiles) => {
    if (!files.video || !files.gpsCSV) return
    setAppState('PROCESSING')
    setIsPanelOpen(true)
    await start(files.video, files.gpsCSV)
  }

  const handleReset = () => {
    reset()
    setAppState('UPLOAD')
    setIsPanelOpen(true)
  }

  // Determine the model URL to pass to the viewer
  const modelUrl =
    appState === 'MODEL_READY' && job?.modelUrl ? job.modelUrl : null

  return (
    <div className={styles.root}>
      {/* Full-screen Cesium viewer — always rendered */}
      <CesiumViewer modelUrl={modelUrl} />

      {/* Top bar control: Open Upload Panel button when panel is closed */}
      {!isPanelOpen && appState === 'UPLOAD' && (
        <div className={styles.topControlOverlay}>
          <button
            className={styles.openPanelBtn}
            onClick={() => setIsPanelOpen(true)}
            id="open-upload-btn"
            aria-label="Open 3D Reconstruction panel"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            3D Reconstruction
          </button>
        </div>
      )}

      {/* Floating overlay panel — shown only when opened or processing */}
      {isPanelOpen && appState !== 'MODEL_READY' && (
        <div className={styles.panelOverlay}>
          {appState === 'UPLOAD' && (
            <UploadPanel
              onGenerate={handleGenerate}
              onClose={() => setIsPanelOpen(false)}
            />
          )}

          {appState === 'PROCESSING' && job && (
            <ProcessingPanel job={job} />
          )}

          {/* Fallback: job in error state */}
          {appState === 'PROCESSING' && job?.status === 'failed' && (
            <div className={styles.errorRecovery}>
              <button className={styles.retryBtn} onClick={handleReset} id="retry-btn">
                ← Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODEL_READY: minimal overlay with a "New Reconstruction" button */}
      {appState === 'MODEL_READY' && (
        <div className={styles.modelReadyOverlay}>
          <button
            className={styles.newReconstructionBtn}
            onClick={handleReset}
            id="new-reconstruction-btn"
            aria-label="Start a new reconstruction"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Reconstruction
          </button>
        </div>
      )}
    </div>
  )
}
