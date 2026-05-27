# Automata Visualizer

Automata Visualizer is a frontend-only learning and inspection tool for formal language automata. It lets users select supplied deterministic finite automata, test input strings, and follow each transition through an animated graph, input tape, status panel, and trace view.

The project is built for students, instructors, and reviewers who need a precise way to inspect automata behavior without relying on backend services or static screenshots.

## Features

- Interactive DFA visualization for two regular expressions.
- String validation against each selected automaton alphabet.
- Step-by-step and automatic playback modes.
- Transition trace, active state highlighting, visited state tracking, and final accept/reject status.
- Adjustable playback speed.
- Accepted and rejected example strings for quick testing.
- CFG reference tab for the supplied grammars.
- PDA reference tab with supplied PDA flowchart images.
- Frontend-only architecture suitable for local use and static deployment.

## Included Automata

### Regex 1

```text
(a+b)(a+b)*(aa+bb)(ab+ba)(a+b)*(aba+baa)
```

- Alphabet: `a`, `b`
- Example accepted strings: `aaaababa`, `aaaabbaa`, `aaabaaba`
- Example rejected strings: empty string, `a`, `b`

### Regex 2

```text
(11+00)(1+0)*(101+111+01)(00*+11*)(1+0+11)
```

- Alphabet: `0`, `1`
- Example accepted strings: `000100`, `000101`, `110100`
- Example rejected strings: empty string, `0`, `1`

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Vitest
- React Testing Library

## Repository Structure

```text
.
|-- assets/                         # Source images and automata assets
|-- automata-visualizer/            # Main Vite React application
|   |-- public/                     # Static public assets
|   |-- src/
|   |   |-- components/             # UI panels and visualization components
|   |   |-- data/                   # Automata catalog and DFA JSON files
|   |   |-- hooks/                  # Simulation controller and UI hooks
|   |   |-- lib/                    # DFA simulation and graph helpers
|   |   `-- types/                  # Shared TypeScript types
|   `-- verification-artifacts/     # Captured verification screenshots and summary
|-- docs/                           # Planning and status notes
|-- DESIGN.md                       # Visual design system
|-- PRODUCT.md                      # Product purpose and audience
`-- README.md
```

## Prerequisites

- Node.js 20 or newer
- npm

## Getting Started

Install dependencies from the application directory:

```bash
cd automata-visualizer
npm install
```

Start the local development server:

```bash
npm run dev
```

Vite will print the local URL, usually:

```text
http://localhost:5173/
```

## Available Scripts

Run these commands from `automata-visualizer/`.

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Runs TypeScript checking with `tsc --noEmit` and creates a production build.

```bash
npm run preview
```

Serves the production build locally for review.

```bash
npm run test
```

Runs the Vitest test suite once.

```bash
npm run test:watch
```

Runs Vitest in watch mode.

## Testing

The application includes unit and component tests for the DFA simulator, graph geometry, viewport behavior, simulation controller, and graph canvas.

Run the full test suite with:

```bash
cd automata-visualizer
npm run test
```

## Development Notes

- DFA definitions live in `automata-visualizer/src/data/`.
- Shared DFA and simulation types live in `automata-visualizer/src/types/dfa.ts`.
- Core DFA execution logic is in `automata-visualizer/src/lib/simulateDfa.ts`.
- Graph layout and viewport helpers are in `automata-visualizer/src/lib/`.
- UI behavior is coordinated through `automata-visualizer/src/hooks/useSimulationController.ts`.

When adding or changing automata, keep the catalog metadata, DFA graph JSON, examples, and tests aligned.

## Design Direction

The interface follows a technical, restrained visual system documented in `DESIGN.md`. It favors high-contrast dark surfaces, monospaced labels, crisp borders, and graph-first interaction patterns.

The product goals and audience are documented in `PRODUCT.md`.

## Contributing

1. Create a focused branch for your change.
2. Keep changes scoped to the relevant feature, test, or documentation area.
3. Add or update tests when behavior changes.
4. Run `npm run test` and `npm run build` before submitting changes.
5. Document notable UI, data, or workflow changes in the appropriate project docs.

## License

No license file is currently included. Add a license before distributing or reusing this project outside its current context.
