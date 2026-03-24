import { BufferAttribute, BufferGeometry, Color } from 'three';
import type { MaterialSettings } from '../types';
import type { TrailStateView } from './swarmTrailsEngine';

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function setEmptyGeometry(geometry: BufferGeometry): BufferGeometry {
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(0), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(0), 3));
  geometry.setDrawRange(0, 0);
  return geometry;
}

function readTrailPoint(
  state: TrailStateView,
  emitterIndex: number,
  orderedPointIndex: number,
  out: Float32Array,
): void {
  const read = (emitterIndex * state.trailCapacity + orderedPointIndex) * 3;
  out[0] = state.trailPoints[read];
  out[1] = state.trailPoints[read + 1];
  out[2] = state.trailPoints[read + 2];
}

function blurScalarSeries(values: Float32Array, count: number, strength: number): void {
  if (count <= 2 || strength <= 0) {
    return;
  }
  const passes = Math.max(1, Math.round(strength * 6));
  const amount = Math.min(0.55, Math.max(0, strength * 0.55));
  const temp = new Float32Array(count);

  for (let pass = 0; pass < passes; pass += 1) {
    temp[0] = values[0];
    temp[count - 1] = values[count - 1];
    for (let i = 1; i < count - 1; i += 1) {
      const avg = (values[i - 1] + values[i] + values[i + 1]) / 3;
      temp[i] = values[i] + (avg - values[i]) * amount;
    }
    for (let i = 1; i < count - 1; i += 1) {
      values[i] = temp[i];
    }
  }
}

export function buildParticleDisplayGeometry(
  state: TrailStateView,
  materialSettings: MaterialSettings,
): BufferGeometry {
  const geometry = new BufferGeometry();
  if (state.emitterCount <= 0) {
    return setEmptyGeometry(geometry);
  }

  const positionsOut: number[] = [];
  const colorsOut: number[] = [];
  const gradientStart = new Color(materialSettings.gradientStart);
  const gradientEnd = new Color(materialSettings.gradientEnd);
  const p0 = new Float32Array(3);
  const p1 = new Float32Array(3);
  const point = new Float32Array(3);

  for (let emitter = 0; emitter < state.emitterCount; emitter += 1) {
    const filled = state.filledLengths[emitter];
    if (filled <= 0) {
      continue;
    }

    const displacement = new Float32Array(filled);
    if (filled > 1) {
      let totalLength = 0;
      readTrailPoint(state, emitter, 0, p0);
      for (let i = 1; i < filled; i += 1) {
        readTrailPoint(state, emitter, i, p1);
        const dx = p1[0] - p0[0];
        const dy = p1[1] - p0[1];
        const dz = p1[2] - p0[2];
        totalLength += Math.sqrt(dx * dx + dy * dy + dz * dz);
        displacement[i] = totalLength;
        p0[0] = p1[0];
        p0[1] = p1[1];
        p0[2] = p1[2];
      }

      if (totalLength > 1e-8) {
        const invLength = 1 / totalLength;
        for (let i = 1; i < filled; i += 1) {
          displacement[i] *= invLength;
        }
      }
      blurScalarSeries(displacement, filled, materialSettings.gradientBlur);
    }

    for (let i = 0; i < filled; i += 1) {
      readTrailPoint(state, emitter, i, point);
      positionsOut.push(point[0], point[1], point[2]);

      const t = clamp01(
        displacement[i] * materialSettings.curvatureContrast + materialSettings.curvatureBias,
      );
      const r = gradientStart.r + (gradientEnd.r - gradientStart.r) * t;
      const g = gradientStart.g + (gradientEnd.g - gradientStart.g) * t;
      const b = gradientStart.b + (gradientEnd.b - gradientStart.b) * t;
      colorsOut.push(r, g, b);
    }
  }

  if (positionsOut.length === 0) {
    return setEmptyGeometry(geometry);
  }

  geometry.setAttribute('position', new BufferAttribute(Float32Array.from(positionsOut), 3));
  geometry.setAttribute('color', new BufferAttribute(Float32Array.from(colorsOut), 3));
  geometry.setDrawRange(0, positionsOut.length / 3);
  geometry.computeBoundingSphere();
  return geometry;
}
