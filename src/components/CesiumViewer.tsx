/**
 * CesiumViewer — Native CesiumJS viewer component
 *
 * Integrates CesiumJS directly into React without Resium.
 * The viewer always occupies the full viewport (z-index 0) and acts as the
 * application's 3D environment background.
 *
 * Geographic positioning note:
 * The current prototype uses a fixed camera position.
 * Future: when the ML pipeline provides georeferenced metadata.json,
 * the model position and camera should be driven by ModelGeoAnchor data.
 * The hook points are marked with FUTURE comments below.
 */

import { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

interface CesiumViewerProps {
  /** URL of the GLB model to display. Null hides the model. */
  modelUrl: string | null
}

// Cesium Ion token from environment
const ION_TOKEN = import.meta.env.VITE_CESIUM_ION_ACCESS_TOKEN as string | undefined

/**
 * Default camera position for the empty globe view (Austin, TX area —
 * matches the example GPS coordinates in the problem statement).
 *
 * FUTURE: When georeferenced reconstruction metadata is available, the
 * camera will fly to the model's actual geographic coordinates.
 */
const DEFAULT_CAMERA = {
  longitude: -97.764242,
  latitude: 30.276501,
  height: 2000,
} as const

export function CesiumViewer({ modelUrl }: CesiumViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Cesium.Viewer | null>(null)
  const modelEntityRef = useRef<Cesium.Entity | null>(null)

  // ── Initialize viewer ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    // Set Ion token if provided
    if (ION_TOKEN && ION_TOKEN !== 'your_cesium_ion_token_here') {
      Cesium.Ion.defaultAccessToken = ION_TOKEN
    }

    const viewer = new Cesium.Viewer(containerRef.current, {
      // UI chrome — keep minimal for a clean 3D experience
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,

      // Terrain: use Cesium World Terrain when Ion token is available
      // Falls back to ellipsoid if no token
      terrain: ION_TOKEN && ION_TOKEN !== 'your_cesium_ion_token_here'
        ? Cesium.Terrain.fromWorldTerrain()
        : undefined,
    })

    // Remove the default Cesium credit display logo to reduce clutter
    // (still attributing properly via Ion — required by ToS)
    const creditContainer = viewer.cesiumWidget.creditContainer as HTMLElement
    creditContainer.style.display = 'none'

    // Initial camera: fly to default area
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        DEFAULT_CAMERA.longitude,
        DEFAULT_CAMERA.latitude,
        DEFAULT_CAMERA.height,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
      duration: 0, // Instant on load
    })

    viewerRef.current = viewer

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.destroy()
      }
      viewerRef.current = null
    }
  }, []) // Run once on mount

  // ── Load/unload model when modelUrl changes ────────────────
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed()) return

    // Remove previous model entity
    if (modelEntityRef.current) {
      viewer.entities.remove(modelEntityRef.current)
      modelEntityRef.current = null
    }

    if (!modelUrl) return

    /**
     * Position the model.
     *
     * CURRENT: Fixed position matching the GPS sample data from the problem
     * statement (Austin, TX area). The model floats slightly above terrain.
     *
     * FUTURE: When the ML pipeline provides metadata.json with the real
     * geographic anchor (ModelGeoAnchor), replace these coordinates with:
     *   Cesium.Cartesian3.fromDegrees(anchor.longitude, anchor.latitude, anchor.altitudeMeters)
     * and apply the heading from anchor.headingDegrees.
     */
    const modelPosition = Cesium.Cartesian3.fromDegrees(
      DEFAULT_CAMERA.longitude,
      DEFAULT_CAMERA.latitude,
      DEFAULT_CAMERA.height - 1960, // Near ground level
    )

    const entity = viewer.entities.add({
      name: 'Reconstruction Model',
      position: modelPosition,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        modelPosition,
        new Cesium.HeadingPitchRoll(0, 0, 0),
      ),
      model: {
        uri: modelUrl,
        minimumPixelSize: 64,
        maximumScale: 20000,
        // Silhouette on hover for interactivity
        silhouetteColor: Cesium.Color.fromCssColorString('#3d8bff'),
        silhouetteSize: 0,
      },
    })

    modelEntityRef.current = entity

    // Fly camera to show the model
    // FUTURE: adjust heading/pitch based on ModelGeoAnchor.headingDegrees
    void viewer.flyTo(entity, {
      offset: new Cesium.HeadingPitchRange(
        0,
        Cesium.Math.toRadians(-30),
        150,
      ),
      duration: 2.5,
    }).catch(() => {
      // flyTo can fail if viewer is destroyed during flight — safe to ignore
    })
  }, [modelUrl])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        // Cesium renders at z-index 0; floating UI panels sit above
        zIndex: 0,
      }}
      aria-label="3D Reconstruction Viewer"
    />
  )
}
