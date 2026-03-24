import { BufferAttribute, BufferGeometry, Color } from 'three';
import type { MaterialSettings, ParticleSettings } from '../types';
import type { TrailStateView } from './swarmTrailsEngine';

const PROFILE_CORNERS: Array<[number, number]> = [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
];

const PROFILE_EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function hashUint32(value: number): number {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

function seededRandom01(seed: number, index: number): number {
  const mixed = hashUint32((seed ^ Math.imul(index + 1, 0x9e3779b9)) >>> 0);
  return mixed / 0x100000000;
}

function normalizeVector(x: number, y: number, z: number): [number, number, number] {
  const length = Math.sqrt(x * x + y * y + z * z);
  if (length <= 1e-8) {
    return [0, 1, 0];
  }
  return [x / length, y / length, z / length];
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

function smoothTrailPositions(positions: Float32Array, pointCount: number, strength: number): void {
  if (pointCount <= 2 || strength <= 0) {
    return;
  }

  const passes = Math.max(1, Math.round(strength * 4));
  const amount = Math.min(0.6, Math.max(0.08, strength * 0.45));
  const temp = new Float32Array(positions.length);

  for (let pass = 0; pass < passes; pass += 1) {
    temp[0] = positions[0];
    temp[1] = positions[1];
    temp[2] = positions[2];
    const last = (pointCount - 1) * 3;
    temp[last] = positions[last];
    temp[last + 1] = positions[last + 1];
    temp[last + 2] = positions[last + 2];

    for (let i = 1; i < pointCount - 1; i += 1) {
      const read = i * 3;
      const prev = read - 3;
      const next = read + 3;
      const avgX = (positions[prev] + positions[read] + positions[next]) / 3;
      const avgY = (positions[prev + 1] + positions[read + 1] + positions[next + 1]) / 3;
      const avgZ = (positions[prev + 2] + positions[read + 2] + positions[next + 2]) / 3;
      temp[read] = positions[read] + (avgX - positions[read]) * amount;
      temp[read + 1] = positions[read + 1] + (avgY - positions[read + 1]) * amount;
      temp[read + 2] = positions[read + 2] + (avgZ - positions[read + 2]) * amount;
    }

    for (let i = 3; i < last; i += 1) {
      positions[i] = temp[i];
    }
  }
}

function choosePerpendicular(tx: number, ty: number, tz: number): [number, number, number] {
  let ax = 0;
  let ay = 1;
  let az = 0;
  if (Math.abs(ty) > 0.92) {
    ax = 1;
    ay = 0;
    az = 0;
  }
  const nx = ay * tz - az * ty;
  const ny = az * tx - ax * tz;
  const nz = ax * ty - ay * tx;
  return normalizeVector(nx, ny, nz);
}

function setEmptyGeometry(geometry: BufferGeometry): BufferGeometry {
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(0), 3));
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(0), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(0), 3));
  geometry.setIndex(null);
  geometry.setDrawRange(0, 0);
  return geometry;
}

