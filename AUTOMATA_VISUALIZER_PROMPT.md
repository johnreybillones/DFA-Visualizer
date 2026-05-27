# Automata Visualizer Build Prompt

Use the following prompt in Lovable, Bolt, AI Studio, or another web prototyping tool to generate the Automata Visualizer.

## Master Prompt

Build a frontend-only Automata Visualizer web app for two deterministic finite automata. The app must use React, TypeScript, and Tailwind CSS. Do not add a backend, database, authentication, or external validation service.

Use the visual style defined in `DESIGN.md` as the source of truth. The interface should follow the "Kinetic Logic" design system: dark technical minimalism, sharp geometric containers, high-contrast monochrome surfaces, JetBrains Mono for logic and controls, Geist for body text, crisp 1px borders, no soft shadows, and a persistent graph-paper style grid. Do not replace this with a generic modern dashboard style.

## DFA Data

The app must support exactly two DFA modes.

Regex 1:

```txt
(a+b)(a+b)*(aa+bb)(ab+ba)(a+b)*(aba+baa)
```

Regex 2:

```txt
(11+00)(1+0)*(101+111+01)(00*+11*)(1+0+11)
```

Use the attached DFA JSON data as the source of truth, not any older backend transition table:

- `DFA/DFA1.json`: 15 states, start state `q0`, final states `q12`, `q13`, `q14`.
- `DFA/DFA2.json`: 16 states, start state `q0`, final states `q10`, `q11`, `q12`, `q14`, `q15`.

The JSON structure contains:

- `nodeMap`: state IDs and fixed `x`, `y` coordinates.
- `transitionMap`: directed edges with labels, source IDs, and target IDs.
- `finalNodes`: accepting states.
- `automataType`: always `DFA`.

Preserve the graph structure and coordinates from the JSON. Render the graph from data rather than using static image screenshots.

## Core Features

Implement these user-facing features:

- DFA selector for Regex 1 and Regex 2.
- Regex display showing the currently selected expression.
- Alphabet hint:
  - Regex 1 accepts only `a` and `b`.
  - Regex 2 accepts only `0` and `1`.
- Input field for the test string.
- Buttons for `Validate`, `Run`, `Step`, `Pause`, and `Reset`.
- Speed control for the animation.
- Status panel showing accepted, rejected, invalid input, idle, and running states.
- Transition trace panel showing each consumed symbol and state transition.
- Current-state and current-symbol indicators during animation.

## Validation Rules

For the selected DFA, simulate the input locally in the browser:

1. Start at `q0`.
2. Validate every input character against the selected alphabet.
3. For each character, find the outgoing transition whose label contains that symbol.
4. Follow that transition and append the next state to the transition path.
5. After the final character, accept if the current state is in `finalNodes`; otherwise reject.

Handle Regex 1 labels case-insensitively because the graph labels may use `A` and `B`, while the input should use lowercase `a` and `b`.

If an input contains a character outside the selected alphabet, stop before animation and show a clear invalid-character error. Empty string should reject for both provided DFAs because `q0` is not a final state.

## Graph Rendering

Use a custom SVG graph renderer. Do not use React Flow unless the tool cannot reliably implement SVG paths.

Render:

- Circular nodes with centered state labels.
- Double-ring circles for final states.
- Directed arrows for transitions.
- Edge labels placed near their paths.
- Self-loops for transitions from a node to itself.
- Active node highlight.
- Active transition highlight.
- Visited-state styling.
- A small animated token that moves from node to node while consuming input.

The graph area should support pan and zoom. Preserve the relative layout from the provided coordinates. Fit the graph into the viewport on first load.

## Animation Behavior

The app must support both automatic and manual simulation:

- `Validate`: immediately computes the result and transition path without playing the animation.
- `Run`: resets to `q0`, then animates every transition in order.
- `Step`: advances one symbol and one transition at a time.
- `Pause`: pauses automatic playback without losing the current step.
- `Reset`: clears animation state and returns the selected DFA to `q0`.
- Speed control changes the delay between transition steps.

During animation:

- Highlight the current input character.
- Highlight the current node.
- Highlight the active edge.
- Move a token along the active edge.
- Show the partial trace as it is consumed.
- End with an accepted or rejected state badge.

## Layout

Use a three-zone layout:

- Top bar: app title, DFA selector, current regex summary.
- Main canvas: SVG automata graph on a dark grid background.
- Side panel: input controls, simulation controls, result status, transition trace, and examples.

On small screens, move the side panel into a bottom sheet or stacked section. Keep the graph usable with horizontal scrolling or pan/zoom rather than compressing nodes into unreadable positions.

## Example Test Cases

Include these examples in the UI and use them to verify behavior:

Regex 1 accepted:

- `aaaababa`
- `aaaabbaa`
- `aaabaaba`

Regex 1 rejected:

- empty string
- `a`
- `b`
- any string containing characters outside `a` and `b`

Regex 2 accepted:

- `000100`
- `000101`
- `110100`

Regex 2 rejected:

- empty string
- `0`
- `1`
- any string containing characters outside `0` and `1`

## Engineering Requirements

Structure the app with clear modules:

- DFA data constants or JSON imports.
- DFA simulation utility.
- Graph rendering component.
- Input and control panel component.
- Trace/result component.
- Shared design tokens mapped from `DESIGN.md`.

Keep the DFA simulation pure and testable. It should accept a DFA object and input string, then return:

- `isValidInput`
- `isAccepted`
- `error`
- `transitionPath`
- `steps`
- `finalState`

Each step should include:

- `from`
- `symbol`
- `to`
- `edgeLabel`

## Tool-Specific Adapters

### Lovable

Create a Vite React TypeScript app with Tailwind CSS. Keep all DFA data local. Build polished components and prioritize a complete working prototype over backend integration. Follow the design system in `DESIGN.md` exactly.

### Bolt

Build this as a self-contained React + TypeScript + Tailwind project. Do not create a backend, database, auth flow, or API route. Inline the DFA JSON as local constants if file import is inconvenient. Focus on correct simulation, SVG graph rendering, and animation controls.

### AI Studio

Generate a single-page React application. Use local state for DFA selection, input, validation result, and animation state. Use a custom SVG graph renderer and a pure DFA simulation function. Preserve the "Kinetic Logic" style from `DESIGN.md`.

### Generic Web Builder

Use React, TypeScript, Tailwind CSS, and custom SVG. Keep the project frontend-only. Render the DFA from JSON data, validate strings locally, animate node-to-node transitions, and follow the provided design system without inventing a different style.
