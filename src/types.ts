export type SimulationSettings = {
  growthSpeed: number;
};

export type EmitterSettings = {
  countX: number;
  countY: number;
  countZ: number;
  spacingX: number;
  spacingY: number;
  spacingZ: number;
};

export type ParticleSettings = {
  generationDistance: number;
  thicknessMin: number;
  thicknessMax: number;
  thicknessSeed: number;
  discreteResolution: number;
};

export type GrowthSettings = {
  seed: number;
  noiseScale: number;
  noiseSpeed: number;
  noiseStrength: number;
  octaves: number;
  lacunarity: number;
  gain: number;
  warpStrength: number;
  warpScale: number;
  vorticity: number;
  attraction: number;
  repulsion: number;
  alignmentStrength: number;
  divergenceStrength: number;
  divergenceRadius: number;
  alignmentRadius: number;
  damping: number;
};

export type MaterialSettings = {
  gradientStart: string;
  gradientEnd: string;
  curvatureContrast: number;
  curvatureBias: number;
  gradientBlur: number;
  fresnel: number;
  specular: number;
  bloom: number;
};

export type AppState = {
  running: boolean;
};
