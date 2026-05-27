import type { PlaybackMode } from "../hooks/useSimulationController";

interface ControlPanelProps {
  input: string;
  alphabet: string[];
  examples: {
    accepted: string[];
    rejected: string[];
  };
  error: string | null;
  playbackMode: PlaybackMode;
  speed: number;
  onInputChange: (value: string) => void;
  onValidate: () => void;
  onRun: () => void;
  onStep: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (value: number) => void;
  onExampleClick: (value: string) => void;
}

export function ControlPanel({
  input,
  alphabet,
  examples,
  error,
  playbackMode,
  speed,
  onInputChange,
  onValidate,
  onRun,
  onStep,
  onPause,
  onReset,
  onSpeedChange,
  onExampleClick,
}: ControlPanelProps) {
  const isRunning = playbackMode === "running";
  const hasProgress = playbackMode !== "idle";

  return (
    <section className="grid gap-5">
      <section className="panel-section">
        <div className="space-y-2">
          <p className="label-kicker">Input</p>
          <label className="grid gap-2">
            <span className="text-sm text-[var(--color-text)]">
              Test string for alphabet {alphabet.join(", ")}
            </span>
            <input
              className="field-input min-h-11"
              aria-invalid={error ? "true" : "false"}
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder={alphabet.join("")}
            />
          </label>
          <p className="text-sm text-[var(--color-text-muted)]">
            Symbols outside the selected alphabet are rejected before playback starts.
          </p>
          {error ? (
            <p className="text-sm text-[var(--color-error)]" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button className="control-button" type="button" onClick={onValidate}>
            Validate
          </button>
          <button
            className="control-button"
            type="button"
            onClick={onRun}
            disabled={isRunning}
          >
            Run
          </button>
          <button
            className="control-button"
            type="button"
            onClick={onStep}
            disabled={isRunning}
          >
            Step
          </button>
          <button
            className="control-button"
            type="button"
            onClick={onPause}
            disabled={!isRunning}
          >
            Pause
          </button>
          <button
            className="control-button control-button--solid sm:col-span-2"
            type="button"
            onClick={onReset}
            disabled={!input && !hasProgress}
          >
            Reset
          </button>
        </div>
      </section>

      <section className="panel-section">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="label-kicker">Playback speed</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Controls the delay between transitions during Run.
            </p>
          </div>
          <span className="font-[var(--font-display)] text-sm text-[var(--color-text)]">
            {speed} ms
          </span>
        </div>
        <label className="grid gap-2">
          <span className="sr-only">Animation speed</span>
          <input
            aria-label="Animation speed"
            className="slider-input"
            max={3000}
            min={80}
            step={100}
            type="range"
            value={speed}
            onChange={(event) => onSpeedChange(Number(event.target.value))}
          />
          <div className="flex justify-between text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            <span>Fast</span>
            <span>Slow</span>
          </div>
        </label>
      </section>

      <section className="panel-section">
        <div className="space-y-2">
          <p className="label-kicker">Examples</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Loading an example resets the trace without starting playback.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-success)]">
              Accepted
            </span>
            <div className="flex flex-wrap gap-2">
              {examples.accepted.map((example) => (
                <button
                  key={`accepted-${example}`}
                  className="tag-button"
                  type="button"
                  onClick={() => onExampleClick(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-error)]">
              Rejected
            </span>
            <div className="flex flex-wrap gap-2">
              {examples.rejected.map((example) => (
                <button
                  key={`rejected-${example || "empty"}`}
                  className="tag-button"
                  type="button"
                  onClick={() => onExampleClick(example)}
                >
                  {example || "empty"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
