# 260323_DiscreteVectors

260323_DiscreteVectors is a Three.js interactive swarm-trails simulator that generates grouped particle paths from a centered 3D emitter grid using curl noise. Trails are rendered as swept square-profile mesh ribbons (polywire style) with vertex-color gradients, plus a draggable/collapsible control panel, timeline playback, material tuning, and OBJ/GLB/screenshot export.

## Features
- Curl-noise swarm simulation with convergence grouping in 3D.
- Centered emitter cube controls (`Count X/Y/Z` and `Spacing X/Y/Z`).
- Mesh controls (`Thickness Min`, `Thickness Max`, `Thickness Seed`).
- Mesh trail rendering with square-profile sweep and closed mesh ends.
- Center discrete-space visualization: a wireframe subdivided box with center-to-vertex guide lines.
- Flow controls for motion behavior (`Seed`, `Generation Distance`, `Discrete Resolution`, `Noise Scale`, `Noise Speed`, `Noise Strength`, `Octaves`, `Lacunarity`, `Gain`, `Warp Strength`, `Warp Scale`, `Vorticity`, `Attraction`, `Damping`).
- Material controls for gradient and lighting look (start/end colors, contrast, bias, blur, fresnel, specular, bloom).
- Trail gradients are mapped from each trail's own start point to end point.
- Trails always begin at emitter points and keep growing until simulation is paused or reset.
- Emitter-origin square markers visible in reset/start state for start-point layout inspection.
- Simulation controls (`Start/Pause`, `Reset`, `Simulation Timeline`, `Simulation Rate`).
- Export tools (`Export OBJ`, `Export GLB`, `Export Screenshot`).

## Getting Started
1. Clone this repo:
   `git clone https://github.com/ekimroyrp/260323_DiscreteVectors.git`
2. Install dependencies:
   `npm install`
3. Run local dev server:
   `npm run dev`
4. Build production bundle:
   `npm run build`
5. Run tests:
   `npm test`

## Controls
- Camera:
  - `Wheel` = Zoom
  - `MMB` = Pan
  - `RMB` = Orbit
- Simulation:
  - `Start` / `Pause` toggles stepping
  - `Reset` rebuilds the swarm from current emitter/particle settings and shows emitter start markers
  - `Simulation Timeline` scrubs through recorded snapshots while paused
- Flow:
  - `Seed` controls deterministic variation of the curl-noise field (same seed + settings reproduces the same motion)
  - `Generation Distance` controls spacing between generated points along each trail
  - `Discrete Resolution` controls the discrete direction set used for vector snapping
  - `Octaves`, `Lacunarity`, and `Gain` control layered fBm detail in the flow field
  - `Warp Strength` and `Warp Scale` control domain warping before curl sampling
- Mesh:
  - `Thickness Min` / `Thickness Max` set per-trail random thickness range
  - `Thickness Seed` shuffles which trail gets which thickness value
- Exports:
  - `Export OBJ` saves mesh trails with vertex colors
  - `Export GLB` saves mesh trails with vertex colors
  - `Export Screenshot` saves a PNG of the current viewport
