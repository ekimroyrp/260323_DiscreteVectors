import { ShaderMaterial, Vector3 } from 'three';
import type { MaterialSettings } from '../types';

export class MaterialController {
  readonly material: ShaderMaterial;

  constructor(settings: MaterialSettings) {
    this.material = new ShaderMaterial({
      uniforms: {
        uFresnel: { value: settings.fresnel },
        uSpecular: { value: settings.specular },
        uLightDirA: { value: new Vector3(0.65, 0.8, 0.42).normalize() },
        uLightDirB: { value: new Vector3(-0.42, 0.24, 0.88).normalize() },
      },
      vertexShader: `
        attribute vec3 color;

        varying vec3 vColor;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;

        void main() {
          vColor = color;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        precision highp float;

        varying vec3 vColor;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;

        uniform float uFresnel;
        uniform float uSpecular;
        uniform vec3 uLightDirA;
        uniform vec3 uLightDirB;

        float saturate(float value) {
          return clamp(value, 0.0, 1.0);
        }

        void main() {
          vec3 baseColor = vColor;
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          vec3 worldNormal = normalize(vWorldNormal);
          vec3 lightA = normalize(uLightDirA);
          vec3 lightB = normalize(uLightDirB);

          float wrap = 0.3;
          float diffA = max((dot(worldNormal, lightA) + wrap) / (1.0 + wrap), 0.0);
          float diffB = max((dot(worldNormal, lightB) + wrap) / (1.0 + wrap), 0.0);
          float specA = pow(max(dot(reflect(-lightA, worldNormal), viewDir), 0.0), 36.0);
          float specB = pow(max(dot(reflect(-lightB, worldNormal), viewDir), 0.0), 20.0);
          float fresnel = pow(1.0 - saturate(dot(worldNormal, viewDir)), 3.0);

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
    this.material.uniforms.uFresnel.value = settings.fresnel;
    this.material.uniforms.uSpecular.value = settings.specular;
  }

  dispose(): void {
    this.material.dispose();
  }
}
