import { describe, expect, test } from "vitest";
import { automataCatalog } from "../data/automataCatalog";
import { simulateDfa } from "./simulateDfa";

describe("simulateDfa", () => {
  test.each(automataCatalog.regex1.acceptedExamples)(
    "accepts Regex 1 example %s",
    (input) => {
      const result = simulateDfa(
        automataCatalog.regex1.dfa,
        input,
        automataCatalog.regex1.alphabet,
        { caseInsensitiveLabels: automataCatalog.regex1.caseInsensitiveLabels },
      );

      expect(result.isValidInput).toBe(true);
      expect(result.isAccepted).toBe(true);
      expect(result.error).toBeNull();
      expect(result.transitionPath[0]).toBe("q0");
      expect(result.finalState).toBe(result.transitionPath.at(-1));
      expect(result.steps).toHaveLength(input.length);
    },
  );

  test.each(automataCatalog.regex1.rejectedExamples)(
    "rejects Regex 1 example %j",
    (input) => {
      const result = simulateDfa(
        automataCatalog.regex1.dfa,
        input,
        automataCatalog.regex1.alphabet,
        { caseInsensitiveLabels: automataCatalog.regex1.caseInsensitiveLabels },
      );

      expect(result.isValidInput).toBe(true);
      expect(result.isAccepted).toBe(false);
      expect(result.error).toBeNull();
    },
  );

  test.each(["abc", "A"])("rejects invalid Regex 1 input %s", (input) => {
    const result = simulateDfa(
      automataCatalog.regex1.dfa,
      input,
      automataCatalog.regex1.alphabet,
      { caseInsensitiveLabels: automataCatalog.regex1.caseInsensitiveLabels },
    );

    expect(result.isValidInput).toBe(false);
    expect(result.isAccepted).toBe(false);
    expect(result.error).toMatch(/invalid/i);
    expect(result.steps).toHaveLength(0);
    expect(result.transitionPath).toEqual(["q0"]);
    expect(result.finalState).toBe("q0");
  });

  test.each(automataCatalog.regex2.acceptedExamples)(
    "accepts Regex 2 example %s",
    (input) => {
      const result = simulateDfa(
        automataCatalog.regex2.dfa,
        input,
        automataCatalog.regex2.alphabet,
        { caseInsensitiveLabels: automataCatalog.regex2.caseInsensitiveLabels },
      );

      expect(result.isValidInput).toBe(true);
      expect(result.isAccepted).toBe(true);
      expect(result.error).toBeNull();
      expect(result.steps.map((step) => step.symbol).join("")).toBe(input);
      expect(result.transitionPath).toHaveLength(input.length + 1);
    },
  );

  test.each(automataCatalog.regex2.rejectedExamples)(
    "rejects Regex 2 example %j",
    (input) => {
      const result = simulateDfa(
        automataCatalog.regex2.dfa,
        input,
        automataCatalog.regex2.alphabet,
        { caseInsensitiveLabels: automataCatalog.regex2.caseInsensitiveLabels },
      );

      expect(result.isValidInput).toBe(true);
      expect(result.isAccepted).toBe(false);
      expect(result.error).toBeNull();
    },
  );

  test.each(["012", "abba"])("rejects invalid Regex 2 input %s", (input) => {
    const result = simulateDfa(
      automataCatalog.regex2.dfa,
      input,
      automataCatalog.regex2.alphabet,
      { caseInsensitiveLabels: automataCatalog.regex2.caseInsensitiveLabels },
    );

    expect(result.isValidInput).toBe(false);
    expect(result.isAccepted).toBe(false);
    expect(result.error).toMatch(/invalid/i);
    expect(result.steps).toEqual([]);
  });

  test("creates stable step metadata for each transition", () => {
    const result = simulateDfa(
      automataCatalog.regex2.dfa,
      "000100",
      automataCatalog.regex2.alphabet,
      { caseInsensitiveLabels: automataCatalog.regex2.caseInsensitiveLabels },
    );

    expect(result.steps[0]).toEqual({
      from: "q0",
      symbol: "0",
      to: "q2",
      edgeLabel: "0",
      edgeKey: "q0->q2:0:0",
    });
  });
});
