import { BufferAttribute, BufferGeometry, DynamicDrawUsage, MathUtils } from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import type { EmitterSettings, GrowthSettings, ParticleSettings } from '../types';

export type SwarmSnapshot = {
  heads: Float32Array;
  velocities: Float32Array;
  travel: Float32Array;
  trailPoints: Float32Array;
  headIndices: Int32Array;
  filledLengths: Int32Array;
  time: number;
};

const CENTER_BLEND = 0.6;
const MIN_GENERATION_DISTANCE = 0.0001;

function createSeededRandom(seed: number): { random: () => number } {
  let state = seed >>> 0;
  if (state === 0) {
    state = 0x12345678;
  }
  return {
    random: () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 0x100000000;
    },
  };
}

export class SwarmTrailsEngine {
  private emitterSettings: EmitterSettings;
  private particleSettings: ParticleSettings;
  private growthSettings: GrowthSettings;
  private geometry: BufferGeometry;
  private positionAttr: BufferAttribute;
  private curvatureAttr: BufferAttribute;
  private displacementAttr: BufferAttribute;
  private origins: Float32Array;
  private heads: Float32Array;
  private velocities: Float32Array;
  private travel: Float32Array;
  private trailPoints: Float32Array;
  private headIndices: Int32Array;
  private filledLengths: Int32Array;
  private emitterCount: number;
  private activeVertexCount: number;
  private time: number;
  private gradientBlur: number;
  private noiseA: SimplexNoise;
  private noiseB: SimplexNoise;
  private noiseC: SimplexNoise;
  private curvatureScratch: Float32Array;
  private displacementScratch: Float32Array;

  constructor(
    emitterSettings: EmitterSettings,
    particleSettings: ParticleSettings,
    growthSettings: GrowthSettings,
    seed: number,
  ) {
    this.emitterSettings = { ...emitterSettings };
    this.particleSettings = { ...particleSettings };
    this.growthSettings = { ...growthSettings };
    this.geometry = new BufferGeometry();
    this.positionAttr = new BufferAttribute(new Float32Array(0), 3);
    this.curvatureAttr = new BufferAttribute(new Float32Array(0), 1);
    this.displacementAttr = new BufferAttribute(new Float32Array(0), 1);
    this.origins = new Float32Array();
    this.heads = new Float32Array();
    this.velocities = new Float32Array();
    this.travel = new Float32Array();
    this.trailPoints = new Float32Array();
    this.headIndices = new Int32Array();
    this.filledLengths = new Int32Array();
    this.emitterCount = 0;
    this.activeVertexCount = 0;
    this.time = 0;
    this.gradientBlur = 0.35;
    this.curvatureScratch = new Float32Array(0);
    this.displacementScratch = new Float32Array(0);

    const randomA = createSeededRandom(seed ^ 0x9e3779b9);
    const randomB = createSeededRandom(seed ^ 0x243f6a88);
    const randomC = createSeededRandom(seed ^ 0xb7e15162);
    this.noiseA = new SimplexNoise(randomA);
    this.noiseB = new SimplexNoise(randomB);
    this.noiseC = new SimplexNoise(randomC);

    this.rebuildState();
  }

  getGeometry(): BufferGeometry {
    return this.geometry;
  }

  getActiveVertexCount(): number {
    return this.activeVertexCount;
  }

  setEmitterSettings(settings: EmitterSettings): void {
    this.emitterSettings = { ...settings };
    this.rebuildState();
  }

  setParticleSettings(settings: ParticleSettings): void {
    const previousTrailLength = this.particleSettings.trailLength;
    this.particleSettings = { ...settings };
    if (previousTrailLength !== this.particleSettings.trailLength) {
      this.rebuildState();
      return;
    }
    this.particleSettings.generationDistance = Math.max(
      MIN_GENERATION_DISTANCE,
      this.particleSettings.generationDistance,
    );
  }

  setGrowthSettings(settings: GrowthSettings): void {
    this.growthSettings = { ...settings };
  }

