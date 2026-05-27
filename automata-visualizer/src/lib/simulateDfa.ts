import type { DfaGraph, SimulationResult, SimulationStep } from "../types/dfa";

interface SimulateOptions {
  caseInsensitiveLabels?: boolean;
}

function normalizeValue(value: string, caseInsensitive: boolean): string {
  return caseInsensitive ? value.toLowerCase() : value;
}

function findMatchingTransition(
  dfa: DfaGraph,
  stateId: string,
  symbol: string,
  caseInsensitiveLabels: boolean,
) {
  const transitions = dfa.transitionMap[stateId] ?? [];
  const normalizedSymbol = normalizeValue(symbol, caseInsensitiveLabels);

  return transitions.find((transition) => {
    const labels = transition.label
      .split(",")
      .map((part) => normalizeValue(part.trim(), caseInsensitiveLabels));

    return labels.includes(normalizedSymbol);
  });
}

export function simulateDfa(
  dfa: DfaGraph,
  input: string,
  alphabet: string[],
  options: SimulateOptions = {},
): SimulationResult {
  const caseInsensitiveLabels = options.caseInsensitiveLabels ?? false;
  const transitionPath = ["q0"];
  const steps: SimulationStep[] = [];

  for (const symbol of input) {
    if (!alphabet.includes(symbol)) {
      return {
        isValidInput: false,
        isAccepted: false,
        error: `Invalid input symbol "${symbol}". Allowed alphabet: ${alphabet.join(", ")}.`,
        transitionPath,
        steps,
        finalState: "q0",
      };
    }
  }

  let currentState = "q0";

  for (const [index, symbol] of Array.from(input).entries()) {
    const transition = findMatchingTransition(
      dfa,
      currentState,
      symbol,
      caseInsensitiveLabels,
    );

    if (!transition) {
      return {
        isValidInput: true,
        isAccepted: false,
        error: `No transition for "${symbol}" from ${currentState}.`,
        transitionPath,
        steps,
        finalState: currentState,
      };
    }

    const nextState = transition.targetid;

    steps.push({
      from: currentState,
      symbol,
      to: nextState,
      edgeLabel: transition.label,
      edgeKey: `${currentState}->${nextState}:${symbol}:${index}`,
    });

    currentState = nextState;
    transitionPath.push(nextState);
  }

  return {
    isValidInput: true,
    isAccepted: dfa.finalNodes.includes(currentState),
    error: null,
    transitionPath,
    steps,
    finalState: currentState,
  };
}
