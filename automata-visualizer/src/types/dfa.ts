export type DfaId = "regex1" | "regex2";

export interface DfaNode {
  id: string;
  x: number;
  y: number;
}

export interface DfaTransition {
  label: string;
  sourceid: string;
  targetid: string;
}

export interface DfaGraph {
  nodeMap: Record<string, DfaNode>;
  transitionMap: Record<string, DfaTransition[]>;
  finalNodes: string[];
  nodeNum: number;
  automataType: "DFA";
}

export interface SimulationStep {
  from: string;
  symbol: string;
  to: string;
  edgeLabel: string;
  edgeKey: string;
}

export interface SimulationResult {
  isValidInput: boolean;
  isAccepted: boolean;
  error: string | null;
  transitionPath: string[];
  steps: SimulationStep[];
  finalState: string;
}

export interface AutomataDefinition {
  id: DfaId;
  label: string;
  expression: string;
  alphabet: string[];
  acceptedExamples: string[];
  rejectedExamples: string[];
  caseInsensitiveLabels: boolean;
  dfa: DfaGraph;
}