  setGradientBlur(strength: number): void {
    this.gradientBlur = MathUtils.clamp(strength, 0, 1);
    this.rebuildGeometryFromTrails();
  }

  reset(): void {
    this.initializeTrailsFromOrigins();
    this.time = 0;
    this.rebuildGeometryFromTrails();
  }

  exportSnapshot(): SwarmSnapshot {
    return {
      heads: Float32Array.from(this.heads),
      velocities: Float32Array.from(this.velocities),
      travel: Float32Array.from(this.travel),
      trailPoints: Float32Array.from(this.trailPoints),
      headIndices: Int32Array.from(this.headIndices),
      filledLengths: Int32Array.from(this.filledLengths),
      time: this.time,
    };
  }

  importSnapshot(snapshot: SwarmSnapshot): void {
    if (
      snapshot.heads.length !== this.heads.length ||
      snapshot.velocities.length !== this.velocities.length ||
      snapshot.travel.length !== this.travel.length ||
      snapshot.trailPoints.length !== this.trailPoints.length ||
      snapshot.headIndices.length !== this.headIndices.length ||
      snapshot.filledLengths.length !== this.filledLengths.length
    ) {
      return;
    }

    this.heads.set(snapshot.heads);
    this.velocities.set(snapshot.velocities);
    this.travel.set(snapshot.travel);
    this.trailPoints.set(snapshot.trailPoints);
    this.headIndices.set(snapshot.headIndices);
    this.filledLengths.set(snapshot.filledLengths);
    this.time = snapshot.time;
    this.rebuildGeometryFromTrails();
  }

  step(deltaSeconds: number, simulationRate: number): void {
    if (this.emitterCount <= 0) {
      return;
    }

    const safeDt = Math.min(Math.max(deltaSeconds, 0), 0.05);
    if (safeDt <= 0) {
      return;
    }

    const speed = Math.max(simulationRate, 0.05);
    const dt = safeDt * speed;

    let centroidX = 0;
    let centroidY = 0;
    let centroidZ = 0;
    for (let i = 0; i < this.emitterCount; i += 1) {
      const index = i * 3;
      centroidX += this.heads[index];
      centroidY += this.heads[index + 1];
      centroidZ += this.heads[index + 2];
    }
    centroidX /= this.emitterCount;
    centroidY /= this.emitterCount;
    centroidZ /= this.emitterCount;

    const targetX = centroidX * CENTER_BLEND;
    const targetY = centroidY * CENTER_BLEND;
    const targetZ = centroidZ * CENTER_BLEND;
    const damping = MathUtils.clamp(this.growthSettings.damping, 0, 0.9999);
    const attractionStrength = Math.max(0, this.growthSettings.attraction);
    const generationDistance = Math.max(MIN_GENERATION_DISTANCE, this.particleSettings.generationDistance);

    for (let i = 0; i < this.emitterCount; i += 1) {
      const index = i * 3;
      const px = this.heads[index];
      const py = this.heads[index + 1];
      const pz = this.heads[index + 2];

      const curl = this.sampleCurl(px, py, pz, this.time);

      let tx = targetX - px;
      let ty = targetY - py;
      let tz = targetZ - pz;
      const targetDistance = Math.sqrt(tx * tx + ty * ty + tz * tz);
      if (targetDistance > 1e-6) {
        const inv = attractionStrength / targetDistance;
        tx *= inv;
        ty *= inv;
        tz *= inv;
      } else {
        tx = 0;
        ty = 0;
        tz = 0;
      }

      const accelerationX = curl.x + tx;
      const accelerationY = curl.y + ty;
      const accelerationZ = curl.z + tz;

      const vx = this.velocities[index] * damping + accelerationX * dt;
      const vy = this.velocities[index + 1] * damping + accelerationY * dt;
      const vz = this.velocities[index + 2] * damping + accelerationZ * dt;

      const nx = px + vx * dt;
      const ny = py + vy * dt;
      const nz = pz + vz * dt;

      this.velocities[index] = vx;
      this.velocities[index + 1] = vy;
      this.velocities[index + 2] = vz;
      this.heads[index] = nx;
      this.heads[index + 1] = ny;
      this.heads[index + 2] = nz;

      const dx = nx - px;
      const dy = ny - py;
      const dz = nz - pz;
      this.travel[i] += Math.sqrt(dx * dx + dy * dy + dz * dz);

      while (this.travel[i] >= generationDistance) {
        this.pushTrailPoint(i, nx, ny, nz);
        this.travel[i] -= generationDistance;
      }
    }

    this.time += dt * this.growthSettings.noiseSpeed;
    this.rebuildGeometryFromTrails();
  }

