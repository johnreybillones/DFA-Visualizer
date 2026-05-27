import dfa1 from "./dfa1.json";
import dfa2 from "./dfa2.json";
import type { AutomataDefinition, DfaGraph, DfaId } from "../types/dfa";

const regex1: AutomataDefinition = {
  id: "regex1",
  label: "Regex 1",
  expression: "(a+b)(a+b)*(aa+bb)(ab+ba)(a+b)*(aba+baa)",
  alphabet: ["a", "b"],
  acceptedExamples: ["aaaababa", "aaaabbaa", "aaabaaba"],
  rejectedExamples: ["", "a", "b"],
  caseInsensitiveLabels: true,
  dfa: dfa1 as DfaGraph,
};

const regex2: AutomataDefinition = {
  id: "regex2",
  label: "Regex 2",
  expression: "(11+00)(1+0)*(101+111+01)(00*+11*)(1+0+11)",
  alphabet: ["0", "1"],
  acceptedExamples: ["000100", "000101", "110100"],
  rejectedExamples: ["", "0", "1"],
  caseInsensitiveLabels: false,
  dfa: dfa2 as DfaGraph,
};

export const automataCatalog: Record<DfaId, AutomataDefinition> = {
  regex1,
  regex2,
};

export const automataOrder: DfaId[] = ["regex1", "regex2"];
