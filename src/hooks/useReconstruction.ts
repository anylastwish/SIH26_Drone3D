/**
 * useReconstruction — React hook for managing reconstruction job state
 *
 * Encapsulates all interaction with the reconstructionService so that
 * components remain decoupled from the service layer.
 *
 * Usage:
 *   const { job, start, reset } = useReconstruction()
 *
 * When the real API is connected, only reconstructionService.ts changes.
 * This hook and all components that consume it remain unchanged.
 */

import { useState, useRef, useCallback } from 'react'
import { reconstructionService } from '../services/reconstructionService'
import type { ReconstructionJob } from '../types/reconstruction'

const POLL_INTERVAL_MS = 300

interface UseReconstructionReturn {
  /** Current job state; null when no job is active */
  job: ReconstructionJob | null
  /** Start a new reconstruction job */
  start: (video: File, gpsCSV: File) => Promise<void>
  /** Reset job state (e.g., to allow a new upload) */
  reset: () => void
}

export function useReconstruction(): UseReconstructionReturn {
  const [job, setJob] = useState<ReconstructionJob | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const start = useCallback(
    async (video: File, gpsCSV: File) => {
      stopPolling()

      // Set initial queued state immediately for fast UI response
      setJob({ jobId: '', status: 'queued', progress: 0 })

      try {
        const { jobId } = await reconstructionService.startReconstruction(video, gpsCSV)

        // Begin polling for status updates
        pollRef.current = setInterval(async () => {
          try {
            const updated = await reconstructionService.getJobStatus(jobId)
            setJob(updated)

            if (updated.status === 'completed' || updated.status === 'failed') {
              stopPolling()
            }
          } catch {
            // Polling errors are non-fatal; continue until timeout or done
          }
        }, POLL_INTERVAL_MS)
      } catch {
        setJob(prev => ({
          ...(prev ?? { jobId: 'error', progress: 0 }),
          status: 'failed',
          error: 'Failed to start reconstruction. Please try again.',
        }))
      }
    },
    [stopPolling],
  )

  const reset = useCallback(() => {
    stopPolling()
    setJob(null)
  }, [stopPolling])

  return { job, start, reset }
}
