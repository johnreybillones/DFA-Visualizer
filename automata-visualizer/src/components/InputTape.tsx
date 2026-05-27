import { useEffect, useRef } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIndex === null || !scrollContainerRef.current) return;
    // Account for the empty string span taking up children[0] if symbols is empty (but if empty, activeIndex is null)
    if (symbols.length === 0) return;
    
    const activeElement = scrollContainerRef.current.children[activeIndex] as HTMLElement | undefined;
    if (activeElement) {
      const container = scrollContainerRef.current;
      const elementRect = activeElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (elementRect.left < containerRect.left || elementRect.right > containerRect.right) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeIndex, symbols.length]);

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

      <div 
        ref={scrollContainerRef}
        className="flex min-h-[4.5rem] gap-2 overflow-x-auto overflow-y-hidden border border-[var(--color-outline-muted)] bg-[var(--color-surface-strong)] p-3"
      >
        {symbols.length === 0 ? (
          <span className="shrink-0 font-[var(--font-display)] text-sm text-[var(--color-text-muted)]">
            Empty string
          </span>
        ) : (
          symbols.map((symbol, index) => {
            const isConsumed = index < consumedCount;
            const isActive = activeIndex === index;

            return (
              <span
                key={`${symbol}-${index}`}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center border px-3 font-[var(--font-display)] text-base"
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
