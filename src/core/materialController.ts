import { Color, ShaderMaterial, Vector3 } from 'three';
import type { MaterialSettings } from '../types';

export class MaterialController {
  readonly material: ShaderMaterial;

  constructor(settings: MaterialSettings) {
    this.material = new ShaderMaterial({
      uniforms: {
        uGradientStart: { value: new Color(settings.gradientStart) },
        uGradientEnd: { value: new Color(settings.gradientEnd) },
        uGradientType: { value: settings.gradientType === 'displacement' ? 1.0 : 0.0 },
        uCurvatureContrast: { value: settings.curvatureContrast },
        uCurvatureBias: { value: settings.curvatureBias },
        uFresnel: { value: settings.fresnel },
        uSpecular: { value: settings.specular },
        uLightDirA: { value: new Vector3(0.65, 0.8, 0.42).normalize() },
        uLightDirB: { value: new Vector3(-0.42, 0.24, 0.88).normalize() },
      },
      vertexShader: `
        attribute float aCurvature;
        attribute float aDisplacement;

        varying float vCurvature;
        varying float vDisplacement;
        varying vec3 vWorldPos;

        void main() {
          vCurvature = aCurvature;
          vDisplacement = aDisplacement;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        precision highp float;

        varying float vCurvature;
        varying float vDisplacement;
        varying vec3 vWorldPos;

        uniform vec3 uGradientStart;
        uniform vec3 uGradientEnd;
        uniform float uGradientType;
        uniform float uCurvatureContrast;
        uniform float uCurvatureBias;
        uniform float uFresnel;
        uniform float uSpecular;
        uniform vec3 uLightDirA;
        uniform vec3 uLightDirB;

        float saturate(float value) {
          return clamp(value, 0.0, 1.0);
        }

        void main() {
          float sourceValue = mix(vCurvature, vDisplacement, step(0.5, uGradientType));
          float t = saturate(sourceValue * uCurvatureContrast + uCurvatureBias);
          vec3 baseColor = mix(uGradientStart, uGradientEnd, t);

          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          vec3 pseudoNormal = normalize(vWorldPos + vec3(0.0001, 0.0002, 0.0003));
          vec3 lightA = normalize(uLightDirA);
          vec3 lightB = normalize(uLightDirB);

          float wrap = 0.3;
          float diffA = max((dot(pseudoNormal, lightA) + wrap) / (1.0 + wrap), 0.0);
          float diffB = max((dot(pseudoNormal, lightB) + wrap) / (1.0 + wrap), 0.0);
          float specA = pow(max(dot(reflect(-lightA, pseudoNormal), viewDir), 0.0), 36.0);
          float specB = pow(max(dot(reflect(-lightB, pseudoNormal), viewDir), 0.0), 20.0);
          float fresnel = pow(1.0 - max(dot(pseudoNormal, viewDir), 0.0), 3.0);

          vec3 color = baseColor * (0.16 + 0.84 * (diffA * 0.85 + diffB * 0.45));
          color += vec3(1.0) * (specA + specB * 0.45) * uSpecular;
          color += baseColor * fresnel * uFresnel;
          color = mix(color, color * color * 1.25, 0.2);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }

  setMaterialSettings(settings: MaterialSettings): void {
    this.material.uniforms.uGradientType.value = settings.gradientType === 'displacement' ? 1.0 : 0.0;
    this.material.uniforms.uGradientStart.value.set(settings.gradientStart);
    this.material.uniforms.uGradientEnd.value.set(settings.gradientEnd);
    this.material.uniforms.uCurvatureContrast.value = settings.curvatureContrast;
    this.material.uniforms.uCurvatureBias.value = settings.curvatureBias;
    this.material.uniforms.uFresnel.value = settings.fresnel;
    this.material.uniforms.uSpecular.value = settings.specular;
  }

  dispose(): void {
    this.material.dispose();
  }
}
