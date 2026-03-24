import { BufferAttribute, BufferGeometry } from 'three';

export function buildObjWithVertexColors(
  geometry: BufferGeometry,
  vertexCount: number,
  colors: Float32Array,
): string {
  const position = geometry.getAttribute('position') as BufferAttribute;
  const format = (value: number): string => value.toFixed(6);
  const linesOut: string[] = [];
  linesOut.push('# Swarm trails OBJ export');
  linesOut.push('# Vertex colors encoded as: v x y z r g b');

  for (let i = 0; i < vertexCount; i += 1) {
    const colorIndex = i * 3;
    linesOut.push(
      `v ${format(position.getX(i))} ${format(position.getY(i))} ${format(position.getZ(i))} ${format(colors[colorIndex])} ${format(colors[colorIndex + 1])} ${format(colors[colorIndex + 2])}`,
    );
  }

  for (let i = 0; i < vertexCount; i += 2) {
    linesOut.push(`l ${i + 1} ${i + 2}`);
  }

  return `${linesOut.join('\n')}\n`;
}

export function buildActiveLineGeometry(
  sourceGeometry: BufferGeometry,
  activeVertexCount: number,
  colors?: Float32Array,
): BufferGeometry {
  const sourcePosition = sourceGeometry.getAttribute('position') as BufferAttribute;
  const positions = new Float32Array(activeVertexCount * 3);

  for (let i = 0; i < activeVertexCount; i += 1) {
    const write = i * 3;
    positions[write] = sourcePosition.getX(i);
    positions[write + 1] = sourcePosition.getY(i);
    positions[write + 2] = sourcePosition.getZ(i);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  if (colors && colors.length >= activeVertexCount * 3) {
    geometry.setAttribute('color', new BufferAttribute(colors.slice(0, activeVertexCount * 3), 3));
  }
  geometry.setDrawRange(0, activeVertexCount);
  return geometry;
}