  private rebuildState(): void {
    this.origins = this.buildEmitterOrigins();
    this.emitterCount = this.origins.length / 3;
    this.curvatureScratch = new Float32Array(this.particleSettings.trailLength);
    this.displacementScratch = new Float32Array(this.particleSettings.trailLength);

    this.initializeTrailsFromOrigins();
    this.rebuildGeometryBuffers();
    this.rebuildGeometryFromTrails();
  }

  private initializeTrailsFromOrigins(): void {
    const trailLength = this.particleSettings.trailLength;
    const totalPointSlots = this.emitterCount * trailLength;
    this.heads = Float32Array.from(this.origins);
    this.velocities = new Float32Array(this.emitterCount * 3);
    this.travel = new Float32Array(this.emitterCount);
    this.trailPoints = new Float32Array(totalPointSlots * 3);
    this.headIndices = new Int32Array(this.emitterCount);
    this.filledLengths = new Int32Array(this.emitterCount);

    for (let emitter = 0; emitter < this.emitterCount; emitter += 1) {
      const sourceIndex = emitter * 3;
      const tx = this.origins[sourceIndex];
      const ty = this.origins[sourceIndex + 1];
      const tz = this.origins[sourceIndex + 2];
      const slotBase = emitter * trailLength * 3;
      this.trailPoints[slotBase] = tx;
      this.trailPoints[slotBase + 1] = ty;
      this.trailPoints[slotBase + 2] = tz;
      this.headIndices[emitter] = 0;
      this.filledLengths[emitter] = 1;
    }
  }

  private rebuildGeometryBuffers(): void {
    const maxSegments = this.emitterCount * Math.max(0, this.particleSettings.trailLength - 1);
    const vertexCapacity = maxSegments * 2;

    if (this.geometry) {
      this.geometry.dispose();
    }

    this.geometry = new BufferGeometry();
    this.positionAttr = new BufferAttribute(new Float32Array(vertexCapacity * 3), 3);
    this.positionAttr.setUsage(DynamicDrawUsage);
    this.curvatureAttr = new BufferAttribute(new Float32Array(vertexCapacity), 1);
    this.curvatureAttr.setUsage(DynamicDrawUsage);
    this.displacementAttr = new BufferAttribute(new Float32Array(vertexCapacity), 1);
    this.displacementAttr.setUsage(DynamicDrawUsage);

    this.geometry.setAttribute('position', this.positionAttr);
    this.geometry.setAttribute('aCurvature', this.curvatureAttr);
    this.geometry.setAttribute('aDisplacement', this.displacementAttr);
    this.geometry.setDrawRange(0, 0);
    this.activeVertexCount = 0;
  }

  private buildEmitterOrigins(): Float32Array {
    const countX = Math.max(1, Math.round(this.emitterSettings.countX));
    const countY = Math.max(1, Math.round(this.emitterSettings.countY));
    const countZ = Math.max(1, Math.round(this.emitterSettings.countZ));
    const spacingX = Math.max(0.0001, this.emitterSettings.spacingX);
    const spacingY = Math.max(0.0001, this.emitterSettings.spacingY);
    const spacingZ = Math.max(0.0001, this.emitterSettings.spacingZ);

    const total = countX * countY * countZ;
    const result = new Float32Array(total * 3);
    let write = 0;

    for (let z = 0; z < countZ; z += 1) {
      for (let y = 0; y < countY; y += 1) {
        for (let x = 0; x < countX; x += 1) {
          result[write] = (x - (countX - 1) * 0.5) * spacingX;
          result[write + 1] = (y - (countY - 1) * 0.5) * spacingY;
          result[write + 2] = (z - (countZ - 1) * 0.5) * spacingZ;
          write += 3;
        }
      }
    }

    return result;
  }

