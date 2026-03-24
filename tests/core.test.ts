import { describe, expect, it } from 'vitest';
import { BufferAttribute } from 'three';
import { SwarmTrailsEngine } from '../src/core/swarmTrailsEngine';
import type { EmitterSettings, GrowthSettings, ParticleSettings } from '../src/types';

const baseEmitter: EmitterSettings = {
  countX: 3,
  countY: 3,
  countZ: 3,
  spacingX: 0.4,
  spacingY: 0.3,
  spacingZ: 0.2,
};

const baseParticles: ParticleSettings = {
  trailLength: 32,
  generationDistance: 0.02,
};

const baseGrowth: GrowthSettings = {
  noiseScale: 0.8,
  noiseSpeed: 0.3,
  noiseStrength: 1.1,
  vorticity: 1,
  attraction: 0.2,
  damping: 0.985,
};

function mean(values: Float32Array, axis: 0 | 1 | 2): number {
  let sum = 0;
  for (let i = axis; i < values.length; i += 3) {
    sum += values[i];
  }
  return sum / (values.length / 3);
}

function trailPointsInOrder(
  trailPoints: Float32Array,
  trailLength: number,
  headIndex: number,
  filled: number,
): number[] {
  const ordered: number[] = [];
  const oldest = (headIndex - (filled - 1) + trailLength) % trailLength;
  for (let i = 0; i < filled; i += 1) {
    const ring = (oldest + i) % trailLength;
    const base = ring * 3;
    ordered.push(trailPoints[base], trailPoints[base + 1], trailPoints[base + 2]);
  }
  return ordered;
}

describe('SwarmTrailsEngine emitter grid', () => {
  it('centers emitter points around origin for odd and even counts', () => {
    const oddEngine = new SwarmTrailsEngine(baseEmitter, baseParticles, baseGrowth, 42);
    const odd = oddEngine.exportSnapshot().heads;
    expect(Math.abs(mean(odd, 0))).toBeLessThan(1e-8);
    expect(Math.abs(mean(odd, 1))).toBeLessThan(1e-8);
    expect(Math.abs(mean(odd, 2))).toBeLessThan(1e-8);

    const evenEngine = new SwarmTrailsEngine(
      { ...baseEmitter, countX: 4, countY: 2, countZ: 6 },
      baseParticles,
      baseGrowth,
      42,
    );
    const even = evenEngine.exportSnapshot().heads;
    expect(Math.abs(mean(even, 0))).toBeLessThan(1e-8);
    expect(Math.abs(mean(even, 1))).toBeLessThan(1e-8);
    expect(Math.abs(mean(even, 2))).toBeLessThan(1e-8);
  });
});

describe('SwarmTrailsEngine trail generation', () => {
  it('keeps fixed-length trails and approximately respects generation distance', () => {
    const engine = new SwarmTrailsEngine(
      { countX: 1, countY: 1, countZ: 1, spacingX: 0.2, spacingY: 0.2, spacingZ: 0.2 },
      { trailLength: 20, generationDistance: 0.015 },
      { ...baseGrowth, attraction: 0.05 },
      77,
    );

    for (let i = 0; i < 140; i += 1) {
      engine.step(1 / 60, 1.2);
    }

    const snapshot = engine.exportSnapshot();
    const filled = snapshot.filledLengths[0];
    expect(filled).toBeLessThanOrEqual(20);
    expect(filled).toBeGreaterThan(5);

    const ordered = trailPointsInOrder(snapshot.trailPoints, 20, snapshot.headIndices[0], filled);
    let total = 0;
    let segments = 0;
    for (let i = 0; i < ordered.length - 3; i += 3) {
      const dx = ordered[i + 3] - ordered[i];
      const dy = ordered[i + 4] - ordered[i + 1];
      const dz = ordered[i + 5] - ordered[i + 2];
      total += Math.sqrt(dx * dx + dy * dy + dz * dz);
      segments += 1;
    }

    const avg = total / Math.max(segments, 1);
    expect(avg).toBeGreaterThan(0.005);
    expect(avg).toBeLessThan(0.04);
  });
});

describe('SwarmTrailsEngine determinism and snapshots', () => {
  it('produces deterministic continuation after snapshot restore', () => {
    const engineA = new SwarmTrailsEngine(baseEmitter, baseParticles, baseGrowth, 314159);
    const engineB = new SwarmTrailsEngine(baseEmitter, baseParticles, baseGrowth, 314159);

    for (let i = 0; i < 40; i += 1) {
      engineA.step(1 / 60, 1);
      engineB.step(1 / 60, 1);
    }

    const headsA = engineA.exportSnapshot().heads;
    const headsB = engineB.exportSnapshot().heads;
    let maxDelta = 0;
    for (let i = 0; i < headsA.length; i += 1) {
      maxDelta = Math.max(maxDelta, Math.abs(headsA[i] - headsB[i]));
    }
    expect(maxDelta).toBeLessThan(1e-9);

    const snapshot = engineA.exportSnapshot();
    engineA.step(1 / 60, 1.1);
    const forward = engineA.exportSnapshot().heads;

    engineA.importSnapshot(snapshot);
    engineA.step(1 / 60, 1.1);
    const restoredForward = engineA.exportSnapshot().heads;

    let maxRestoreDelta = 0;
    for (let i = 0; i < forward.length; i += 1) {
      maxRestoreDelta = Math.max(maxRestoreDelta, Math.abs(forward[i] - restoredForward[i]));
    }
    expect(maxRestoreDelta).toBeLessThan(1e-9);
  });
});

describe('SwarmTrailsEngine render attributes', () => {
  it('keeps curvature and displacement attributes in [0, 1]', () => {
    const engine = new SwarmTrailsEngine(baseEmitter, baseParticles, baseGrowth, 9);
    for (let i = 0; i < 80; i += 1) {
      engine.step(1 / 60, 1);
    }

    const geometry = engine.getGeometry();
    const active = engine.getActiveVertexCount();
    const curvature = geometry.getAttribute('aCurvature') as BufferAttribute;
    const displacement = geometry.getAttribute('aDisplacement') as BufferAttribute;

    let cMin = Infinity;
    let cMax = -Infinity;
    let dMin = Infinity;
    let dMax = -Infinity;
    for (let i = 0; i < active; i += 1) {
      cMin = Math.min(cMin, curvature.getX(i));
      cMax = Math.max(cMax, curvature.getX(i));
      dMin = Math.min(dMin, displacement.getX(i));
      dMax = Math.max(dMax, displacement.getX(i));
    }

    expect(cMin).toBeGreaterThanOrEqual(0);
    expect(cMax).toBeLessThanOrEqual(1);
    expect(dMin).toBeGreaterThanOrEqual(0);
    expect(dMax).toBeLessThanOrEqual(1);
  });
});
