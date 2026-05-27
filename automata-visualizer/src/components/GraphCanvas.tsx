import { useEffect, useRef, useState } from "react";
import {
  getEdgeLayouts,
  getGraphBounds,
  getPointOnEdge,
  type EdgeLayout,
} from "../lib/graphGeometry";
import {
  fitGraphToViewport,
  panViewport,
  resetViewport,
  zoomViewportAtPoint,
  type ViewportTransform,
} from "../lib/graphViewport";
import type { PlaybackMode } from "../hooks/useSimulationController";
import type { DfaGraph, SimulationResult, SimulationStep } from "../types/dfa";

interface GraphCanvasProps {
  dfa: DfaGraph;
  currentStateId: string;
  visitedStates: string[];
  activeStep: SimulationStep | null;
  playbackMode: PlaybackMode;
  result: SimulationResult | null;
  speed: number;
  reducedMotion: boolean;
}

const DEFAULT_VIEWPORT = { width: 960, height: 640 };

function findActiveLayout(layouts: EdgeLayout[], activeStep: SimulationStep | null) {
  if (!activeStep) {
    return null;
  }

  return (
    layouts.find((layout) =>
      layout.key.startsWith(`${activeStep.from}->${activeStep.to}:${activeStep.edgeLabel}:`),
    ) ?? null
  );
}

