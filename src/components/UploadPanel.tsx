/**
 * UploadPanel — File selection and Generate action
 *
 * UPLOAD state panel. Contains:
 *   - Drone video file input
 *   - GPS CSV file input
 *   - Validation state
 *   - Generate 3D Model button (disabled until both files selected)
 */

import { useRef, useState } from 'react'
import type { UploadedFiles } from '../types/reconstruction'
import { FloatingPanel } from './FloatingPanel'
import styles from './UploadPanel.module.css'

// Accepted MIME types for basic validation
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg']
const ACCEPTED_CSV_TYPES   = ['text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel']

interface UploadPanelProps {
  onGenerate: (files: UploadedFiles) => void
}

function validateVideoFile(file: File): string | null {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type) && !file.name.match(/\.(mp4|mov|avi|webm|mpeg|mpg)$/i)) {
    return 'Please select a valid video file (MP4, MOV, AVI, WEBM).'
  }
  return null
}

function validateCsvFile(file: File): string | null {
  if (!ACCEPTED_CSV_TYPES.includes(file.type) && !file.name.match(/\.csv$/i)) {
    return 'Please select a valid CSV file.'
  }
  return null
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadPanel({ onGenerate }: UploadPanelProps) {
  const [video, setVideo]       = useState<File | null>(null)
  const [gpsCSV, setGpsCSV]     = useState<File | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [csvError, setCsvError]     = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef   = useRef<HTMLInputElement>(null)

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setVideoError(null)
    setSubmitError(null)
    if (file) {
      const err = validateVideoFile(file)
      if (err) { setVideoError(err); return }
    }
    setVideo(file)
  }

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setCsvError(null)
    setSubmitError(null)
    if (file) {
      const err = validateCsvFile(file)
      if (err) { setCsvError(err); return }
    }
    setGpsCSV(file)
  }

  const handleGenerate = () => {
    if (!video || !gpsCSV) {
      setSubmitError('Please upload both a drone video and a GPS CSV file.')
      return
    }
    setSubmitError(null)
    onGenerate({ video, gpsCSV })
  }

  const canGenerate = video !== null && gpsCSV !== null

  return (
    <FloatingPanel>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className={styles.title}>3D Reconstruction</h1>
          <p className={styles.subtitle}>Drone Video · GPS Data</p>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Video upload */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="video-upload">
          <span className={styles.labelIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M10 8l6 4-6 4V8z" fill="currentColor"/>
            </svg>
          </span>
          Drone Video
        </label>

        <div
          className={`${styles.dropZone} ${video ? styles.dropZoneSelected : ''} ${videoError ? styles.dropZoneError : ''}`}
          onClick={() => videoInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && videoInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload drone video"
        >
          <input
            id="video-upload"
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className={styles.hiddenInput}
            onChange={handleVideoChange}
            aria-describedby={videoError ? 'video-error' : undefined}
          />
          {video ? (
            <div className={styles.fileInfo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className={styles.fileName}>{video.name}</span>
              <span className={styles.fileSize}>{formatFileSize(video.size)}</span>
            </div>
          ) : (
            <div className={styles.dropZonePlaceholder}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Click to select video</span>
              <span className={styles.hint}>MP4, MOV, AVI, WEBM</span>
            </div>
          )}
        </div>
        {videoError && (
          <p id="video-error" className={styles.errorText} role="alert">{videoError}</p>
        )}
      </div>

      {/* GPS CSV upload */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="csv-upload">
          <span className={styles.labelIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 10H3M21 6H3M21 14H3M21 18H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
          GPS CSV
        </label>

        <div
          className={`${styles.dropZone} ${gpsCSV ? styles.dropZoneSelected : ''} ${csvError ? styles.dropZoneError : ''}`}
          onClick={() => csvInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && csvInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload GPS CSV file"
        >
          <input
            id="csv-upload"
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className={styles.hiddenInput}
            onChange={handleCsvChange}
            aria-describedby={csvError ? 'csv-error' : undefined}
          />
          {gpsCSV ? (
            <div className={styles.fileInfo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className={styles.fileName}>{gpsCSV.name}</span>
              <span className={styles.fileSize}>{formatFileSize(gpsCSV.size)}</span>
            </div>
          ) : (
            <div className={styles.dropZonePlaceholder}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Click to select CSV</span>
              <span className={styles.hint}>frame_index, drone_lat, drone_lon…</span>
            </div>
          )}
        </div>
        {csvError && (
          <p id="csv-error" className={styles.errorText} role="alert">{csvError}</p>
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <p className={styles.submitError} role="alert">{submitError}</p>
      )}

      {/* Generate button */}
      <button
        id="generate-btn"
        className={`${styles.generateBtn} ${canGenerate ? styles.generateBtnActive : ''}`}
        onClick={handleGenerate}
        disabled={!canGenerate}
        aria-label={canGenerate ? 'Generate 3D model from uploaded files' : 'Upload both files to enable'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Generate 3D Model
      </button>
    </FloatingPanel>
  )
}
