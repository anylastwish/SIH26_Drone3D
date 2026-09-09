/**
 * FloatingPanel — Shared frosted-glass card wrapper
 *
 * Provides the translucent, blurred floating panel aesthetic used by both
 * UploadPanel and ProcessingPanel. All glass styling lives here.
 */

import type { ReactNode } from 'react'
import styles from './FloatingPanel.module.css'

interface FloatingPanelProps {
  children: ReactNode
  /** Additional CSS class for width/height overrides if needed */
  className?: string
}

export function FloatingPanel({ children, className }: FloatingPanelProps) {
  return (
    <div className={`${styles.panel} ${className ?? ''}`} role="region">
      {children}
    </div>
  )
}
