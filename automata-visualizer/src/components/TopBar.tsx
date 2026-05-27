import { automataOrder } from "../data/automataCatalog";
import type { AutomataDefinition, DfaId } from "../types/dfa";

interface TopBarProps {
  selectedId: DfaId;
  definition: AutomataDefinition;
  onChange: (id: DfaId) => void;
}

export function TopBar({ selectedId, definition, onChange }: TopBarProps) {
  return (
    <header className="panel-surface flex flex-col gap-3 px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
            <h1 className="font-[var(--font-display)] text-xl leading-none text-[var(--color-text)]">
              Automata Visualizer
            </h1>
            <p className="label-kicker ml-2">Deterministic Finite Automata</p>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] max-w-xl">
          Inspect two supplied DFAs, validate strings, and follow transitions through graph and trace.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:min-w-fit">
        <label className="flex items-center gap-2">
          <span className="label-kicker">Automaton</span>
          <select
            className="field-input min-h-8 py-1 text-sm"
            aria-label="Select DFA"
            value={selectedId}
            onChange={(event) => onChange(event.target.value as DfaId)}
          >
            {automataOrder.map((id) => (
              <option key={id} value={id}>
                {id === "regex1" ? "Regex 1" : "Regex 2"}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-3 border border-[var(--color-outline-muted)] bg-[var(--color-surface-strong)] px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span className="label-kicker">Expr</span>
            <code className="font-[var(--font-display)] text-sm text-[var(--color-text)]">
              {definition.expression}
            </code>
          </div>
          <div className="h-4 w-px bg-[var(--color-outline-muted)]"></div>
          <div className="flex items-center gap-2">
              <span className="label-kicker">Alph</span>
              <span className="text-sm text-[var(--color-text-muted)]">
                {definition.alphabet.join(", ")}
              </span>
          </div>
        </div>
      </div>
    </header>
  );
}
