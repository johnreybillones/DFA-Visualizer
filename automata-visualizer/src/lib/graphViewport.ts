import type { GraphBounds } from "./graphGeometry";

export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

export interface FitViewportOptions {
  width: number;
  height: number;
  padding: number;
  minScale: number;
  maxScale: number;
}

export function clampScale(scale: number, minScale: number, maxScale: number): number {
  return Math.max(minScale, Math.min(maxScale, scale));
}

export function fitGraphToViewport(
  bounds: GraphBounds,
  options: FitViewportOptions,
): ViewportTransform {
  const availableWidth = options.width - options.padding * 2;
  const availableHeight = options.height - options.padding * 2;
  const scale = clampScale(
    Math.min(availableWidth / bounds.width, availableHeight / bounds.height),
    options.minScale,
    options.maxScale,
  );

  return {
    scale,
    x: options.width / 2 - (bounds.minX + bounds.width / 2) * scale,
    y: options.height / 2 - (bounds.minY + bounds.height / 2) * scale,
  };
}

export function panViewport(
  transform: ViewportTransform,
  delta: { x: number; y: number },
): ViewportTransform {
  return {
    ...transform,
    x: transform.x + delta.x,
    y: transform.y + delta.y,
  };
}

export function zoomViewportAtPoint(
  transform: ViewportTransform,
  point: { x: number; y: number },
  scaleFactor: number,
  limits: { minScale: number; maxScale: number },
): ViewportTransform {
  const nextScale = clampScale(
    transform.scale * scaleFactor,
    limits.minScale,
    limits.maxScale,
  );
  const ratio = nextScale / transform.scale;

  return {
    scale: nextScale,
    x: point.x - (point.x - transform.x) * ratio,
    y: point.y - (point.y - transform.y) * ratio,
  };
}

export function resetViewport(
  bounds: GraphBounds,
  options: FitViewportOptions,
): ViewportTransform {
  return fitGraphToViewport(bounds, options);
}
