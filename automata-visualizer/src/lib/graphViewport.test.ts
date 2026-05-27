import { describe, expect, test } from "vitest";
import {
  clampScale,
  fitGraphToViewport,
  panViewport,
  resetViewport,
  zoomViewportAtPoint,
} from "./graphViewport";

describe("graphViewport", () => {
  const bounds = {
    minX: 100,
    maxX: 500,
    minY: 50,
    maxY: 250,
    width: 400,
    height: 200,
  };

  test("fits graph to viewport with padding", () => {
    const transform = fitGraphToViewport(bounds, {
      width: 800,
      height: 600,
      padding: 40,
      minScale: 0.4,
      maxScale: 3,
    });

    expect(transform.scale).toBeCloseTo(1.8);
    expect(transform.x).toBeCloseTo(-140);
    expect(transform.y).toBeCloseTo(30);
  });

  test("clamps zoom scale", () => {
    expect(clampScale(0.1, 0.5, 2)).toBe(0.5);
    expect(clampScale(1.2, 0.5, 2)).toBe(1.2);
    expect(clampScale(4, 0.5, 2)).toBe(2);
  });

  test("pans viewport by the supplied deltas", () => {
    expect(panViewport({ x: 10, y: 20, scale: 1 }, { x: -30, y: 15 })).toEqual({
      x: -20,
      y: 35,
      scale: 1,
    });
  });

  test("zooms around a focal point and respects clamps", () => {
    const transform = zoomViewportAtPoint(
      { x: 100, y: 120, scale: 1 },
      { x: 400, y: 300 },
      2.5,
      { minScale: 0.5, maxScale: 2 },
    );

    expect(transform.scale).toBe(2);
    expect(transform.x).toBeCloseTo(-200);
    expect(transform.y).toBeCloseTo(-60);
  });

  test("resets to the original fit transform", () => {
    const reset = resetViewport(bounds, {
      width: 800,
      height: 600,
      padding: 40,
      minScale: 0.4,
      maxScale: 3,
    });

    expect(reset).toEqual(
      fitGraphToViewport(bounds, {
        width: 800,
        height: 600,
        padding: 40,
        minScale: 0.4,
        maxScale: 3,
      }),
    );
  });
});
