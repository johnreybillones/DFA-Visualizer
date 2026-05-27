# Automata Visualizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `$executing-plans` to implement this plan task-by-task. Do not use Git worktrees. If Git is available, create a normal branch instead. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new frontend-only Automata Visualizer for two DFAs using React, TypeScript, Tailwind CSS, custom SVG graph rendering, and local DFA simulation.

**Architecture:** Create a new `automata-visualizer/` Vite app beside the existing files. Keep DFA data, simulation, graph geometry, animation control, and UI components separated so the simulator is pure and testable while the renderer remains fully data-driven. Treat `AUTOMATA_VISUALIZER_PROMPT.md` and `DESIGN.md` as source of truth, and keep `sample-webapp/` as reference only.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS, Vitest, Testing Library, custom SVG, local JSON imports

---

## Skill Contract

Use these skills during implementation:

- `$executing-plans`: primary implementation workflow.
- `$frontend-design`: enforce distinctive Kinetic Logic UI execution, not generic dashboard styling.
- `$ui-ux-pro-max`: validate accessibility, responsive behavior, interaction states, reduced motion, form labels, and touch targets.
- `$impeccable`: run product-register design shaping, then `audit`, `adapt`, `animate`, `clarify`, `harden`, and `polish` passes before completion.
- `$test-driven-development` or `$tdd-workflow`: write failing tests before simulator, geometry, and interaction implementation.
- `$find-docs` or `$context7-mcp`: verify current Vite, Tailwind, Vitest, and Testing Library setup from official or primary docs.
- `$webapp-testing`: manually verify browser behavior after build.
- `$verification-before-completion`: run final checks before claiming completion.
- `$finishing-a-development-branch`: close out after all tests and manual checks pass.

Do not use `$using-git-worktrees`.

## Git Handling

- If the workspace is a Git repository, create and work on a branch such as `feature/automata-visualizer`.
- If there are uncommitted user changes, do not overwrite or revert them.
- If the workspace is not a Git repository, skip branching and report that branch and commit steps were not applicable.
- Use normal commits only if Git is initialized. Do not amend commits unless explicitly requested.

## Key Decisions

- Build a new `automata-visualizer/` app. Do not retrofit `sample-webapp/`.
- Do not add backend, database, auth, API routes, remote validation, Bootstrap, React Flow, or static DFA screenshots.
- Copy `DFA/DFA1.json` and `DFA/DFA2.json` into app-local data files so the app is self-contained.
- Preserve DFA coordinates from JSON and render graph nodes and edges with custom SVG.
- `DESIGN.md` overrides generic UI recommendations: use JetBrains Mono and Geist, sharp 0-radius geometry, high-contrast monochrome, 1px borders, no soft shadows, and a persistent graph-paper grid.
- The UI/UX Pro Max design-system search recommended dark OLED and accessibility rules. Use its UX and accessibility checks, but do not replace Kinetic Logic typography or palette with Inter or slate defaults.
- `impeccable` context loader found `DESIGN.md` but no `PRODUCT.md`. Execution should either run `$impeccable teach` first or create a minimal product context before deeper design polishing.

## Public Interfaces

Create these core types in `src/types/dfa.ts`:

```ts
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
```

Create this pure simulator in `src/lib/simulateDfa.ts`:

```ts
export function simulateDfa(
  dfa: DfaGraph,
  input: string,
  alphabet: string[],
  options?: { caseInsensitiveLabels?: boolean }
): SimulationResult;
```

## Implementation Tasks

### Task 1: Project Scaffold And Tooling

**Files:**
- Create: `automata-visualizer/`
- Create: `automata-visualizer/package.json`
- Create: `automata-visualizer/vite.config.ts`
- Create: `automata-visualizer/tsconfig.json`
- Create: `automata-visualizer/src/index.css`

- [ ] If Git exists, create branch `feature/automata-visualizer`. Do not use worktrees.
- [ ] Use `$find-docs` or `$context7-mcp` to verify current Vite React TypeScript, Tailwind CSS Vite plugin, Vitest, and Testing Library setup.
- [ ] Scaffold with `npm create vite@latest automata-visualizer -- --template react-ts`.
- [ ] Install Tailwind, Vitest, Testing Library, jsdom, and any required type packages.
- [ ] Configure `vite.config.ts` with React, Tailwind, and Vitest.
- [ ] Add scripts: `dev`, `build`, `preview`, `test`, `test:watch`.
- [ ] Verify `npm run build` works before feature code is added.

### Task 2: App Data And Types

**Files:**
- Create: `automata-visualizer/src/data/dfa1.json`
- Create: `automata-visualizer/src/data/dfa2.json`
- Create: `automata-visualizer/src/data/automataCatalog.ts`
- Create: `automata-visualizer/src/types/dfa.ts`

- [ ] Copy `DFA/DFA1.json` and `DFA/DFA2.json` into app-local `src/data/`.
- [ ] Define Regex 1 metadata: expression, alphabet `["a", "b"]`, accepted examples, rejected examples, and `caseInsensitiveLabels: true`.
- [ ] Define Regex 2 metadata: expression, alphabet `["0", "1"]`, accepted examples, rejected examples, and `caseInsensitiveLabels: false`.
- [ ] Export a catalog keyed by `regex1` and `regex2`.

