/**
 * Shared TypeScript types for the reconstruction system.
 *
 * These types are designed to mirror the future FastAPI response shapes so
 * that swapping the mock service for a real API requires only changing the
 * service layer — not the components or hooks.
 */

// ── App-level state machine ────────────────────────────────────────────────

/**
 * Top-level application state.
 *
 * State transitions:
 *   LANDING → UPLOAD → PROCESSING → MODEL_READY
 */
export type AppState = 'LANDING' | 'UPLOAD' | 'PROCESSING' | 'MODEL_READY'

// ── Reconstruction job ─────────────────────────────────────────────────────

/**
 * Mirrors the future backend job status values.
 *
 * Future FastAPI response:
 *   { job_id, status, progress, model_url? }
 */
export type JobStatus =
  | 'idle'
  | 'queued'
  | 'uploading'
  | 'processing'
  | 'reconstructing'
  | 'generating'
  | 'completed'
  | 'failed'

/**
 * Represents the state of a reconstruction job.
 *
 * In the mock service, this is populated locally.
 * In the future API service, this maps to:
 *   GET /api/reconstructions/{job_id}
 */
export interface ReconstructionJob {
  jobId: string
  status: JobStatus
  progress: number     // 0–100
  modelUrl?: string    // Present when status === 'completed'
  error?: string       // Present when status === 'failed'
}

// ── Processing step (UI display) ──────────────────────────────────────────

/** A single labeled step in the reconstruction pipeline UI. */
export interface ProcessingStep {
  id: string
  label: string
  /** Which job statuses cause this step to be "active" */
  activeStatuses: JobStatus[]
  /** Which job statuses cause this step to be "done" */
  doneStatuses: JobStatus[]
}

// ── File inputs ────────────────────────────────────────────────────────────

/** Files selected by the user before reconstruction starts. */
export interface UploadedFiles {
  video: File | null
  gpsCSV: File | null
}

// ── GPS CSV row (for future use / validation) ──────────────────────────────

/**
 * Shape of one row in the GPS CSV.
 * The frontend does NOT process GPS data — this type exists as documentation
 * of the expected schema and for future validation needs.
 *
 * CSV columns:
 *   frame_index, video_time_s, timestamp, drone_lat, drone_lon, drone_altitude_m
 */
export interface GpsCsvRow {
  frame_index: number
  video_time_s: number
  timestamp: string
  drone_lat: number
  drone_lon: number
  drone_altitude_m: number
}

// ── Future: geographic positioning ────────────────────────────────────────

/**
 * Geographic anchor for the reconstructed model.
 *
 * NOT implemented in the current prototype.
 * Future: parsed from metadata.json returned by the ML pipeline.
 * Used to position the GLB model at its real-world coordinates in Cesium.
 */
export interface ModelGeoAnchor {
  latitude: number
  longitude: number
  altitudeMeters: number
  headingDegrees?: number
}