export function GraphCanvas({
  dfa,
  currentStateId,
  visitedStates,
  activeStep,
  playbackMode,
  result,
  speed,
  reducedMotion,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState(DEFAULT_VIEWPORT);
  const [transform, setTransform] = useState<ViewportTransform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });

  // Track the previous step to detect node arrival (for pulse ring)
  const prevStepRef = useRef<SimulationStep | null>(null);
  const [pulsingNodeId, setPulsingNodeId] = useState<string | null>(null);
  const pulseTimerRef = useRef<number | null>(null);

  // Track rejected state for shake animation
  const [rejectedNodeId, setRejectedNodeId] = useState<string | null>(null);
  const rejectedTimerRef = useRef<number | null>(null);

  // Track accepted state for ring burst animation
  const [acceptedNodeId, setAcceptedNodeId] = useState<string | null>(null);
  const acceptedTimerRef = useRef<number | null>(null);

  const bounds = getGraphBounds(dfa);
  const layouts = getEdgeLayouts(dfa, { nodeRadius: 30 });
  const activeLayout = findActiveLayout(layouts, activeStep);
  const fitOptions = {
    width: viewportSize.width,
    height: viewportSize.height,
    padding: 48,
    minScale: 0.18,
    maxScale: 2.8,
  };

  useEffect(() => {
    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      setViewportSize({
        width: rect?.width || DEFAULT_VIEWPORT.width,
        height: rect?.height || DEFAULT_VIEWPORT.height,
      });
    };

    updateSize();

    if (!containerRef.current || !("ResizeObserver" in window)) {
      return;
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setTransform(fitGraphToViewport(bounds, fitOptions));
  }, [dfa, viewportSize.height, viewportSize.width]);

  // Detect step changes → fire pulse ring on arrival node
  useEffect(() => {
    if (reducedMotion) return;
    if (activeStep && activeStep !== prevStepRef.current) {
      prevStepRef.current = activeStep;
      setPulsingNodeId(activeStep.to);
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = window.setTimeout(() => setPulsingNodeId(null), 600);
    }
  }, [activeStep, reducedMotion]);

  // Detect terminal state → fire accepted rings or rejected shake
  useEffect(() => {
    if (reducedMotion || !result) return;

    if (playbackMode === "complete" || playbackMode === "validated") {
      const finalState = result.finalState;
      if (result.isAccepted) {
        setAcceptedNodeId(finalState);
        if (acceptedTimerRef.current !== null) window.clearTimeout(acceptedTimerRef.current);
        acceptedTimerRef.current = window.setTimeout(() => setAcceptedNodeId(null), 900);
      } else {
        setRejectedNodeId(finalState);
        if (rejectedTimerRef.current !== null) window.clearTimeout(rejectedTimerRef.current);
        rejectedTimerRef.current = window.setTimeout(() => setRejectedNodeId(null), 500);
      }
    }
  }, [playbackMode, result, reducedMotion]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
      if (rejectedTimerRef.current !== null) window.clearTimeout(rejectedTimerRef.current);
      if (acceptedTimerRef.current !== null) window.clearTimeout(acceptedTimerRef.current);
    };
  }, []);

  const [controlsIdle, setControlsIdle] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);

  const resetControlsTimer = () => {
    setControlsIdle(false);
    if (controlsTimeoutRef.current !== null) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      setControlsIdle(true);
    }, 2000);
  };

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current !== null) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const tokenPoint = activeLayout
    ? getPointOnEdge(
        activeLayout,
        playbackMode === "running" && !reducedMotion ? 0.45 : 1,
      )
    : null;

  const currentNode = dfa.nodeMap[currentStateId];

  return (
    <section
      className="panel-surface relative flex h-full min-h-[20rem] flex-col overflow-hidden select-none"
      onPointerMove={resetControlsTimer}
    >
      <div
        className={`absolute right-4 top-4 z-10 flex gap-2 transition-opacity duration-500 ${
          controlsIdle ? "opacity-20 hover:opacity-100" : "opacity-100"
        }`}
        onPointerEnter={resetControlsTimer}
      >
        <button
          className="icon-button bg-[var(--color-surface-strong)]"
          type="button"
          aria-label="Zoom out"
          onClick={() => {
            resetControlsTimer();
            setTransform((current) =>
              zoomViewportAtPoint(
                current,
                { x: viewportSize.width / 2, y: viewportSize.height / 2 },
                0.88,
                { minScale: fitOptions.minScale, maxScale: fitOptions.maxScale },
              ),
            );
          }}
        >
          -
        </button>
        <button
          className="icon-button bg-[var(--color-surface-strong)]"
          type="button"
          aria-label="Zoom in"
          onClick={() => {
            resetControlsTimer();
            setTransform((current) =>
              zoomViewportAtPoint(
                current,
                { x: viewportSize.width / 2, y: viewportSize.height / 2 },
                1.12,
                { minScale: fitOptions.minScale, maxScale: fitOptions.maxScale },
              ),
            );
          }}
        >
          +
        </button>
        <button
          className="icon-button bg-[var(--color-surface-strong)] px-3 text-xs"
          type="button"
          aria-label="Reset view"
          onClick={() => {
            resetControlsTimer();
            setTransform(resetViewport(bounds, fitOptions));
          }}
        >
          Reset
        </button>
      </div>

      <div
        ref={containerRef}
        className="bg-graph-paper relative flex-1 overflow-hidden"
        onPointerDown={(event) => {
          setIsDragging(true);
          setDragOrigin({ x: event.clientX, y: event.clientY });
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!isDragging) {
            return;
          }

          const delta = {
            x: event.clientX - dragOrigin.x,
            y: event.clientY - dragOrigin.y,
          };

          setDragOrigin({ x: event.clientX, y: event.clientY });
          setTransform((current) => panViewport(current, delta));
        }}
        onPointerUp={(event) => {
          setIsDragging(false);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerLeave={() => setIsDragging(false)}
        onWheel={(event) => {
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          const point = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          };

          setTransform((current) =>
            zoomViewportAtPoint(
              current,
              point,
              event.deltaY < 0 ? 1.08 : 0.92,
              { minScale: fitOptions.minScale, maxScale: fitOptions.maxScale },
            ),
          );
        }}
      >
        <svg className="h-full w-full" viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`}>
          <defs>
            {/* Standard arrowheads */}
            <marker
              id="arrowhead"
              markerHeight="8"
              markerWidth="8"
              orient="auto-start-reverse"
              refX="7"
              refY="4"
            >
              <path d="M0,0 L8,4 L0,8 z" fill="var(--color-outline-strong)" />
            </marker>
            <marker
              id="arrowhead-active"
              markerHeight="8"
              markerWidth="8"
              orient="auto-start-reverse"
              refX="7"
              refY="4"
            >
              <path d="M0,0 L8,4 L0,8 z" fill="var(--color-active-edge)" />
            </marker>

            {/* Layer 1: Token glow filter */}
            <filter id="token-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Layer 3: Node glow filter */}
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Layer 5: Accepted node green glow */}
            <filter id="accept-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 0.6   0 0 0 0 0.9   0 0 0 0 0.7   0 0 0 1 0"
                result="green"
              />
              <feGaussianBlur in="green" stdDeviation="6" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Layer 5: Rejected node red glow */}
            <filter id="reject-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 0.95  0 0 0 0 0.25  0 0 0 0 0.25  0 0 0 1 0"
                result="red"
              />
              <feGaussianBlur in="red" stdDeviation="6" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Layer 2: Traveling glow sweep filter — large dramatic bloom */}
            <filter id="edge-pulse-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="36" result="blur3" />
              <feMerge>
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g
            data-testid="graph-viewport"
            data-scale={transform.scale}
            transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}
          >
            {/* Initial state arrow */}
            <line
              x1={dfa.nodeMap.q0.x - 70}
              x2={dfa.nodeMap.q0.x - 34}
              y1={dfa.nodeMap.q0.y}
              y2={dfa.nodeMap.q0.y}
              markerEnd="url(#arrowhead)"
              stroke="var(--color-outline-strong)"
              strokeWidth="2"
            />

            {/* ── Edges ── */}
            {layouts.map((layout) => {
              const isActive =
                activeLayout?.sourceId === layout.sourceId &&
                activeLayout?.targetId === layout.targetId &&
                activeLayout?.label === layout.label;

              return (
                <g key={layout.key}>
                  {/* Base edge path */}
                  <path
                    d={layout.path}
                    fill="none"
                    markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                    stroke={isActive ? "var(--color-active-edge)" : "var(--color-outline-strong)"}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{ transition: "stroke 200ms ease, stroke-width 200ms ease" }}
                  />

                  {/* Layer 2: Single glow sweep on active edge only — duration = speed */}
                  {isActive && !reducedMotion && (
                    <circle
                      key={`sweep-${activeStep?.edgeKey}`}
                      r="11"
                      fill="var(--color-active-edge)"
                      filter="url(#edge-pulse-glow)"
                      opacity="0"
                    >
                      <animateMotion
                        dur={`${speed}ms`}
                        fill="freeze"
                        path={layout.path}
                      />
                      {/* Bright leading edge → dims as it passes → fades out at target */}
                      <animate
                        attributeName="opacity"
                        values="0;0;1;0.7;0.3;0"
                        keyTimes="0;0.05;0.2;0.55;0.85;1"
                        dur={`${speed}ms`}
                        fill="freeze"
                      />
                      {/* Orb grows as it launches then shrinks into target */}
                      <animate
                        attributeName="r"
                        values="8;13;15;12;9;7"
                        keyTimes="0;0.05;0.2;0.55;0.85;1"
                        dur={`${speed}ms`}
                        fill="freeze"
                      />
                    </circle>
                  )}

                  {/* Edge label background */}
                  <rect
                    x={layout.labelPoint.x - 20}
                    y={layout.labelPoint.y - 12}
                    width={40}
                    height={24}
                    fill="var(--color-surface)"
                    stroke={isActive ? "var(--color-active-edge)" : "var(--color-outline-muted)"}
                    strokeWidth={isActive ? 1.5 : 1}
                    style={{ transition: "stroke 200ms ease" }}
                  />
                  <text
                    fill={isActive ? "var(--color-active-edge)" : "var(--color-text)"}
                    fontFamily="var(--font-display)"
                    fontSize="20"
                    textAnchor="middle"
                    x={layout.labelPoint.x}
                    y={layout.labelPoint.y + 5}
                    style={{ transition: "fill 200ms ease" }}
                  >
                    {layout.label}
                  </text>
                </g>
              );
            })}

            {/* ── Nodes ── */}
            {Object.values(dfa.nodeMap).map((node) => {
              const isCurrent = node.id === currentStateId;
              const isVisited = visitedStates.includes(node.id);
              const isFinal = dfa.finalNodes.includes(node.id);
              const isStart = node.id === "q0";
              const isPulsing = pulsingNodeId === node.id;
              const isRejected = rejectedNodeId === node.id;
              const isAccepted = acceptedNodeId === node.id;

              // Persistent final evaluation states
              const isTerminal = playbackMode === "complete" || playbackMode === "validated";
              const isTerminalAccepted = isTerminal && result?.isAccepted && node.id === currentStateId;
              const isTerminalRejected = isTerminal && !result?.isAccepted && node.id === currentStateId;

              let label = "";
              if (isStart && isFinal) label = "±";
              else if (isStart) label = "-";
              else if (isFinal) label = "+";

              // Determine node stroke color
              let strokeColor = "var(--color-outline-strong)";
              if (isAccepted || isTerminalAccepted) strokeColor = "var(--color-success)";
              else if (isRejected || isTerminalRejected) strokeColor = "var(--color-error)";
              else if (isCurrent) strokeColor = "var(--color-active-node)";

              return (
                <g
                  key={node.id}
                  data-testid={`node-${node.id}`}
                  data-state={isCurrent ? "current" : "default"}
                  data-visited={isVisited ? "true" : "false"}
                  transform={`translate(${node.x} ${node.y})`}
                >
                  {/* Layer 3: Pulse ring on node arrival */}
                  {isPulsing && !reducedMotion && (
                    <circle cx="0" cy="0" r="30" fill="none" stroke="var(--color-active-node)" strokeWidth="2" opacity="0">
                      <animate attributeName="r" from="30" to="56" dur="550ms" fill="freeze" />
                      <animate attributeName="opacity" values="0.65;0" dur="550ms" fill="freeze" />
                      <animate attributeName="stroke-width" from="2" to="0.4" dur="550ms" fill="freeze" />
                    </circle>
                  )}

                  {/* Layer 5: Accept double rings */}
                  {isAccepted && !reducedMotion && (
                    <>
                      <circle cx="0" cy="0" r="30" fill="none" stroke="var(--color-success)" strokeWidth="2" opacity="0">
                        <animate attributeName="r" from="30" to="62" dur="700ms" fill="freeze" />
                        <animate attributeName="opacity" values="0.7;0" dur="700ms" fill="freeze" />
                      </circle>
                      <circle cx="0" cy="0" r="30" fill="none" stroke="var(--color-success)" strokeWidth="1.5" opacity="0">
                        <animate attributeName="r" from="30" to="48" dur="700ms" begin="100ms" fill="freeze" />
                        <animate attributeName="opacity" values="0.5;0" dur="700ms" begin="100ms" fill="freeze" />
                      </circle>
                    </>
                  )}

                  {/* Node body — glow applied when current, accepted or rejected */}
                  <g
                    className={isCurrent && !reducedMotion ? "node-enter" : undefined}
                    style={isRejected && !reducedMotion ? { animation: "node-reject-shake 400ms ease-out" } : undefined}
                    filter={
                      (isAccepted || isTerminalAccepted) && !reducedMotion
                        ? "url(#accept-glow)"
                        : (isRejected || isTerminalRejected) && !reducedMotion
                          ? "url(#reject-glow)"
                          : isCurrent && !reducedMotion
                            ? "url(#node-glow)"
                            : undefined
                    }
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r="30"
                      fill={
                        isCurrent
                          ? "var(--color-surface)"
                          : isVisited
                            ? "var(--color-visited-node)"
                            : "var(--color-surface-strong)"
                      }
                      stroke={strokeColor}
                      strokeWidth={isCurrent || isAccepted || isRejected || isTerminalAccepted || isTerminalRejected ? 3 : 2}
                      style={{
                        transition: "fill 400ms ease-out, stroke 250ms ease-out, stroke-width 250ms ease-out",
                      }}
                    />
                    <text
                      fill={
                        (isAccepted || isTerminalAccepted)
                          ? "var(--color-success)"
                          : (isRejected || isTerminalRejected)
                            ? "var(--color-error)"
                            : "var(--color-text)"
                      }
                      fontFamily="var(--font-display)"
                      fontSize="32"
                      textAnchor="middle"
                      y="9"
                      style={{ transition: "fill 250ms ease-out" }}
                    >
                      {label}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* ── Layer 1: Single large glow sweep — 1 pass per step, no trail ── */}
            {activeLayout && playbackMode === "running" && !reducedMotion ? (
              <g key={activeStep?.edgeKey}>
                {/* Outer halo: very large, fades as it passes */}
                <circle
                  r="10"
                  fill="var(--color-active-edge)"
                  filter="url(#edge-pulse-glow)"
                  opacity="0"
                >
                  <animateMotion
                    dur={`${speed}ms`}
                    fill="remove"
                    path={activeLayout.path}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0;0.85;0.55;0.2;0"
                    keyTimes="0;0.04;0.18;0.52;0.82;1"
                    dur={`${speed}ms`}
                    fill="remove"
                  />
                  <animate
                    attributeName="r"
                    values="6;12;22;18;12;8"
                    keyTimes="0;0.04;0.18;0.52;0.82;1"
                    dur={`${speed}ms`}
                    fill="remove"
                  />
                </circle>

                {/* Bright inner core */}
                <circle
                  r="5"
                  fill="white"
                  filter="url(#token-glow)"
                  opacity="0"
                >
                  <animateMotion
                    dur={`${speed}ms`}
                    fill="remove"
                    path={activeLayout.path}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0;1;0.8;0.3;0"
                    keyTimes="0;0.04;0.18;0.52;0.82;1"
                    dur={`${speed}ms`}
                    fill="remove"
                  />
                </circle>
              </g>
            ) : tokenPoint ? (
              /* Paused / stepped — static dot at last arrived node */
              <circle
                cx={tokenPoint.x}
                cy={tokenPoint.y}
                r="7"
                fill="var(--color-active-edge)"
                filter="url(#token-glow)"
                opacity="0.9"
              />
            ) : null}

            {/* "Active state" label under current node */}
            {currentNode ? (() => {
              const isTerminal = playbackMode === "complete" || playbackMode === "validated";
              const isTerminalAccepted = isTerminal && result?.isAccepted;
              const isTerminalRejected = isTerminal && !result?.isAccepted;

              let labelColor = "var(--color-text-muted)";
              let labelText = "Active state";
              if (isTerminalAccepted) {
                labelColor = "var(--color-success)";
                labelText = "Accepted state";
              } else if (isTerminalRejected) {
                labelColor = "var(--color-error)";
                labelText = "Rejected state";
              }

              return (
                <text
                  fill={labelColor}
                  fontFamily="var(--font-display)"
                  fontSize="14"
                  x={currentNode.x}
                  y={currentNode.y + 54}
                  textAnchor="middle"
                  style={{ transition: "fill 300ms ease" }}
                >
                  {labelText}
                </text>
              );
            })() : null}
          </g>
        </svg>
      </div>
    </section>
  );
}
