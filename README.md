# 260323_DiscreteVectors

260323_DiscreteVectors is a Three.js interactive flow-field tool for building discrete curl-noise swarm trails from a centered 3D emitter grid. It supports two display modes: swept square-profile trail meshes (polywire style) and a blur-style particle display, with timeline playback, material tuning, and export tools for stills and geometry.

## Features
- Discrete curl-noise swarm simulation with 3D grouping behavior driven by attraction, repulsion, alignment, and divergence forces.
- Centered emitter cube controls with independent `Spacing X/Y/Z` and `Count X/Y/Z`.
- Discrete vector snapping pipeline (`Discrete Resolution`) that quantizes each generated trail step to the nearest cube-direction unit vector.
- Continuous trail growth from emitters (no fixed trail length), with `Generation Distance` controlling sample spacing.
- Mesh rendering mode with square-profile swept trails, closed ends, and per-trail randomized thickness (`Thickness Min`, `Thickness Max`, `Thickness Seed`).
- Material section with gradient + shading controls (`Gradient Start/End`, `Gradient Contrast`, `Gradient Bias`, `Gradient Blur`, `Fresnel`, `Specular`, `Bloom`).
- `Particle Display` toggle (Material) to switch from mesh ribbons to blur-style particles with additive blending.
- Per-trail gradient mapping from each trail's own start to end, instead of scene-center distance mapping.
- Reset/start emitter marker cubes for quickly inspecting emitter layout before running.
- Timeline workflow with `Start/Pause`, `Reset`, snapshot scrubbing, and simulation-rate control.
- Export tools for `OBJ`, `GLB`, and viewport `PNG` screenshots.

## Getting Started
1. Clone this repo:
   `git clone https://github.com/ekimroyrp/260323_DiscreteVectors.git`
2. Install dependencies:
   `npm install`
3. Run local dev server:
   `npm run dev`
4. Build production bundle (type-check + Vite build):
   `npm run build`
5. Run tests:
   `npm test`
6. Preview production build locally:
   `npm run preview`

## Controls
- Camera:
  - `Wheel` = Zoom
  - `MMB` = Pan
  - `RMB` = Orbit
- Simulation:
  - `Start` / `Pause` toggles stepping
  - `Reset` rebuilds from current settings and shows emitter start markers
  - `Simulation Timeline` scrubs through recorded snapshots while paused
- Emitter:
  - `Spacing X/Y/Z` sets centered emitter-grid spacing
  - `Count X/Y/Z` sets centered emitter-grid resolution
- Flow:
  - `Discrete Resolution` sets the discrete direction basis used for vector snapping
  - `Generation Distance` sets distance between emitted samples
  - `Momentum Damping` controls retained velocity each step
  - `Attraction Force` / `Repulsion Force` pull and push relative to the swarm convergence target
  - `Alignment Radius` / `Alignment Strength` align to nearby heading direction
  - `Divergence Radius` / `Divergence Strength` apply anti-alignment steering
  - `Curl Frequency`, `Curl Strength`, `Curl Speed`, `Curl Vorticity` shape primary curl motion
  - `Octave Layers`, `Octave Lacunarity`, `Octave Gain` shape multi-octave flow detail
  - `Warp Frequency`, `Warp Strength` control domain warping before curl sampling
  - `Flow Seed` controls deterministic field variation
- Mesh:
  - `Thickness Min` / `Thickness Max` set per-trail random thickness range
  - `Thickness Seed` shuffles which trail gets which thickness value
- Material:
  - `Gradient Start` / `Gradient End` set trail color ramp endpoints
  - `Gradient Contrast` / `Gradient Bias` remap gradient response
  - `Gradient Blur` smooths gradient transitions along trails
  - `Fresnel`, `Specular`, `Bloom` tune final look
  - `Particle Display` toggles mesh ribbons vs blur-style particles
- Exports:
  - `Export OBJ` saves mesh trails with vertex colors
  - `Export GLB` saves mesh trails with vertex colors
  - `Export Screenshot` saves a PNG of the current viewport

## Deployment
- **Local production preview:** `npm install`, then `npm run build` followed by `npm run preview` to inspect the compiled bundle.
- **Publish to GitHub Pages:** From a clean `main`, run `npm run build -- --base=./`. Checkout (or create) the `gh-pages` branch in a separate worktree/repo, copy everything inside `dist/` plus a `.nojekyll` marker to branch root, commit with a descriptive message, `git push origin gh-pages`, then switch back to `main`.
- **Live demo:** https://ekimroyrp.github.io/260323_DiscreteVectors/
