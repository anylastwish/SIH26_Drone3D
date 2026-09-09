/**
 * ProcessingPanel — Reconstruction progress display
 *
 * PROCESSING state panel. Shows:
 *   - Stage-by-stage pipeline steps (pending / active / done)
 *   - Animated progress bar
 *   - Current percentage
 *   - Error state if processing fails
 */

import type { ReconstructionJob, ProcessingStep } from '../types/reconstruction'
import { FloatingPanel } from './FloatingPanel'
import styles from './ProcessingPanel.module.css'

/** Ordered pipeline steps with their corresponding job status mappings */
const PIPELINE_STEPS: ProcessingStep[] = [
  {
    id:              'uploading',
    label:           'Uploading Files',
    activeStatuses:  ['queued', 'uploading'],
    doneStatuses:    ['processing', 'reconstructing', 'generating', 'completed'],
  },
  {
    id:              'processing',
    label:           'Processing Video',
    activeStatuses:  ['processing'],
    doneStatuses:    ['reconstructing', 'generating', 'completed'],
  },
  {
    id:              'reconstructing',
    label:           'Reconstructing Scene',
    activeStatuses:  ['reconstructing'],
    doneStatuses:    ['generating', 'completed'],
  },
  {
    id:              'generating',
    label:           'Generating 3D Model',
    activeStatuses:  ['generating'],
    doneStatuses:    ['completed'],
  },
]

type StepState = 'pending' | 'active' | 'done'

function getStepState(step: ProcessingStep, job: ReconstructionJob): StepState {
  if (step.doneStatuses.includes(job.status)) return 'done'
  if (step.activeStatuses.includes(job.status)) return 'active'
  return 'pending'
}

function statusLabel(job: ReconstructionJob): string {
  switch (job.status) {
    case 'queued':        return 'Queued…'
    case 'uploading':     return 'Uploading your files…'
    case 'processing':    return 'Analyzing video frames…'
    case 'reconstructing':return 'Reconstructing scene geometry…'
    case 'generating':    return 'Generating 3D model…'
    case 'completed':     return 'Reconstruction complete'
    case 'failed':        return 'Reconstruction failed'
    default:              return 'Processing…'
  }
}

interface ProcessingPanelProps {
  job: ReconstructionJob
}

export function ProcessingPanel({ job }: ProcessingPanelProps) {
  const isFailed = job.status === 'failed'
  const isComplete = job.status === 'completed'

  return (
    <FloatingPanel>
      {/* Header */}
      <div className={styles.header}>
        <div className={`${styles.headerIcon} ${isFailed ? styles.headerIconError : ''} ${isComplete ? styles.headerIconDone : ''}`}>
          {isFailed ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : isComplete ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.spinIcon}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
        <div>
          <h2 className={styles.title}>
            {isFailed ? 'Processing Failed' : isComplete ? 'Model Ready' : 'Reconstructing'}
          </h2>
          <p className={styles.statusText}>{statusLabel(job)}</p>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Step list */}
      <div className={styles.stepList} role="list" aria-label="Reconstruction progress steps">
        {PIPELINE_STEPS.map((step) => {
          const state = getStepState(step, job)
          return (
            <div
              key={step.id}
              className={`${styles.step} ${styles[`step_${state}`]}`}
              role="listitem"
              aria-label={`${step.label}: ${state}`}
            >
              <div className={styles.stepIndicator}>
                {state === 'done' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : state === 'active' ? (
                  <div className={styles.activePulse} aria-hidden="true" />
                ) : (
                  <div className={styles.pendingDot} aria-hidden="true" />
                )}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      {!isFailed && (
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Progress</span>
            <span className={styles.progressValue}>{job.progress}%</span>
          </div>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={job.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Reconstruction progress"
          >
            <div
              className={styles.progressFill}
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error detail */}
      {isFailed && job.error && (
        <div className={styles.errorBox} role="alert">
          <p className={styles.errorText}>{job.error}</p>
        </div>
      )}
    </FloatingPanel>
  )
}
