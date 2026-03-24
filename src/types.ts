export type GradientType = 'curvature' | 'displacement';

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
  trailLength: number;
  generationDistance: number;
  trailThickness: number;
};

export type GrowthSettings = {
  noiseScale: number;
  noiseSpeed: number;
  noiseStrength: number;
  vorticity: number;
  attraction: number;
  damping: number;
};

export type MaterialSettings = {
  gradientType: GradientType;
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