### Task 3: Pure DFA Simulation

**Files:**
- Create: `automata-visualizer/src/lib/simulateDfa.ts`
- Create: `automata-visualizer/src/lib/simulateDfa.test.ts`

- [ ] Write failing tests for Regex 1 accepted examples: `aaaababa`, `aaaabbaa`, `aaabaaba`.
- [ ] Write failing tests for Regex 1 rejected examples: empty string, `a`, `b`.
- [ ] Write failing tests for Regex 1 invalid characters, such as `abc` and `A`.
- [ ] Write failing tests for Regex 2 accepted examples: `000100`, `000101`, `110100`.
- [ ] Write failing tests for Regex 2 rejected examples: empty string, `0`, `1`.
- [ ] Write failing tests for Regex 2 invalid characters, such as `012` and `abba`.
- [ ] Implement `simulateDfa()` so every step includes `from`, `symbol`, `to`, `edgeLabel`, and stable `edgeKey`.
- [ ] Ensure invalid input returns before any animation path is consumed.
- [ ] Run `npm run test -- simulateDfa`.

### Task 4: Graph Geometry And Viewport

**Files:**
- Create: `automata-visualizer/src/lib/graphGeometry.ts`
- Create: `automata-visualizer/src/lib/graphGeometry.test.ts`
- Create: `automata-visualizer/src/lib/graphViewport.ts`
- Create: `automata-visualizer/src/lib/graphViewport.test.ts`

- [ ] Write tests for graph bounds from JSON coordinates.
- [ ] Write tests for fit-to-view transform with padding.
- [ ] Write tests for normal directed edges, bidirectional and repeated edges, self-loops, label points, and token points.
- [ ] Implement geometry helpers for SVG path generation and token interpolation.
- [ ] Implement viewport helpers for first-load fit, zoom clamping, pan translation, and reset view.
- [ ] Run graph tests.

### Task 5: Design System Foundation

**Files:**
- Modify: `automata-visualizer/src/index.css`
- Modify: Tailwind config if generated by the chosen Tailwind version

- [ ] Use `$frontend-design`, `$ui-ux-pro-max`, and `$impeccable shape` as design constraints before writing UI code.
- [ ] Define Kinetic Logic tokens as CSS variables: surfaces, outlines, text, success, error, active transition, visited state, and grid colors.
- [ ] Load or import JetBrains Mono and Geist with `font-display: swap`. Do not use Inter as the app font.
- [ ] Add graph-paper background utilities for 8px minor grid and 40px major grid.
- [ ] Add reduced-motion handling that disables token travel animation and uses instant state updates.
- [ ] Add accessible focus rings, minimum 44px touch targets, and high-contrast status colors.
- [ ] Avoid banned design patterns: glassmorphism, gradient text, soft shadows, rounded cards, emoji icons, and generic SaaS cards.

### Task 6: App Shell And State

**Files:**
- Modify: `automata-visualizer/src/App.tsx`
- Create: `automata-visualizer/src/hooks/useSimulationController.ts`
- Create: `automata-visualizer/src/hooks/useSimulationController.test.ts`

- [ ] Implement state for selected DFA, input string, validation result, playback mode, current step index, speed, visited states, and active edge.
- [ ] Write tests for validate, run, step, pause, reset, speed changes, invalid input blocking playback, and DFA switch reset.
- [ ] Implement timer cleanup on pause, reset, unmount, and DFA switch.
- [ ] Ensure `Validate` computes the full result without playing animation.
- [ ] Ensure `Run` resets to `q0` and auto-steps through all transitions.
- [ ] Ensure `Step` advances exactly one symbol and one transition.
- [ ] Ensure `Pause` preserves current progress.
- [ ] Ensure `Reset` clears result and trace and returns to `q0`.

### Task 7: SVG Graph Renderer

**Files:**
- Create: `automata-visualizer/src/components/GraphCanvas.tsx`
- Create: `automata-visualizer/src/components/GraphCanvas.test.tsx`

- [ ] Render circular nodes from `nodeMap`, centered labels, start marker, double-ring final states, directed arrows, edge labels, self-loops, active node, active edge, visited states, and animated token.
- [ ] Add SVG `marker` definitions for sharp arrowheads.
- [ ] Add pointer-based pan, wheel zoom, zoom buttons, reset-view button, and keyboard-accessible controls.
- [ ] Fit the graph into the viewport on first load while preserving JSON coordinate relationships.
- [ ] Keep the graph usable on small screens with pan and zoom, not compressed reflow.
- [ ] Verify no graph interaction depends on hover only.

### Task 8: Controls, Status, Trace, And Examples

