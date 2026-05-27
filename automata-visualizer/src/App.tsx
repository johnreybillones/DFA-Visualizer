import { useState } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { GraphCanvas } from "./components/GraphCanvas";
import { InputTape } from "./components/InputTape";
import { StatusPanel } from "./components/StatusPanel";
import { TopBar } from "./components/TopBar";
import { TracePanel } from "./components/TracePanel";
import { automataCatalog } from "./data/automataCatalog";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useSimulationController } from "./hooks/useSimulationController";
import type { DfaId } from "./types/dfa";

function App() {
  const [selectedId, setSelectedId] = useState<DfaId>("regex1");
  const [activeTab, setActiveTab] = useState<"DFA" | "CFG" | "PDA">("DFA");
  const definition = automataCatalog[selectedId];
  const reducedMotion = usePrefersReducedMotion();
  const controller = useSimulationController({
    definition,
    reducedMotion,
  });

  const activeTapeIndex =
    controller.playbackMode === "running" &&
    controller.result &&
    controller.currentStepIndex < controller.result.steps.length
      ? controller.currentStepIndex
      : controller.currentSymbolIndex;

  return (
    <main className="flex h-dvh flex-col px-3 py-3 text-[var(--color-text)] sm:px-4 lg:px-6">
      <div className="mx-auto flex h-full w-full max-w-[96rem] flex-col gap-3">
        <TopBar
          definition={definition}
          selectedId={selectedId}
          onChange={(id) => setSelectedId(id)}
        />

        <div className="flex gap-4 border-b border-[var(--color-outline-muted)] px-2">
          {(["DFA", "CFG", "PDA"] as const).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-semibold tracking-wide transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-white text-white"
                  : "border-b-2 border-transparent text-[var(--color-text-muted)] hover:text-white"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "DFA" && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 xl:flex-row">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
              <div className="min-h-0 flex-1">
                <GraphCanvas
                  activeStep={controller.activeStep}
                  currentStateId={controller.currentStateId}
                  dfa={definition.dfa}
                  playbackMode={controller.playbackMode}
                  reducedMotion={reducedMotion}
                  speed={controller.speed}
                  visitedStates={controller.visitedStates}
                />
              </div>

              <div className="shrink-0">
                <InputTape
                  activeIndex={activeTapeIndex}
                  consumedCount={controller.traceSteps.length}
                  input={controller.input}
                  playbackMode={controller.playbackMode}
                />
              </div>
            </div>

            <aside className="flex w-full shrink-0 flex-col gap-3 overflow-y-auto xl:w-[22rem]">
              <ControlPanel
                alphabet={definition.alphabet}
                error={controller.playbackMode === "invalid" ? controller.result?.error ?? null : null}
                examples={{
                  accepted: definition.acceptedExamples,
                  rejected: definition.rejectedExamples,
                }}
                input={controller.input}
                playbackMode={controller.playbackMode}
                speed={controller.speed}
                onExampleClick={(value) => controller.setInput(value)}
                onInputChange={(value) => controller.setInput(value)}
                onPause={() => controller.pause()}
                onReset={() => controller.reset()}
                onRun={() => controller.run()}
                onSpeedChange={(value) => controller.setSpeed(value)}
                onStep={() => controller.step()}
                onValidate={() => controller.validate()}
              />

              <StatusPanel
                currentStateId={controller.currentStateId}
                currentSymbol={controller.currentSymbol}
                error={controller.result?.error ?? null}
                isAccepted={controller.result ? controller.result.isAccepted : null}
                playbackMode={controller.playbackMode}
              />

              <TracePanel steps={controller.traceSteps} />
            </aside>
          </div>
        )}

        {activeTab === "CFG" && (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded border border-dashed border-[var(--color-outline-muted)] text-[var(--color-text-muted)]">
            CFG Content Placeholder
          </div>
        )}

        {activeTab === "PDA" && (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded border border-dashed border-[var(--color-outline-muted)] text-[var(--color-text-muted)]">
            PDA Content Placeholder
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