  private getTrailPoint(emitterIndex: number, orderedPointIndex: number, out: Float32Array): void {
    const trailLength = this.particleSettings.trailLength;
    const filled = this.filledLengths[emitterIndex];
    const head = this.headIndices[emitterIndex];
    const oldest = (head - (filled - 1) + trailLength) % trailLength;
    const ringIndex = (oldest + orderedPointIndex) % trailLength;
    const base = (emitterIndex * trailLength + ringIndex) * 3;
    out[0] = this.trailPoints[base];
    out[1] = this.trailPoints[base + 1];
    out[2] = this.trailPoints[base + 2];
  }

  private pushTrailPoint(emitterIndex: number, x: number, y: number, z: number): void {
    const trailLength = this.particleSettings.trailLength;
    const nextHead = (this.headIndices[emitterIndex] + 1) % trailLength;
    this.headIndices[emitterIndex] = nextHead;
    const write = (emitterIndex * trailLength + nextHead) * 3;
    this.trailPoints[write] = x;
    this.trailPoints[write + 1] = y;
    this.trailPoints[write + 2] = z;
    if (this.filledLengths[emitterIndex] < trailLength) {
      this.filledLengths[emitterIndex] += 1;
    }
  }

  private rebuildGeometryFromTrails(): void {
    const positions = this.positionAttr.array as Float32Array;
    const curvature = this.curvatureAttr.array as Float32Array;
    const displacement = this.displacementAttr.array as Float32Array;

    let maxDistance = 1e-6;
    for (let emitter = 0; emitter < this.emitterCount; emitter += 1) {
      const filled = this.filledLengths[emitter];
      for (let point = 0; point < filled; point += 1) {
        this.getTrailPoint(emitter, point, this.displacementScratch);
        const distanceToCenter = Math.sqrt(
          this.displacementScratch[0] * this.displacementScratch[0] +
            this.displacementScratch[1] * this.displacementScratch[1] +
            this.displacementScratch[2] * this.displacementScratch[2],
        );
        if (distanceToCenter > maxDistance) {
          maxDistance = distanceToCenter;
        }
      }
    }

    const p0 = new Float32Array(3);
    const p1 = new Float32Array(3);
    const p2 = new Float32Array(3);

    let writeVertex = 0;

    for (let emitter = 0; emitter < this.emitterCount; emitter += 1) {
      const filled = this.filledLengths[emitter];
      if (filled < 2) {
        continue;
      }

      for (let point = 0; point < filled; point += 1) {
        this.getTrailPoint(emitter, point, p1);
        if (point === 0 || point === filled - 1) {
          this.curvatureScratch[point] = 0;
        } else {
          this.getTrailPoint(emitter, point - 1, p0);
          this.getTrailPoint(emitter, point + 1, p2);
          const ax = p1[0] - p0[0];
          const ay = p1[1] - p0[1];
          const az = p1[2] - p0[2];
          const bx = p2[0] - p1[0];
          const by = p2[1] - p1[1];
          const bz = p2[2] - p1[2];
          const al = Math.sqrt(ax * ax + ay * ay + az * az);
          const bl = Math.sqrt(bx * bx + by * by + bz * bz);
          if (al > 1e-6 && bl > 1e-6) {
            const dot = MathUtils.clamp((ax * bx + ay * by + az * bz) / (al * bl), -1, 1);
            this.curvatureScratch[point] = Math.acos(dot) / Math.PI;
          } else {
            this.curvatureScratch[point] = 0;
          }
        }

        this.displacementScratch[point] =
          Math.sqrt(p1[0] * p1[0] + p1[1] * p1[1] + p1[2] * p1[2]) / maxDistance;
      }

      this.blurAttributes(this.curvatureScratch, filled, this.gradientBlur);
      this.blurAttributes(this.displacementScratch, filled, this.gradientBlur);

      for (let point = 0; point < filled - 1; point += 1) {
        this.getTrailPoint(emitter, point, p0);
        this.getTrailPoint(emitter, point + 1, p1);

        const c0 = MathUtils.clamp(this.curvatureScratch[point], 0, 1);
        const c1 = MathUtils.clamp(this.curvatureScratch[point + 1], 0, 1);
        const d0 = MathUtils.clamp(this.displacementScratch[point], 0, 1);
        const d1 = MathUtils.clamp(this.displacementScratch[point + 1], 0, 1);

        let write = writeVertex * 3;
        positions[write] = p0[0];
        positions[write + 1] = p0[1];
        positions[write + 2] = p0[2];
        curvature[writeVertex] = c0;
        displacement[writeVertex] = d0;
        writeVertex += 1;

        write = writeVertex * 3;
        positions[write] = p1[0];
        positions[write + 1] = p1[1];
        positions[write + 2] = p1[2];
        curvature[writeVertex] = c1;
        displacement[writeVertex] = d1;
        writeVertex += 1;
      }
    }

    this.activeVertexCount = writeVertex;

    this.positionAttr.needsUpdate = true;
    this.curvatureAttr.needsUpdate = true;
    this.displacementAttr.needsUpdate = true;
    this.geometry.setDrawRange(0, this.activeVertexCount);
    this.geometry.computeBoundingSphere();
  }