export function buildTrailMeshGeometry(
  state: TrailStateView,
  particleSettings: ParticleSettings,
  materialSettings: MaterialSettings,
): BufferGeometry {
  const geometry = new BufferGeometry();
  if (state.emitterCount <= 0) {
    return setEmptyGeometry(geometry);
  }

  const positionsOut: number[] = [];
  const normalsOut: number[] = [];
  const colorsOut: number[] = [];
  const indicesOut: number[] = [];
  const start = new Color(materialSettings.gradientStart);
  const end = new Color(materialSettings.gradientEnd);
  const minRaw = Math.min(10, Math.max(0.1, particleSettings.thicknessMin));
  const maxRaw = Math.min(10, Math.max(0.1, particleSettings.thicknessMax));
  const thicknessMin = Math.min(minRaw, maxRaw);
  const thicknessMax = Math.max(minRaw, maxRaw);
  const thicknessSpan = thicknessMax - thicknessMin;
  const thicknessSeed = Math.max(0, Math.round(particleSettings.thicknessSeed)) >>> 0;
  const p1 = new Float32Array(3);
  let vertexOffset = 0;

  for (let emitter = 0; emitter < state.emitterCount; emitter += 1) {
    const thicknessRandom = seededRandom01(thicknessSeed, emitter);
    const trailThickness =
      thicknessSpan <= 1e-6 ? thicknessMin : thicknessMin + thicknessRandom * thicknessSpan;
    const smoothingStrength = Math.max(0, Math.min(1, (trailThickness - 1) / 9));
    const minSpacing = Math.max(
      1e-6,
      particleSettings.generationDistance *
        Math.min(0.95, Math.max(0.1, (trailThickness - 0.35) * 0.12)),
    );
    const minSpacingSq = minSpacing * minSpacing;
    const profileHalfSize = Math.max(0.00075, trailThickness * 0.0032);
    const emitterBaseVertex = vertexOffset;
    const filled = state.filledLengths[emitter];
    if (filled < 2) {
      continue;
    }

    const rawPositions = new Float32Array(filled * 3);
    for (let i = 0; i < filled; i += 1) {
      readTrailPoint(state, emitter, i, p1);
      const write = i * 3;
      rawPositions[write] = p1[0];
      rawPositions[write + 1] = p1[1];
      rawPositions[write + 2] = p1[2];
    }
    smoothTrailPositions(rawPositions, filled, smoothingStrength);

    const compactPositions: number[] = [];
    let hasLast = false;
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    for (let i = 0; i < filled; i += 1) {
      const read = i * 3;
      const x = rawPositions[read];
      const y = rawPositions[read + 1];
      const z = rawPositions[read + 2];
      if (hasLast) {
        const dx = x - lastX;
        const dy = y - lastY;
        const dz = z - lastZ;
        if (dx * dx + dy * dy + dz * dz <= minSpacingSq) {
          continue;
        }
      }
      compactPositions.push(x, y, z);
      lastX = x;
      lastY = y;
      lastZ = z;
      hasLast = true;
    }

    const pointCount = Math.floor(compactPositions.length / 3);
    if (pointCount < 2) {
      continue;
    }

    const displacement = new Float32Array(pointCount);
    const tangents = new Float32Array(pointCount * 3);
    const frameNormals = new Float32Array(pointCount * 3);
    const frameBinormals = new Float32Array(pointCount * 3);
    const pointColors = new Float32Array(pointCount * 3);

    displacement[0] = 0;
    let totalLength = 0;
    for (let i = 1; i < pointCount; i += 1) {
      const read = i * 3;
      const prev = read - 3;
      const dx = compactPositions[read] - compactPositions[prev];
      const dy = compactPositions[read + 1] - compactPositions[prev + 1];
      const dz = compactPositions[read + 2] - compactPositions[prev + 2];
      totalLength += Math.sqrt(dx * dx + dy * dy + dz * dz);
      displacement[i] = totalLength;
    }

    if (totalLength > 1e-8) {
      const invLength = 1 / totalLength;
      for (let i = 1; i < pointCount; i += 1) {
        displacement[i] *= invLength;
      }
    }
    blurScalarSeries(displacement, pointCount, materialSettings.gradientBlur);

    for (let i = 0; i < pointCount; i += 1) {
      const current = i * 3;
      const prev = i > 0 ? current - 3 : current;
      const next = i < pointCount - 1 ? current + 3 : current;
      let tx = compactPositions[next] - compactPositions[prev];
      let ty = compactPositions[next + 1] - compactPositions[prev + 1];
      let tz = compactPositions[next + 2] - compactPositions[prev + 2];
      if (tx * tx + ty * ty + tz * tz <= 1e-12) {
        if (i > 0) {
          tx = tangents[current - 3];
          ty = tangents[current - 2];
          tz = tangents[current - 1];
        } else {
          tx = 0;
          ty = 0;
          tz = 1;
        }
      }
      const tangent = normalizeVector(tx, ty, tz);
      tangents[current] = tangent[0];
      tangents[current + 1] = tangent[1];
      tangents[current + 2] = tangent[2];
    }

    const firstTangent = [tangents[0], tangents[1], tangents[2]] as const;
    const firstNormal = choosePerpendicular(firstTangent[0], firstTangent[1], firstTangent[2]);
    frameNormals[0] = firstNormal[0];
    frameNormals[1] = firstNormal[1];
    frameNormals[2] = firstNormal[2];
    const firstBinormal = normalizeVector(
      firstTangent[1] * firstNormal[2] - firstTangent[2] * firstNormal[1],
      firstTangent[2] * firstNormal[0] - firstTangent[0] * firstNormal[2],
      firstTangent[0] * firstNormal[1] - firstTangent[1] * firstNormal[0],
    );
    frameBinormals[0] = firstBinormal[0];
    frameBinormals[1] = firstBinormal[1];
    frameBinormals[2] = firstBinormal[2];

    for (let i = 1; i < pointCount; i += 1) {
      const read = i * 3;
      const tx = tangents[read];
      const ty = tangents[read + 1];
      const tz = tangents[read + 2];
      const prevNx = frameNormals[read - 3];
      const prevNy = frameNormals[read - 2];
      const prevNz = frameNormals[read - 1];
      const projectedDot = prevNx * tx + prevNy * ty + prevNz * tz;
      let nx = prevNx - projectedDot * tx;
      let ny = prevNy - projectedDot * ty;
      let nz = prevNz - projectedDot * tz;
      if (nx * nx + ny * ny + nz * nz <= 1e-12) {
        const fallback = choosePerpendicular(tx, ty, tz);
        nx = fallback[0];
        ny = fallback[1];
        nz = fallback[2];
      }
      const normal = normalizeVector(nx, ny, nz);
      const binormal = normalizeVector(
        ty * normal[2] - tz * normal[1],
        tz * normal[0] - tx * normal[2],
        tx * normal[1] - ty * normal[0],
      );
      const correctedNormal = normalizeVector(
        binormal[1] * tz - binormal[2] * ty,
        binormal[2] * tx - binormal[0] * tz,
        binormal[0] * ty - binormal[1] * tx,
      );
      frameNormals[read] = correctedNormal[0];
      frameNormals[read + 1] = correctedNormal[1];
      frameNormals[read + 2] = correctedNormal[2];
      frameBinormals[read] = binormal[0];
      frameBinormals[read + 1] = binormal[1];
      frameBinormals[read + 2] = binormal[2];
    }

    for (let i = 0; i < pointCount; i += 1) {
      const read = i * 3;
      const px = compactPositions[read];
      const py = compactPositions[read + 1];
      const pz = compactPositions[read + 2];
      const nx = frameNormals[read];
      const ny = frameNormals[read + 1];
      const nz = frameNormals[read + 2];
      const bx = frameBinormals[read];
      const by = frameBinormals[read + 1];
      const bz = frameBinormals[read + 2];
      const t = clamp01(displacement[i] * materialSettings.curvatureContrast + materialSettings.curvatureBias);
      const cr = start.r + (end.r - start.r) * t;
      const cg = start.g + (end.g - start.g) * t;
      const cb = start.b + (end.b - start.b) * t;
      pointColors[read] = cr;
      pointColors[read + 1] = cg;
      pointColors[read + 2] = cb;

      for (let corner = 0; corner < PROFILE_CORNERS.length; corner += 1) {
        const [sx, sy] = PROFILE_CORNERS[corner];
        const ox = (nx * sx + bx * sy) * profileHalfSize;
        const oy = (ny * sx + by * sy) * profileHalfSize;
        const oz = (nz * sx + bz * sy) * profileHalfSize;
        positionsOut.push(px + ox, py + oy, pz + oz);
        const faceNormal = normalizeVector(nx * sx + bx * sy, ny * sx + by * sy, nz * sx + bz * sy);
        normalsOut.push(faceNormal[0], faceNormal[1], faceNormal[2]);
        colorsOut.push(cr, cg, cb);
      }
    }

    for (let i = 0; i < pointCount - 1; i += 1) {
      const ringA = emitterBaseVertex + i * 4;
      const ringB = ringA + 4;
      for (let edge = 0; edge < PROFILE_EDGES.length; edge += 1) {
        const [a, b] = PROFILE_EDGES[edge];
        indicesOut.push(ringA + a, ringA + b, ringB + b);
        indicesOut.push(ringA + a, ringB + b, ringB + a);
      }
    }

    const startCapBase = positionsOut.length / 3;
    const startPx = compactPositions[0];
    const startPy = compactPositions[1];
    const startPz = compactPositions[2];
    const startNx = frameNormals[0];
    const startNy = frameNormals[1];
    const startNz = frameNormals[2];
    const startBx = frameBinormals[0];
    const startBy = frameBinormals[1];
    const startBz = frameBinormals[2];
    const startTx = tangents[0];
    const startTy = tangents[1];
    const startTz = tangents[2];
    const startCr = pointColors[0];
    const startCg = pointColors[1];
    const startCb = pointColors[2];
    for (let corner = 0; corner < PROFILE_CORNERS.length; corner += 1) {
      const [sx, sy] = PROFILE_CORNERS[corner];
      const ox = (startNx * sx + startBx * sy) * profileHalfSize;
      const oy = (startNy * sx + startBy * sy) * profileHalfSize;
      const oz = (startNz * sx + startBz * sy) * profileHalfSize;
      positionsOut.push(startPx + ox, startPy + oy, startPz + oz);
      normalsOut.push(-startTx, -startTy, -startTz);
      colorsOut.push(startCr, startCg, startCb);
    }
    indicesOut.push(startCapBase + 0, startCapBase + 2, startCapBase + 1);
    indicesOut.push(startCapBase + 0, startCapBase + 3, startCapBase + 2);

    const endRead = (pointCount - 1) * 3;
    const endCapBase = positionsOut.length / 3;
    const endPx = compactPositions[endRead];
    const endPy = compactPositions[endRead + 1];
    const endPz = compactPositions[endRead + 2];
    const endNx = frameNormals[endRead];
    const endNy = frameNormals[endRead + 1];
    const endNz = frameNormals[endRead + 2];
    const endBx = frameBinormals[endRead];
    const endBy = frameBinormals[endRead + 1];
    const endBz = frameBinormals[endRead + 2];
    const endTx = tangents[endRead];
    const endTy = tangents[endRead + 1];
    const endTz = tangents[endRead + 2];
    const endCr = pointColors[endRead];
    const endCg = pointColors[endRead + 1];
    const endCb = pointColors[endRead + 2];
    for (let corner = 0; corner < PROFILE_CORNERS.length; corner += 1) {
      const [sx, sy] = PROFILE_CORNERS[corner];
      const ox = (endNx * sx + endBx * sy) * profileHalfSize;
      const oy = (endNy * sx + endBy * sy) * profileHalfSize;
      const oz = (endNz * sx + endBz * sy) * profileHalfSize;
      positionsOut.push(endPx + ox, endPy + oy, endPz + oz);
      normalsOut.push(endTx, endTy, endTz);
      colorsOut.push(endCr, endCg, endCb);
    }
    indicesOut.push(endCapBase + 0, endCapBase + 1, endCapBase + 2);
    indicesOut.push(endCapBase + 0, endCapBase + 2, endCapBase + 3);

    vertexOffset = positionsOut.length / 3;
  }

  if (positionsOut.length === 0 || indicesOut.length === 0) {
    return setEmptyGeometry(geometry);
  }

  geometry.setAttribute('position', new BufferAttribute(Float32Array.from(positionsOut), 3));
  geometry.setAttribute('normal', new BufferAttribute(Float32Array.from(normalsOut), 3));
  geometry.setAttribute('color', new BufferAttribute(Float32Array.from(colorsOut), 3));

  const indexArray =
    vertexOffset > 65535 ? Uint32Array.from(indicesOut) : Uint16Array.from(indicesOut);
  geometry.setIndex(new BufferAttribute(indexArray, 1));
  geometry.computeBoundingSphere();
  return geometry;
}
