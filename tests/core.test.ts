import { describe, expect, it } from 'vitest';
import { BufferAttribute, BufferGeometry } from 'three';
import {
  buildActiveLineGeometry,
  buildObjMeshWithVertexColors,
  buildObjWithVertexColors,
} from '../src/core/exportUtils';
import { buildTrailMeshGeometry } from '../src/core/trailMeshBuilder';
import { SwarmTrailsEngine } from '../src/core/swarmTrailsEngine';
import type {
  EmitterSettings,
  GrowthSettings,
  MaterialSettings,
  ParticleSettings,
} from '../src/types';
import type { TrailStateView } from '../src/core/swarmTrailsEngine';

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
  trailThickness: 1,
  discreteResolution: 6,
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
      { trailLength: 20, generationDistance: 0.015, trailThickness: 1, discreteResolution: 6 },
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
    let minSegment = Number.POSITIVE_INFINITY;
    for (let i = 0; i < ordered.length - 3; i += 3) {
      const dx = ordered[i + 3] - ordered[i];
      const dy = ordered[i + 4] - ordered[i + 1];
      const dz = ordered[i + 5] - ordered[i + 2];
      const segmentLength = Math.sqrt(dx * dx + dy * dy + dz * dz);
      total += segmentLength;
      minSegment = Math.min(minSegment, segmentLength);
      segments += 1;
    }

    const avg = total / Math.max(segments, 1);
    expect(avg).toBeGreaterThan(0.005);
    expect(avg).toBeLessThan(0.04);
    expect(minSegment).toBeGreaterThan(1e-6);
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

  it('supports scrub/resume continuation from a timeline snapshot', () => {
    const engine = new SwarmTrailsEngine(baseEmitter, baseParticles, baseGrowth, 451);
    const timeline = [engine.exportSnapshot()];

    for (let i = 0; i < 30; i += 1) {
      engine.step(1 / 60, 1);
      timeline.push(engine.exportSnapshot());
    }

    const scrubStep = 12;
    const finalExpected = timeline[timeline.length - 1].heads;
    engine.importSnapshot(timeline[scrubStep]);
    for (let i = scrubStep; i < 30; i += 1) {
      engine.step(1 / 60, 1);
    }
    const resumedFinal = engine.exportSnapshot().heads;

    let maxDelta = 0;
    for (let i = 0; i < finalExpected.length; i += 1) {
      maxDelta = Math.max(maxDelta, Math.abs(finalExpected[i] - resumedFinal[i]));
    }
    expect(maxDelta).toBeLessThan(1e-9);
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

describe('Export utilities', () => {
  it('builds OBJ line output with per-vertex colors', () => {
    const engine = new SwarmTrailsEngine(baseEmitter, baseParticles, baseGrowth, 73);
    for (let i = 0; i < 50; i += 1) {
      engine.step(1 / 60, 1);
    }

    const geometry = engine.getGeometry();
    const active = engine.getActiveVertexCount();
    expect(active).toBeGreaterThan(2);

    const colors = new Float32Array(active * 3);
    colors.fill(0.5);
    const obj = buildObjWithVertexColors(geometry, active, colors);

    const vertexLines = obj.match(/^v /gm)?.length ?? 0;
    const lineLines = obj.match(/^l /gm)?.length ?? 0;
    expect(vertexLines).toBe(active);
    expect(lineLines).toBe(Math.floor(active / 2));
  });

  it('builds active line geometry sized to draw range', () => {
    const engine = new SwarmTrailsEngine(baseEmitter, baseParticles, baseGrowth, 74);
    for (let i = 0; i < 50; i += 1) {
      engine.step(1 / 60, 1);
    }

    const source = engine.getGeometry();
    const active = engine.getActiveVertexCount();
    const colors = new Float32Array(active * 3);
    colors.fill(0.25);

    const clone = buildActiveLineGeometry(source, active, colors);
    const clonePos = clone.getAttribute('position') as BufferAttribute;
    const cloneColor = clone.getAttribute('color') as BufferAttribute;
    expect(clonePos.count).toBe(active);
    expect(cloneColor.count).toBe(active);
    expect(clone.drawRange.count).toBe(active);
    clone.dispose();
  });

  it('builds OBJ mesh output with per-vertex colors and indexed faces', () => {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3),
    );
    geometry.setAttribute(
      'color',
      new BufferAttribute(new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]), 3),
    );
    geometry.setIndex([0, 1, 2]);

    const obj = buildObjMeshWithVertexColors(geometry);
    const vertexLines = obj.match(/^v /gm)?.length ?? 0;
    const faceLines = obj.match(/^f /gm)?.length ?? 0;
    expect(vertexLines).toBe(3);
    expect(faceLines).toBe(1);
    geometry.dispose();
  });
});

describe('Trail mesh builder', () => {
  it('closes start and end caps for a simple single-segment trail', () => {
    const state: TrailStateView = {
      trailPoints: new Float32Array([0, 0, 0, 1, 0, 0]),
      headIndices: new Int32Array([1]),
      filledLengths: new Int32Array([2]),
      trailLength: 2,
      emitterCount: 1,
    };
    const particles: ParticleSettings = {
      trailLength: 2,
      generationDistance: 0.05,
      trailThickness: 2,
      discreteResolution: 6,
    };
    const material: MaterialSettings = {
      gradientType: 'curvature',
      gradientStart: '#ffffff',
      gradientEnd: '#000000',
      curvatureContrast: 1,
      curvatureBias: 0,
      gradientBlur: 0,
      fresnel: 0.5,
      specular: 0.4,
      bloom: 0.7,
    };

    const geometry = buildTrailMeshGeometry(state, particles, material);
    const position = geometry.getAttribute('position') as BufferAttribute;
    const index = geometry.getIndex();

    expect(position.count).toBe(16);
    expect(index?.count ?? 0).toBe(36);
    geometry.dispose();
  });
});
