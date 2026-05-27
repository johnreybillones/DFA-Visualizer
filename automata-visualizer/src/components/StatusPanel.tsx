import type { PlaybackMode } from "../hooks/useSimulationController";

interface StatusPanelProps {
  playbackMode: PlaybackMode;
  isAccepted: boolean | null;
  error: string | null;
  currentStateId: string;
  currentSymbol: string | null;
}

function getStatusCopy(
  playbackMode: PlaybackMode,
  isAccepted: boolean | null,
  error: string | null,
) {
  if (playbackMode === "invalid") {
    return {
      tone: "error",
      headline: "Invalid input",
      detail: error ?? "Input contains symbols outside the selected alphabet.",
    };
  }

  if (playbackMode === "running") {
    return {
      tone: "running",
      headline: "Running",
      detail: "The controller is traversing one transition at a time.",
    };
  }

  if (playbackMode === "paused") {
    return {
      tone: "paused",
      headline: "Paused",
      detail: "Playback is paused. Step forward or resume with Run.",
    };
  }

  if ((playbackMode === "validated" || playbackMode === "complete") && isAccepted) {
    return {
      tone: "success",
      headline: "Accepted",
      detail: "The final state is accepting for the current input.",
    };
  }

  if ((playbackMode === "validated" || playbackMode === "complete") && isAccepted === false) {
    return {
      tone: "neutral",
      headline: "Rejected",
      detail: "The final state is not accepting for the current input.",
    };
  }

  return {
    tone: "idle",
    headline: "Idle",
    detail: "Choose a DFA, enter a string, then validate or animate the trace.",
  };
}

export function StatusPanel({
  playbackMode,
  isAccepted,
  error,
  currentStateId,
  currentSymbol,
}: StatusPanelProps) {
  const status = getStatusCopy(playbackMode, isAccepted, error);

  return (
    <section className="panel-section" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="label-kicker">Status</p>
          <h2 className="font-[var(--font-display)] text-xl text-[var(--color-text)]">
            {status.headline}
          </h2>
        </div>
        <span className="status-chip" data-tone={status.tone}>
          {status.tone}
        </span>
      </div>

      <p className="text-sm text-[var(--color-text-muted)]">{status.detail}</p>

      <dl className="grid gap-3 border border-[var(--color-outline-muted)] bg-[var(--color-surface-strong)] p-3 sm:grid-cols-2">
        <div>
          <dt className="label-kicker">Current state</dt>
          <dd className="mt-1 font-[var(--font-display)] text-lg text-[var(--color-text)]">
            {currentStateId}
          </dd>
        </div>
        <div>
          <dt className="label-kicker">Current symbol</dt>
          <dd className="mt-1 font-[var(--font-display)] text-lg text-[var(--color-text)]">
            {currentSymbol ?? "None"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