**Files:**
- Create: `automata-visualizer/src/components/TopBar.tsx`
- Create: `automata-visualizer/src/components/ControlPanel.tsx`
- Create: `automata-visualizer/src/components/StatusPanel.tsx`
- Create: `automata-visualizer/src/components/TracePanel.tsx`
- Create: `automata-visualizer/src/components/InputTape.tsx`
- Create: component tests as needed

- [ ] Build top bar with app title, DFA selector, current regex, and alphabet hint.
- [ ] Build visible-labeled input field with helper text and invalid-character error near the field.
- [ ] Build buttons for `Validate`, `Run`, `Step`, `Pause`, and `Reset` with disabled states and clear pressed and focus states.
- [ ] Build speed control with visible label, min and max text, and no placeholder-only controls.
- [ ] Build status panel for idle, running, accepted, rejected, and invalid input.
- [ ] Build trace panel showing consumed symbol, source state, destination state, and edge label.
- [ ] Build current-state and current-symbol indicators using text plus visual styling, not color alone.
- [ ] Build example buttons. Clicking an example loads the string and resets animation without auto-running.

### Task 9: Responsive Layout And UX Hardening

**Files:**
- Modify: `automata-visualizer/src/App.tsx`
- Modify: `automata-visualizer/src/index.css`
- Modify: component files as needed

- [ ] Use `$impeccable adapt` for responsive behavior.
- [ ] Desktop layout: top bar, main graph canvas, fixed-width right control panel around 320px.
- [ ] Small-screen layout: top bar, graph canvas, stacked or bottom-section controls.
- [ ] Prevent page-level horizontal overflow while allowing graph pan and zoom internally.
- [ ] Ensure body text is at least 16px where users read instructions or errors.
- [ ] Keep touch targets at least 44px high.
- [ ] Keep focus order logical: top bar, graph controls, input, simulation controls, status, trace, and examples.
- [ ] Use `aria-live="polite"` for status and result announcements.

### Task 10: Design Quality Passes

**Files:**
- Modify: UI and CSS files as needed

- [ ] Use `$impeccable animate` to verify motion is purposeful and respects reduced motion.
- [ ] Use `$impeccable clarify` to tighten labels, helper text, and errors.
- [ ] Use `$impeccable harden` to cover empty input, invalid input, long input, rapid button clicks, DFA switching during run, and reduced-motion mode.
- [ ] Use `$impeccable audit` to check accessibility, contrast, keyboard navigation, performance, and responsive issues.
- [ ] Use `$impeccable polish` for final visual consistency against `DESIGN.md`.
- [ ] Use `$frontend-design` to reject generic AI dashboard patterns and preserve the technical-minimal, blueprint-like interface.

### Task 11: Browser Verification

**Files:**
- No planned source changes unless failures are found

- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run dev`.
- [ ] Use `$webapp-testing` to verify at 375px, 768px, 1024px, and 1440px widths.
- [ ] Manually verify Regex 1 accepted, rejected, and invalid examples.
- [ ] Manually verify Regex 2 accepted, rejected, and invalid examples.
- [ ] Manually verify `Validate`, `Run`, `Step`, `Pause`, `Reset`, speed changes, pan, zoom, reset view, current symbol highlight, active edge highlight, token movement, visited states, and final badge.
- [ ] Manually verify keyboard navigation and reduced-motion behavior.

### Task 12: Completion Workflow

**Files:**
- This plan file: `docs/superpowers/plans/2026-05-28-automata-visualizer.md`

- [ ] Use `$verification-before-completion` before declaring the work complete.
- [ ] If Git is initialized, commit in logical chunks: scaffold, simulator, graph geometry, renderer, controls, and polish.
- [ ] Use `$finishing-a-development-branch` after all tests and manual checks pass.
- [ ] If Git is not initialized, report that branching and commits were skipped because the current workspace is not a Git repository.

## Test Cases

- Regex 1 accepted: `aaaababa`, `aaaabbaa`, `aaabaaba`.
- Regex 1 rejected: empty string, `a`, `b`.
- Regex 1 invalid: any character outside lowercase `a` and `b`.
- Regex 2 accepted: `000100`, `000101`, `110100`.
- Regex 2 rejected: empty string, `0`, `1`.
- Regex 2 invalid: any character outside `0` and `1`.
- Animation: run all steps, pause mid-run, step after pause, reset mid-run, switch DFA mid-run, and change speed mid-run.
- Graph: normal edges, self-loops, final state double rings, active edge, active node, visited states, token travel, pan, zoom, and reset view.
- Accessibility: labeled controls, keyboard operability, visible focus states, `aria-live` status updates, color not used as the only signal, and reduced motion support.
- Responsive: usable graph and controls at 375px, 768px, 1024px, and 1440px.

## Assumptions

- Implementation starts from `C:\Users\Alfierey\Downloads\JR\Programming\VSCode\Automata`.
- The app lives in `automata-visualizer/`.
- `sample-webapp/` and `automata.html` are not modified.
- `DESIGN.md` is authoritative over generic generated design recommendations.
- `PRODUCT.md` is missing, so execution should satisfy `$impeccable` setup before design polishing.
- Worktrees are intentionally not used. Normal Git branching is the only isolation method if Git exists.