  private blurAttributes(buffer: Float32Array, count: number, strength: number): void {
    if (count <= 2 || strength <= 0) {
      return;
    }

    const passes = Math.max(1, Math.round(strength * 6));
    const amount = MathUtils.clamp(strength * 0.55, 0, 0.55);
    const temp = new Float32Array(count);

    for (let pass = 0; pass < passes; pass += 1) {
      temp[0] = buffer[0];
      temp[count - 1] = buffer[count - 1];
      for (let i = 1; i < count - 1; i += 1) {
        const avg = (buffer[i - 1] + buffer[i] + buffer[i + 1]) / 3;
        temp[i] = MathUtils.lerp(buffer[i], avg, amount);
      }
      for (let i = 1; i < count - 1; i += 1) {
        buffer[i] = temp[i];
      }
    }
  }

  private sampleCurl(x: number, y: number, z: number, t: number): { x: number; y: number; z: number } {
    const scale = Math.max(0.0001, this.growthSettings.noiseScale);
    const vorticity = Math.max(0, this.growthSettings.vorticity);
    const strength = Math.max(0, this.growthSettings.noiseStrength);
    const epsilon = 0.01;

    const sample = (nx: number, ny: number, nz: number): { x: number; y: number; z: number } => {
      const sx = nx * scale;
      const sy = ny * scale;
      const sz = nz * scale;
      return {
        x: this.noiseA.noise3d(sy + t, sz, sx),
        y: this.noiseB.noise3d(sz, sx + t * 0.87, sy),
        z: this.noiseC.noise3d(sx, sy, sz + t * 1.13),
      };
    };

    const y1 = sample(x, y + epsilon, z);
    const y0 = sample(x, y - epsilon, z);
    const z1 = sample(x, y, z + epsilon);
    const z0 = sample(x, y, z - epsilon);
    const x1 = sample(x + epsilon, y, z);
    const x0 = sample(x - epsilon, y, z);

    const twoEps = 2 * epsilon;
    const dFzDy = (y1.z - y0.z) / twoEps;
    const dFyDz = (z1.y - z0.y) / twoEps;
    const dFxDz = (z1.x - z0.x) / twoEps;
    const dFzDx = (x1.z - x0.z) / twoEps;
    const dFyDx = (x1.y - x0.y) / twoEps;
    const dFxDy = (y1.x - y0.x) / twoEps;

    return {
      x: (dFzDy - dFyDz) * strength * vorticity,
      y: (dFxDz - dFzDx) * strength * vorticity,
      z: (dFyDx - dFxDy) * strength * vorticity,
    };
  }
}
