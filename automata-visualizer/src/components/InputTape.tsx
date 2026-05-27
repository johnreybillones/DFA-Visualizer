import type { PlaybackMode } from "../hooks/useSimulationController";

interface InputTapeProps {
  input: string;
  activeIndex: number | null;
  consumedCount: number;
  playbackMode: PlaybackMode;
}

export function InputTape({
  input,
  activeIndex,
  consumedCount,
  playbackMode,
}: InputTapeProps) {
  const symbols = input.split("");

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label-kicker">Input Tape</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Consumed {consumedCount} of {symbols.length} symbols
          </p>
        </div>
        <span className="status-chip" data-tone={playbackMode}>
          {playbackMode}
        </span>
      </div>

      <div className="flex min-h-16 flex-wrap gap-2 border border-[var(--color-outline-muted)] bg-[var(--color-surface-strong)] p-3">
        {symbols.length === 0 ? (
          <span className="font-[var(--font-display)] text-sm text-[var(--color-text-muted)]">
            Empty string
          </span>
        ) : (
          symbols.map((symbol, index) => {
            const isConsumed = index < consumedCount;
            const isActive = activeIndex === index;

            return (
              <span
                key={`${symbol}-${index}`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center border px-3 font-[var(--font-display)] text-base"
                data-active={isActive}
                data-consumed={isConsumed}
              >
                {symbol}
              </span>
            );
          })
        )}
      </div>
    </section>
  );
}
