import type { SimulationStep } from "../types/dfa";

interface TracePanelProps {
  steps: SimulationStep[];
}

export function TracePanel({ steps }: TracePanelProps) {
  return (
    <section className="panel-section">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="label-kicker">Transition Trace</p>
          <h2 className="font-[var(--font-display)] text-xl text-[var(--color-text)]">
            Consumed path
          </h2>
        </div>
        <span className="text-sm text-[var(--color-text-muted)]">{steps.length} steps</span>
      </div>

      <div className="border border-[var(--color-outline-muted)] bg-[var(--color-surface-strong)]">
        <div className="grid grid-cols-[4rem_1fr_1fr_1fr] gap-2 border-b border-[var(--color-outline-muted)] px-3 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          <span>#</span>
          <span>Symbol</span>
          <span>From</span>
          <span>To</span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {steps.length === 0 ? (
            <p className="px-3 py-4 text-sm text-[var(--color-text-muted)]">
              No transitions consumed yet.
            </p>
          ) : (
            steps.map((step, index) => (
              <div
                key={step.edgeKey}
                className="grid grid-cols-[4rem_1fr_1fr_1fr] gap-2 border-b border-[var(--color-outline-muted)] px-3 py-3 text-sm last:border-b-0"
              >
                <span className="font-[var(--font-display)] text-[var(--color-text-muted)]">
                  {index + 1}
                </span>
                <span className="font-[var(--font-display)] text-[var(--color-text)]">
                  {step.symbol}
                  <span className="block text-[0.75rem] text-[var(--color-text-muted)]">
                    {step.edgeLabel}
                  </span>
                </span>
                <span className="font-[var(--font-display)] text-[var(--color-text)]">
                  {step.from}
                </span>
                <span className="font-[var(--font-display)] text-[var(--color-text)]">
                  {step.to}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
