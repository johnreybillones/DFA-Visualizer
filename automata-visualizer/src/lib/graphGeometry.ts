import type { DfaGraph, DfaTransition } from "../types/dfa";

export interface Point {
  x: number;
  y: number;
}

export interface GraphBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface EdgeLayout {
  key: string;
  kind: "line" | "quadratic" | "loop";
  label: string;
  sourceId: string;
  targetId: string;
  startPoint: Point;
  endPoint: Point;
  controlPoint?: Point;
  controlPoints?: [Point, Point];
  labelPoint: Point;
  path: string;
}

interface EdgeLayoutOptions {
  nodeRadius?: number;
  curveOffset?: number;
  loopHeight?: number;
}

interface IndexedTransition {
  transition: DfaTransition;
  pairIndex: number;
  pairCount: number;
  reverseCount: number;
}

const DEFAULT_NODE_RADIUS = 28;
const DEFAULT_CURVE_OFFSET = 46;
const DEFAULT_LOOP_HEIGHT = 86;

function pointFrom(origin: Point, angle: number, distance: number): Point {
  return {
    x: origin.x + Math.cos(angle) * distance,
    y: origin.y + Math.sin(angle) * distance,
  };
}

function formatPoint(point: Point): string {
  return `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
}

function getPairOffset(index: number, total: number, spread: number): number {
  return (index - (total - 1) / 2) * spread;
}

function normalizeDirectionSign(sourceId: string, targetId: string): number {
  return sourceId.localeCompare(targetId) <= 0 ? -1 : 1;
}

function quadraticPoint(start: Point, control: Point, end: Point, t: number): Point {
  const oneMinusT = 1 - t;
  return {
    x: oneMinusT ** 2 * start.x + 2 * oneMinusT * t * control.x + t ** 2 * end.x,
    y: oneMinusT ** 2 * start.y + 2 * oneMinusT * t * control.y + t ** 2 * end.y,
  };
}

function cubicPoint(
  start: Point,
  control1: Point,
  control2: Point,
  end: Point,
  t: number,
): Point {
  const oneMinusT = 1 - t;
  return {
    x:
      oneMinusT ** 3 * start.x +
      3 * oneMinusT ** 2 * t * control1.x +
      3 * oneMinusT * t ** 2 * control2.x +
      t ** 3 * end.x,
    y:
      oneMinusT ** 3 * start.y +
      3 * oneMinusT ** 2 * t * control1.y +
      3 * oneMinusT * t ** 2 * control2.y +
      t ** 3 * end.y,
  };
}

function buildIndexedTransitions(dfa: DfaGraph): IndexedTransition[] {
  const pairCounts = new Map<string, number>();
  const reverseCounts = new Map<string, number>();

  for (const transitions of Object.values(dfa.transitionMap)) {
    for (const transition of transitions) {
      const pairKey = `${transition.sourceid}->${transition.targetid}`;
      pairCounts.set(pairKey, (pairCounts.get(pairKey) ?? 0) + 1);
    }
  }

  for (const [pairKey] of pairCounts) {
    const [sourceId, targetId] = pairKey.split("->");
    reverseCounts.set(pairKey, pairCounts.get(`${targetId}->${sourceId}`) ?? 0);
  }

  const emitted = new Map<string, number>();
  const indexed: IndexedTransition[] = [];

  for (const transitions of Object.values(dfa.transitionMap)) {
    for (const transition of transitions) {
      const pairKey = `${transition.sourceid}->${transition.targetid}`;
      const nextIndex = emitted.get(pairKey) ?? 0;

      indexed.push({
        transition,
        pairIndex: nextIndex,
        pairCount: pairCounts.get(pairKey) ?? 1,
        reverseCount: reverseCounts.get(pairKey) ?? 0,
      });

      emitted.set(pairKey, nextIndex + 1);
    }
  }

  return indexed;
}

export function getGraphBounds(dfa: DfaGraph): GraphBounds {
  const nodes = Object.values(dfa.nodeMap);
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function getEdgeLayouts(
  dfa: DfaGraph,
  options: EdgeLayoutOptions = {},
): EdgeLayout[] {
  const nodeRadius = options.nodeRadius ?? DEFAULT_NODE_RADIUS;
  const curveOffset = options.curveOffset ?? DEFAULT_CURVE_OFFSET;
  const loopHeight = options.loopHeight ?? DEFAULT_LOOP_HEIGHT;

  return buildIndexedTransitions(dfa).map(
    ({ transition, pairIndex, pairCount, reverseCount }) => {
      const source = dfa.nodeMap[transition.sourceid];
      const target = dfa.nodeMap[transition.targetid];
      const key = `${transition.sourceid}->${transition.targetid}:${transition.label}:${pairIndex}`;

      if (source.id === target.id) {
        const startPoint = pointFrom(source, -Math.PI / 4, nodeRadius);
        const endPoint = pointFrom(source, (-3 * Math.PI) / 4, nodeRadius);
        const control1: Point = {
          x: source.x + nodeRadius * 1.4,
          y: source.y - loopHeight,
        };
        const control2: Point = {
          x: source.x - nodeRadius * 1.4,
          y: source.y - loopHeight,
        };

        return {
          key,
          kind: "loop",
          label: transition.label,
          sourceId: source.id,
          targetId: target.id,
          startPoint,
          endPoint,
          controlPoints: [control1, control2],
          labelPoint: {
            x: source.x,
            y: source.y - loopHeight - 14,
          },
          path: `M ${formatPoint(startPoint)} C ${formatPoint(control1)} ${formatPoint(control2)} ${formatPoint(endPoint)}`,
        };
      }

      const angle = Math.atan2(target.y - source.y, target.x - source.x);
      const midpoint = {
        x: (source.x + target.x) / 2,
        y: (source.y + target.y) / 2,
      };
      const perpendicular = {
        x: -Math.sin(angle),
        y: Math.cos(angle),
      };
      const parallelOffset = getPairOffset(pairIndex, pairCount, 26);
      const reverseOffset =
        reverseCount > 0 ? normalizeDirectionSign(source.id, target.id) * curveOffset : 0;
      const totalOffset = parallelOffset + reverseOffset;

      if (totalOffset === 0) {
        const startPoint = pointFrom(source, angle, nodeRadius);
        const endPoint = pointFrom(target, angle + Math.PI, nodeRadius);
        const labelPoint = {
          x: midpoint.x + perpendicular.x * 14,
          y: midpoint.y + perpendicular.y * 14,
        };

        return {
          key,
          kind: "line",
          label: transition.label,
          sourceId: source.id,
          targetId: target.id,
          startPoint,
          endPoint,
          labelPoint,
          path: `M ${formatPoint(startPoint)} L ${formatPoint(endPoint)}`,
        };
      }

      const controlPoint = {
        x: midpoint.x + perpendicular.x * totalOffset,
        y: midpoint.y + perpendicular.y * totalOffset,
      };
      const startAngle = Math.atan2(controlPoint.y - source.y, controlPoint.x - source.x);
      const endAngle = Math.atan2(controlPoint.y - target.y, controlPoint.x - target.x);
      const startPoint = pointFrom(source, startAngle, nodeRadius);
      const endPoint = pointFrom(target, endAngle, nodeRadius);
      const labelAnchor = quadraticPoint(startPoint, controlPoint, endPoint, 0.5);

      return {
        key,
        kind: "quadratic",
        label: transition.label,
        sourceId: source.id,
        targetId: target.id,
        startPoint,
        endPoint,
        controlPoint,
        labelPoint: {
          x: labelAnchor.x + perpendicular.x * 10,
          y: labelAnchor.y + perpendicular.y * 10,
        },
        path: `M ${formatPoint(startPoint)} Q ${formatPoint(controlPoint)} ${formatPoint(endPoint)}`,
      };
    },
  );
}

export function getPointOnEdge(edge: EdgeLayout, progress: number): Point {
  const clamped = Math.max(0, Math.min(1, progress));

  if (edge.kind === "line") {
    return {
      x: edge.startPoint.x + (edge.endPoint.x - edge.startPoint.x) * clamped,
      y: edge.startPoint.y + (edge.endPoint.y - edge.startPoint.y) * clamped,
    };
  }

  if (edge.kind === "quadratic" && edge.controlPoint) {
    return quadraticPoint(edge.startPoint, edge.controlPoint, edge.endPoint, clamped);
  }

  if (edge.kind === "loop" && edge.controlPoints) {
    const [control1, control2] = edge.controlPoints;
    return cubicPoint(edge.startPoint, control1, control2, edge.endPoint, clamped);
  }

  return edge.endPoint;
}
