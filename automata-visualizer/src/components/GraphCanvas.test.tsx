import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { automataCatalog } from "../data/automataCatalog";
import type { SimulationStep } from "../types/dfa";
import { GraphCanvas } from "./GraphCanvas";

const activeStep: SimulationStep = {
  from: "q0",
  symbol: "a",
  to: "q1",
  edgeLabel: "A,B",
  edgeKey: "q0->q1:A,B:0",
};

describe("GraphCanvas", () => {
  test("renders graph nodes and keyboard-accessible viewport controls", () => {
    render(
      <div style={{ width: 960, height: 640 }}>
        <GraphCanvas
          dfa={automataCatalog.regex1.dfa}
          currentStateId="q1"
          visitedStates={["q0", "q1"]}
          activeStep={activeStep}
          playbackMode="running"
          result={null}
          speed={180}
          reducedMotion={false}
        />
      </div>,
    );

    expect(screen.getByRole("button", { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zoom out/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset view/i })).toBeInTheDocument();
    expect(screen.getByTestId("node-q1")).toHaveAttribute("data-state", "current");
    expect(screen.getByTestId("node-q0")).toHaveAttribute("data-visited", "true");
  });

  test("updates the viewport transform through the control buttons", () => {
    render(
      <div style={{ width: 960, height: 640 }}>
        <GraphCanvas
          dfa={automataCatalog.regex1.dfa}
          currentStateId="q0"
          visitedStates={["q0"]}
          activeStep={null}
          playbackMode="idle"
          result={null}
          speed={180}
          reducedMotion={true}
        />
      </div>,
    );

    const viewport = screen.getByTestId("graph-viewport");
    const initialScale = Number(viewport.getAttribute("data-scale"));

    fireEvent.click(screen.getByRole("button", { name: /zoom in/i }));

    const zoomedScale = Number(screen.getByTestId("graph-viewport").getAttribute("data-scale"));
    expect(zoomedScale).toBeGreaterThan(initialScale);

    fireEvent.click(screen.getByRole("button", { name: /reset view/i }));

    const resetScale = Number(screen.getByTestId("graph-viewport").getAttribute("data-scale"));
    expect(resetScale).toBeCloseTo(initialScale);
  });
});
