import { useEffect, useRef, useState } from "react";
import { simulateDfa } from "../lib/simulateDfa";
import type { AutomataDefinition, SimulationResult, SimulationStep } from "../types/dfa";

export type PlaybackMode =
  | "idle"
  | "validated"
  | "running"
  | "paused"
  | "complete"
  | "invalid";

interface UseSimulationControllerOptions {
  definition: AutomataDefinition;
  initialSpeed?: number;
  reducedMotion?: boolean;
}

export function useSimulationController({
  definition,
  initialSpeed = 360,
  reducedMotion = false,
}: UseSimulationControllerOptions) {
  const [input, setInputState] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speed, setSpeedState] = useState(initialSpeed);
  const previousDefinitionId = useRef(definition.id);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef(input);
  const speedRef = useRef(speed);

  function clearPlaybackTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetInternal(nextInput = "") {
    clearPlaybackTimer();
    inputRef.current = nextInput;
    setInputState(nextInput);
    setResult(null);
    setPlaybackMode("idle");
    setCurrentStepIndex(0);
  }

  function computeResult() {
    return simulateDfa(definition.dfa, inputRef.current, definition.alphabet, {
      caseInsensitiveLabels: definition.caseInsensitiveLabels,
    });
  }

  function applyResult(nextResult: SimulationResult, mode: PlaybackMode, stepIndex = 0) {
    clearPlaybackTimer();
    setResult(nextResult);
    setPlaybackMode(mode);
    setCurrentStepIndex(stepIndex);
  }

  function setInput(nextInput: string) {
    resetInternal(nextInput);
  }

  function setSpeed(nextSpeed: number) {
    speedRef.current = nextSpeed;
    setSpeedState(nextSpeed);
  }

  function validate() {
    const nextResult = computeResult();

    if (!nextResult.isValidInput) {
      applyResult(nextResult, "invalid", 0);
      return nextResult;
    }

    applyResult(nextResult, "validated", nextResult.steps.length);
    return nextResult;
  }

  function run() {
    const nextResult = computeResult();

    if (!nextResult.isValidInput) {
      applyResult(nextResult, "invalid", 0);
      return;
    }

    if (reducedMotion || nextResult.steps.length === 0) {
      applyResult(nextResult, "complete", nextResult.steps.length);
      return;
    }

    applyResult(nextResult, "running", 0);
  }

  function step() {
    const nextResult = result && result.isValidInput ? result : computeResult();

    if (!nextResult.isValidInput) {
      applyResult(nextResult, "invalid", 0);
      return;
    }

    const nextIndex = Math.min(
      (result === nextResult ? currentStepIndex : 0) + 1,
      nextResult.steps.length,
    );

    applyResult(
      nextResult,
      nextIndex >= nextResult.steps.length ? "complete" : "paused",
      nextIndex,
    );
  }

  function pause() {
    clearPlaybackTimer();
    setPlaybackMode((currentMode) => (currentMode === "running" ? "paused" : currentMode));
  }

  function reset() {
    resetInternal("");
  }

  useEffect(() => {
    if (previousDefinitionId.current !== definition.id) {
      previousDefinitionId.current = definition.id;
      resetInternal("");
    }
  }, [definition.id]);

  useEffect(() => {
    if (playbackMode !== "running" || !result?.isValidInput) {
      clearPlaybackTimer();
      return;
    }

    if (currentStepIndex >= result.steps.length) {
      setPlaybackMode("complete");
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((stepIndex) => {
        const nextIndex = Math.min(stepIndex + 1, result.steps.length);
        if (nextIndex >= result.steps.length) {
          clearPlaybackTimer();
          setPlaybackMode("complete");
        }
        return nextIndex;
      });
    }, speedRef.current);

    return () => {
      clearPlaybackTimer();
    };
  }, [currentStepIndex, playbackMode, result, speed]);

  useEffect(() => () => clearPlaybackTimer(), []);

  const displayedStepCount =
    playbackMode === "validated" || playbackMode === "complete"
      ? result?.steps.length ?? 0
      : currentStepIndex;
  const traceSteps = result?.steps.slice(0, displayedStepCount) ?? [];
  const activeStep =
    result && displayedStepCount > 0
      ? result.steps[Math.min(displayedStepCount - 1, result.steps.length - 1)]
      : null;
  const currentStateId =
    result?.transitionPath[displayedStepCount] ??
    (playbackMode === "validated" || playbackMode === "complete"
      ? result?.finalState
      : "q0") ??
    "q0";
  const visitedStates =
    result?.transitionPath.slice(
      0,
      playbackMode === "validated" || playbackMode === "complete"
        ? result.transitionPath.length
        : displayedStepCount + 1,
    ) ?? ["q0"];

  return {
    input,
    setInput,
    speed,
    setSpeed,
    result,
    playbackMode,
    currentStepIndex,
    currentStateId,
    currentSymbolIndex: activeStep ? displayedStepCount - 1 : null,
    currentSymbol: activeStep?.symbol ?? null,
    traceSteps,
    activeStep: activeStep as SimulationStep | null,
    activeEdgeKey: activeStep?.edgeKey ?? null,
    visitedStates,
    validate,
    run,
    step,
    pause,
    reset,
  };
}
