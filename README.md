# Drone 3D Reconstruction — Frontend Prototype

Single-pass drone video to accurate 3D model generation system.  
Frontend prototype: **React + TypeScript + Vite + CesiumJS**

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up your Cesium Ion token (see below)
cp .env.example .env
# Edit .env and add your token

# 3. Run dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Cesium Ion Token

CesiumJS uses [Cesium Ion](https://ion.cesium.com) for base imagery and terrain streaming.

1. Sign up free at https://ion.cesium.com
2. Copy your default access token
3. Create a `.env` file (see `.env.example`):

```env
VITE_CESIUM_ION_ACCESS_TOKEN=your_token_here
```

> ⚠️ **Never commit `.env` to git.** It is already in `.gitignore`.

The app will run without a token but Cesium imagery/terrain will be limited.

---

## Replacing the Sample Model

The placeholder model is at:

```
public/models/sample-model.glb
```

To use your own reconstruction output, either:

- **Replace the file** — overwrite `public/models/sample-model.glb` with your GLB
- **Update the service** — open `src/services/reconstructionService.ts` and change the `modelUrl` path returned on completion

In the future, `modelUrl` will come from the FastAPI backend (not a local file).

---

## User Flow

```
Landing (/)
    ↓  "Enter Application"
App (/app)
    ↓  Upload drone video + GPS CSV
    ↓  "Generate 3D Model"
    ↓  Processing (mocked pipeline)
    ↓  Model ready
Full-screen Cesium viewer showing model.glb
```

---

## Project Structure

```
src/
├── components/
│   ├── CesiumViewer.tsx        ← Native CesiumJS viewer (no Resium)
│   ├── FloatingPanel.tsx       ← Shared frosted-glass card wrapper
│   ├── UploadPanel.tsx         ← Video + GPS CSV upload UI
│   └── ProcessingPanel.tsx     ← Progress/stage display
├── hooks/
│   └── useReconstruction.ts    ← Job state + polling logic
├── pages/
│   ├── LandingPage.tsx         ← Minimal entry screen
│   └── AppPage.tsx             ← State machine + layout
├── services/
│   └── reconstructionService.ts ← Mock service (swap for API here)
├── types/
│   └── reconstruction.ts       ← Shared TypeScript interfaces
└── index.css                   ← Global design tokens + reset

public/
└── models/
    └── sample-model.glb        ← Replace with real reconstruction output
```

---

## Connecting to the Real Backend (Future)

When the FastAPI backend is ready:

1. Open `src/services/reconstructionService.ts`
2. Implement `ApiReconstructionService` using:
   - `POST /api/reconstructions` → start job, get `job_id`
   - `GET /api/reconstructions/{job_id}` → poll status
3. Change the export at the bottom of the file:
   ```ts
   export const reconstructionService = new ApiReconstructionService(
     import.meta.env.VITE_API_BASE_URL
   )
   ```
4. No other files need to change.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| 3D Viewer | CesiumJS (native — no Resium) |
| Routing | react-router-dom v7 |
| Styles | CSS Modules + CSS custom properties |
| Mock backend | In-process mock service |
| Future backend | Python FastAPI |
| Future database | PostgreSQL |
| Future storage | S3-compatible object storage |
| Future ML | Teammate's reconstruction pipeline |

---

## Geographic Positioning (Future)

The current prototype positions the sample model at a fixed location  
(Austin, TX — matching the example GPS data in the problem statement).

When the ML pipeline provides `metadata.json` with real geographic coordinates:

1. Parse `ModelGeoAnchor` from `metadata.json`
2. Pass it to `CesiumViewer` as a prop
3. Replace the hardcoded coordinates in `CesiumViewer.tsx` at the  
   `// FUTURE:` comment markers

---

## Build

```bash
npm run build   # Production bundle
npm run preview # Preview production build locally
```
