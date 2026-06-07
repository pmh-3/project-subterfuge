import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/design-system';

export type ProductMarkVariant = 'full' | 'simple';

export interface ProductMarkProps {
  size?: number;
  /** `full` includes inner cross-links; `simple` is perimeter + diameters only. */
  variant?: ProductMarkVariant;
}

interface Point {
  x: number;
  y: number;
}

const VIEWBOX = 44;
const CENTER = VIEWBOX / 2;
const RADIUS = 16;
const NODE_RADIUS = 2.2;

function getPolygonVertices(count: number, cx: number, cy: number, radius: number): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

function getUniqueEdges(vertexCount: number, skip: number): [number, number][] {
  const edges: [number, number][] = [];
  const seen = new Set<string>();

  for (let index = 0; index < vertexCount; index += 1) {
    const target = (index + skip) % vertexCount;
    if (index === target) continue;

    const start = Math.min(index, target);
    const end = Math.max(index, target);
    const key = `${start}-${end}`;
    if (seen.has(key)) continue;

    seen.add(key);
    edges.push([start, end]);
  }

  return edges;
}

function edgePath(vertices: Point[], start: number, end: number): string {
  const from = vertices[start];
  const to = vertices[end];
  return `M${from.x} ${from.y} L${to.x} ${to.y}`;
}

/** Midnight Wire network mark: octagonal spy graph with corner nodes and cross-links. */
export function ProductMark({ size = 44, variant = 'full' }: ProductMarkProps) {
  const vertices = getPolygonVertices(8, CENTER, CENTER, RADIUS);
  const perimeterEdges = getUniqueEdges(8, 1);
  const innerSquareEdges = variant === 'full' ? getUniqueEdges(8, 2) : [];
  const diameterEdges = getUniqueEdges(8, 4);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
      {diameterEdges.map(([start, end]) => (
        <Path
          key={`diameter-${start}-${end}`}
          d={edgePath(vertices, start, end)}
          stroke={colors.border}
          strokeWidth="1"
        />
      ))}
      {innerSquareEdges.map(([start, end]) => (
        <Path
          key={`inner-${start}-${end}`}
          d={edgePath(vertices, start, end)}
          stroke={colors.border}
          strokeWidth="1"
        />
      ))}
      {perimeterEdges.map(([start, end]) => (
        <Path
          key={`ring-${start}-${end}`}
          d={edgePath(vertices, start, end)}
          stroke={colors.inkSecondary}
          strokeWidth="1.25"
        />
      ))}
      {vertices.map((vertex, index) => (
        <Circle
          key={`node-${index}`}
          cx={vertex.x}
          cy={vertex.y}
          r={NODE_RADIUS}
          fill={colors.accent}
        />
      ))}
    </Svg>
  );
}
