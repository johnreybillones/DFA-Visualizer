import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { automataCatalog } from "../data/automataCatalog";
import { useSimulationController } from "./useSimulationController";

describe("useSimulationController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("validate computes the full result without animation", () => {
    const { result } = renderHook(() =>
      useSimulationController({ definition: automataCatalog.regex1 }),
    );

    act(() => {
      result.current.setInput("aaaababa");
      result.current.validate();
    });

    expect(result.current.playbackMode).toBe("validated");
    expect(result.current.currentStepIndex).toBe(8);
    expect(result.current.result?.isAccepted).toBe(true);
    expect(result.current.traceSteps).toHaveLength(8);
    expect(result.current.currentStateId).toBe(result.current.result?.finalState);
  });

  test("run resets to q0 and auto-steps through all transitions", () => {
    const { result } = renderHook(() =>
      useSimulationController({
        definition: automataCatalog.regex2,
        initialSpeed: 120,
      }),
    );

    act(() => {
      result.current.setInput("000100");
      result.current.run();
    });

    expect(result.current.playbackMode).toBe("running");
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.currentStateId).toBe("q0");

    act(() => {
      vi.advanceTimersByTime(721);
    });

    expect(result.current.playbackMode).toBe("complete");
    expect(result.current.currentStepIndex).toBe(6);
    expect(result.current.result?.isAccepted).toBe(true);
    expect(result.current.visitedStates.at(-1)).toBe(result.current.result?.finalState);
  });

  test("step advances exactly one symbol at a time", () => {
    const { result } = renderHook(() =>
      useSimulationController({ definition: automataCatalog.regex1 }),
    );

    act(() => {
      result.current.setInput("aaaababa");
      result.current.step();
    });

    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.traceSteps).toHaveLength(1);
    expect(result.current.activeStep?.symbol).toBe("a");

    act(() => {
      result.current.step();
    });

    expect(result.current.currentStepIndex).toBe(2);
    expect(result.current.traceSteps).toHaveLength(2);
  });

  test("pause preserves current progress", () => {
    const { result } = renderHook(() =>
      useSimulationController({
        definition: automataCatalog.regex1,
        initialSpeed: 100,
      }),
    );

    act(() => {
      result.current.setInput("aaaababa");
      result.current.run();
      vi.advanceTimersByTime(250);
      result.current.pause();
    });

    const pausedAt = result.current.currentStepIndex;

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.playbackMode).toBe("paused");
    expect(result.current.currentStepIndex).toBe(pausedAt);
  });

  test("reset clears result and trace and returns to q0", () => {
    const { result } = renderHook(() =>
      useSimulationController({ definition: automataCatalog.regex2 }),
    );

    act(() => {
      result.current.setInput("000100");
      result.current.validate();
      result.current.reset();
    });

    expect(result.current.playbackMode).toBe("idle");
    expect(result.current.result).toBeNull();
    expect(result.current.traceSteps).toEqual([]);
    expect(result.current.currentStateId).toBe("q0");
    expect(result.current.activeStep).toBeNull();
  });

  test("speed changes affect subsequent playback ticks", () => {
    const { result } = renderHook(() =>
      useSimulationController({
        definition: automataCatalog.regex2,
        initialSpeed: 300,
      }),
    );

    act(() => {
      result.current.setInput("000100");
      result.current.setSpeed(50);
      result.current.run();
    });

    act(() => {
      vi.advanceTimersByTime(101);
    });

    expect(result.current.currentStepIndex).toBe(2);
  });

  test("invalid input blocks playback", () => {
    const { result } = renderHook(() =>
      useSimulationController({ definition: automataCatalog.regex1 }),
    );

    act(() => {
      result.current.setInput("abc");
      result.current.run();
    });

    expect(result.current.playbackMode).toBe("invalid");
    expect(result.current.result?.isValidInput).toBe(false);
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.traceSteps).toEqual([]);
  });

  test("switching DFA resets state and clears input", () => {
    const { result, rerender } = renderHook(
      ({ definition }) => useSimulationController({ definition }),
      { initialProps: { definition: automataCatalog.regex1 } },
    );

    act(() => {
      result.current.setInput("aaaababa");
      result.current.validate();
    });

    rerender({ definition: automataCatalog.regex2 });

    expect(result.current.input).toBe("");
    expect(result.current.playbackMode).toBe("idle");
    expect(result.current.result).toBeNull();
    expect(result.current.currentStateId).toBe("q0");
  });
});
