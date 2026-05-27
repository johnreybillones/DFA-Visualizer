import { describe, expect, test } from "vitest";
import { automataCatalog } from "../data/automataCatalog";
import type { DfaGraph } from "../types/dfa";
import {
  getEdgeLayouts,
  getGraphBounds,
  getPointOnEdge,
} from "./graphGeometry";

const customGraph: DfaGraph = {
  automataType: "DFA",
  nodeNum: 4,
  finalNodes: ["q3"],
  nodeMap: {
    q0: { id: "q0", x: 0, y: 0 },
    q1: { id: "q1", x: 200, y: 0 },
    q2: { id: "q2", x: 0, y: 180 },
    q3: { id: "q3", x: 220, y: 180 },
  },
  transitionMap: {
    q0: [
      { label: "a", sourceid: "q0", targetid: "q1" },
      { label: "b", sourceid: "q0", targetid: "q1" },
    ],
    q1: [
      { label: "c", sourceid: "q1", targetid: "q0" },
      { label: "d", sourceid: "q1", targetid: "q1" },
    ],
    q2: [{ label: "e", sourceid: "q2", targetid: "q3" }],
    q3: [],
  },
};

describe("graphGeometry", () => {
  test("computes graph bounds from DFA coordinates", () => {
    const bounds = getGraphBounds(automataCatalog.regex1.dfa);

    expect(bounds.minX).toBeCloseTo(671.3202825715698);
    expect(bounds.maxX).toBeCloseTo(2620.3804496709927);
    expect(bounds.minY).toBeCloseTo(-88.00975868092519);
    expect(bounds.maxY).toBeCloseTo(566.0567698589734);
    expect(bounds.width).toBeCloseTo(1949.060167099423);
    expect(bounds.height).toBeCloseTo(654.0665285398986);
  });

  test("builds straight edge layouts for normal directed edges", () => {
    const layouts = getEdgeLayouts(automataCatalog.regex1.dfa);
    const edge = layouts.find((item) => item.key === "q0->q1:A,B:0");

    expect(edge).toBeDefined();
    expect(edge?.kind).toBe("line");
    expect(edge?.path).toMatch(/^M /);
    expect(edge?.labelPoint.x).toBeGreaterThan(700);
    expect(edge?.labelPoint.y).toBeLessThan(430);
  });

  test("curves bidirectional and repeated edges apart", () => {
    const layouts = getEdgeLayouts(customGraph, { nodeRadius: 24 });
    const repeatedA = layouts.find((item) => item.key === "q0->q1:a:0");
    const repeatedB = layouts.find((item) => item.key === "q0->q1:b:1");
    const reverse = layouts.find((item) => item.key === "q1->q0:c:0");

    expect(repeatedA?.kind).toBe("quadratic");
    expect(repeatedB?.kind).toBe("quadratic");
    expect(reverse?.kind).toBe("quadratic");
    expect(repeatedA?.controlPoint?.y).not.toBe(repeatedB?.controlPoint?.y);
    expect(repeatedA?.controlPoint?.y).not.toBe(reverse?.controlPoint?.y);
  });

  test("creates self-loop geometry and elevated label points", () => {
    const layouts = getEdgeLayouts(customGraph, { nodeRadius: 24 });
    const loop = layouts.find((item) => item.key === "q1->q1:d:0");

    expect(loop?.kind).toBe("loop");
    expect(loop?.path).toContain("C");
    expect(loop?.labelPoint.y).toBeLessThan(customGraph.nodeMap.q1.y);
  });

  test("interpolates token positions along edges", () => {
    const layouts = getEdgeLayouts(customGraph, { nodeRadius: 24 });
    const edge = layouts.find((item) => item.key === "q2->q3:e:0");

    expect(edge).toBeDefined();

    const start = getPointOnEdge(edge!, 0);
    const middle = getPointOnEdge(edge!, 0.5);
    const end = getPointOnEdge(edge!, 1);

    expect(start.x).toBeLessThan(middle.x);
    expect(middle.x).toBeLessThan(end.x);
    expect(start.y).toBeCloseTo(180, 0);
    expect(end.y).toBeCloseTo(180, 0);
  });
});
