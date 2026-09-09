/**
 * Reconstruction Service — Abstraction Layer
 *
 * This module defines the service interface and provides a MOCK implementation.
 *
 * Architecture intent:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Frontend (hooks/components)                                │
 * │       ↓                                                     │
 * │  reconstructionService (this file)                         │
 * │       ↓                                                     │
 * │  [CURRENT]  MockReconstructionService                       │
 * │  [FUTURE]   ApiReconstructionService → FastAPI backend      │
 * └─────────────────────────────────────────────────────────────┘
 *
 * To swap mock → real API:
 *   1. Implement ApiReconstructionService below
 *   2. Change the export at the bottom of this file
 *   3. No other files need to change
 */

import type { ReconstructionJob, JobStatus } from '../types/reconstruction'

// ── Service interface ──────────────────────────────────────────────────────

/**
 * Contract for the reconstruction service.
 *
 * Future FastAPI API:
 *   startReconstruction → POST /api/reconstructions   → { job_id, status }
 *   getJobStatus        → GET  /api/reconstructions/{job_id} → ReconstructionJob
 */
export interface IReconstructionService {
  /**
   * Upload files and start a reconstruction job.
   * Returns a job ID immediately; processing happens asynchronously.
   */
  startReconstruction(video: File, gpsCSV: File): Promise<{ jobId: string }>

  /**
   * Poll the current status of a reconstruction job.
   */
  getJobStatus(jobId: string): Promise<ReconstructionJob>
}

// ── Mock implementation ────────────────────────────────────────────────────

/**
 * Simulates the reconstruction pipeline without a real backend.
 * Progress advances through realistic stages with timed delays.
 *
 * On completion, resolves with the sample model URL from public/models/.
 */
class MockReconstructionService implements IReconstructionService {
  /** Internal store of in-progress mock jobs */
  private jobs: Map<string, ReconstructionJob> = new Map()

  async startReconstruction(_video: File, _gpsCSV: File): Promise<{ jobId: string }> {
    const jobId = `mock-${Date.now()}`

    const job: ReconstructionJob = {
      jobId,
      status: 'queued',
      progress: 0,
    }

    this.jobs.set(jobId, job)

    // Kick off the mock pipeline asynchronously
    this.runMockPipeline(jobId)

    return { jobId }
  }

  async getJobStatus(jobId: string): Promise<ReconstructionJob> {
    const job = this.jobs.get(jobId)
    if (!job) {
      return {
        jobId,
        status: 'failed',
        progress: 0,
        error: `Unknown job: ${jobId}`,
      }
    }
    return { ...job }
  }

  /**
   * Simulates the ML pipeline stages with timed progress increments.
   *
   * Stage timeline (approximate total ~14 seconds for demo):
   *   0%  → queued
   *   5%  → uploading     (0.5s)
   *   30% → uploading     (2s total upload)
   *   35% → processing    (0.5s transition)
   *   55% → processing    (2s video processing)
   *   60% → reconstructing (0.5s transition)
   *   80% → reconstructing (3s heavy reconstruction)
   *   85% → generating    (0.5s transition)
   *   98% → generating    (2s final model generation)
   *   100% → completed
   */
  private async runMockPipeline(jobId: string): Promise<void> {
    const update = (status: JobStatus, progress: number) => {
      const job = this.jobs.get(jobId)
      if (job) {
        this.jobs.set(jobId, { ...job, status, progress })
      }
    }

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    try {
      // Stage 1: Uploading
      update('uploading', 5)
      await delay(600)
      update('uploading', 15)
      await delay(600)
      update('uploading', 28)
      await delay(600)
      update('uploading', 32)
      await delay(400)

      // Stage 2: Processing video
      update('processing', 36)
      await delay(500)
      update('processing', 45)
      await delay(700)
      update('processing', 54)
      await delay(700)
      update('processing', 58)
      await delay(400)

      // Stage 3: Reconstructing scene (heaviest stage)
      update('reconstructing', 62)
      await delay(800)
      update('reconstructing', 68)
      await delay(900)
      update('reconstructing', 74)
      await delay(900)
      update('reconstructing', 80)
      await delay(800)
      update('reconstructing', 83)
      await delay(500)

      // Stage 4: Generating 3D model
      update('generating', 87)
      await delay(600)
      update('generating', 92)
      await delay(700)
      update('generating', 97)
      await delay(600)
      update('generating', 99)
      await delay(400)

      // Complete
      const job = this.jobs.get(jobId)
      if (job) {
        this.jobs.set(jobId, {
          ...job,
          status: 'completed',
          progress: 100,
          // Path to the sample model in public/models/
          // FUTURE: replaced by the URL returned by the FastAPI backend
          // e.g., `${API_BASE_URL}/api/reconstructions/${jobId}/model`
          modelUrl: '/models/sample-model.glb',
        })
      }
    } catch {
      const job = this.jobs.get(jobId)
      if (job) {
        this.jobs.set(jobId, {
          ...job,
          status: 'failed',
          error: 'Mock pipeline encountered an unexpected error.',
        })
      }
    }
  }
}

// ── Export active service ──────────────────────────────────────────────────

/**
 * The active reconstruction service instance.
 *
 * To switch to the real API:
 *   export const reconstructionService: IReconstructionService =
 *     new ApiReconstructionService(import.meta.env.VITE_API_BASE_URL)
 */
export const reconstructionService: IReconstructionService =
  new MockReconstructionService()
