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
    <main className="flex min-h-dvh xl:h-dvh flex-col px-2 py-2 text-[var(--color-text)] sm:px-4 lg:px-6">
      <div className="mx-auto flex xl:h-full w-full max-w-[96rem] flex-col gap-2">
        <TopBar
          definition={definition}
          selectedId={selectedId}
          onChange={(id) => setSelectedId(id)}
        />

        <div className="sticky top-0 z-20 flex gap-4 border-b border-[var(--color-outline-muted)] bg-[var(--color-background)] px-2 pt-2">
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
          <div className="flex xl:min-h-0 xl:flex-1 flex-col gap-2 xl:flex-row">
            <div className="flex xl:min-h-0 min-w-0 xl:flex-1 flex-col gap-2">
              <div className="h-[26rem] xl:h-auto xl:flex-1">
                <GraphCanvas
                  activeStep={controller.activeStep}
                  currentStateId={controller.currentStateId}
                  dfa={definition.dfa}
                  playbackMode={controller.playbackMode}
                  result={controller.result}
                  reducedMotion={reducedMotion}
                  speed={controller.speed}
                  visitedStates={controller.visitedStates}
                />
              </div>

              <div className="shrink-0 min-w-0">
                <InputTape
                  activeIndex={activeTapeIndex}
                  consumedCount={controller.traceSteps.length}
                  input={controller.input}
                  playbackMode={controller.playbackMode}
                />
              </div>
            </div>

            <aside className="flex w-full shrink-0 flex-col gap-3 xl:overflow-y-auto xl:w-[22rem]">
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
          <div className="grid grid-cols-1 gap-6 p-2 md:grid-cols-2 md:p-6 xl:min-h-0 xl:flex-1 xl:overflow-y-auto content-start">
            <section className="panel-surface flex flex-col p-6 rounded-lg border border-[var(--color-outline-muted)]">
              <h2 className="label-kicker mb-4 text-lg">CFG 1</h2>
              <div className="bg-[var(--color-surface-strong)] p-5 rounded font-mono text-base text-[var(--color-text)] space-y-3 tracking-wide">
                <div>S &rarr; a A | b A</div>
                <div>A &rarr; a A | b A | aa B | bb B</div>
                <div>B &rarr; ab C | ba C</div>
                <div>C &rarr; a C | b C | aba | baa</div>
              </div>
            </section>

            <section className="panel-surface flex flex-col p-6 rounded-lg border border-[var(--color-outline-muted)]">
              <h2 className="label-kicker mb-4 text-lg">CFG 2</h2>
              <div className="bg-[var(--color-surface-strong)] p-5 rounded font-mono text-base text-[var(--color-text)] space-y-3 tracking-wide">
                <div>S &rarr; 11 A | 00 A</div>
                <div>A &rarr; 1 A | 0 A | 101 B | 111 B | 01 B</div>
                <div>B &rarr; 0 C | 1 D</div>
                <div>C &rarr; 0 C | 1 | 0 | 11</div>
                <div>D &rarr; 1 D | 1 | 0 | 11</div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "PDA" && (
          <div className="flex xl:min-h-0 xl:flex-1 flex-col gap-6 p-2 md:p-6 xl:overflow-y-auto">
            <section className="panel-surface flex flex-col p-6 rounded-lg border border-[var(--color-outline-muted)]">
              <h2 className="label-kicker mb-4 text-lg">PDA 1</h2>
              <div className="bg-[var(--color-surface-strong)] p-2 rounded flex justify-center overflow-hidden">
                <img src="/pda-1.png" alt="PDA 1 Flowchart" className="max-w-full object-contain max-h-[800px] rounded" />
              </div>
            </section>

            <section className="panel-surface flex flex-col p-6 rounded-lg border border-[var(--color-outline-muted)]">
              <h2 className="label-kicker mb-4 text-lg">PDA 2</h2>
              <div className="bg-[var(--color-surface-strong)] p-2 rounded flex justify-center overflow-hidden">
                <img src="/pda-2.png" alt="PDA 2 Flowchart" className="max-w-full object-contain max-h-[800px] rounded" />
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
