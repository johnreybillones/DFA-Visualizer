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
import type { DfaGraph, SimulationStep } from "../types/dfa";

interface GraphCanvasProps {
  dfa: DfaGraph;
  currentStateId: string;
  visitedStates: string[];
  activeStep: SimulationStep | null;
  playbackMode: PlaybackMode;
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
  speed,
  reducedMotion,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState(DEFAULT_VIEWPORT);
  const [transform, setTransform] = useState<ViewportTransform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });

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

  const tokenPoint = activeLayout
    ? getPointOnEdge(
        activeLayout,
        playbackMode === "running" && !reducedMotion ? 0.45 : 1,
      )
    : dfa.nodeMap[currentStateId];

  const currentNode = dfa.nodeMap[currentStateId];

  return (
    <section className="panel-surface relative flex h-full min-h-[20rem] flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-outline-muted)] px-4 py-3">
        <div>
          <p className="label-kicker">Graph canvas</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Drag to pan, zoom with the wheel, or use the controls.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="icon-button"
            type="button"
            aria-label="Zoom out"
            onClick={() =>
              setTransform((current) =>
                zoomViewportAtPoint(
                  current,
                  { x: viewportSize.width / 2, y: viewportSize.height / 2 },
                  0.88,
                  { minScale: fitOptions.minScale, maxScale: fitOptions.maxScale },
                ),
              )
            }
          >
            -
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Zoom in"
            onClick={() =>
              setTransform((current) =>
                zoomViewportAtPoint(
                  current,
                  { x: viewportSize.width / 2, y: viewportSize.height / 2 },
                  1.12,
                  { minScale: fitOptions.minScale, maxScale: fitOptions.maxScale },
                ),
              )
            }
          >
            +
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Reset view"
            onClick={() => setTransform(resetViewport(bounds, fitOptions))}
          >
            Reset
          </button>
        </div>
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
          </defs>

          <g
            data-testid="graph-viewport"
            data-scale={transform.scale}
            transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}
          >
            <line
              x1={dfa.nodeMap.q0.x - 70}
              x2={dfa.nodeMap.q0.x - 34}
              y1={dfa.nodeMap.q0.y}
              y2={dfa.nodeMap.q0.y}
              markerEnd="url(#arrowhead)"
              stroke="var(--color-outline-strong)"
              strokeWidth="2"
            />

            {layouts.map((layout) => {
              const isActive =
                activeLayout?.sourceId === layout.sourceId &&
                activeLayout?.targetId === layout.targetId &&
                activeLayout?.label === layout.label;

              return (
                <g key={layout.key}>
                  <path
                    d={layout.path}
                    fill="none"
                    markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                    stroke={isActive ? "var(--color-active-edge)" : "var(--color-outline-strong)"}
                    strokeWidth={isActive ? 3 : 2}
                  />
                  <rect
                    x={layout.labelPoint.x - 20}
                    y={layout.labelPoint.y - 12}
                    width={40}
                    height={24}
                    fill="var(--color-surface)"
                    stroke="var(--color-outline-muted)"
                    strokeWidth="1"
                  />
                  <text
                    fill={isActive ? "var(--color-active-edge)" : "var(--color-text)"}
                    fontFamily="var(--font-display)"
                    fontSize="11"
                    textAnchor="middle"
                    x={layout.labelPoint.x}
                    y={layout.labelPoint.y + 4}
                  >
                    {layout.label}
                  </text>
                </g>
              );
            })}

            {Object.values(dfa.nodeMap).map((node) => {
              const isCurrent = node.id === currentStateId;
              const isVisited = visitedStates.includes(node.id);
              const isFinal = dfa.finalNodes.includes(node.id);

              return (
                <g
                  key={node.id}
                  data-testid={`node-${node.id}`}
                  data-state={isCurrent ? "current" : "default"}
                  data-visited={isVisited ? "true" : "false"}
                  transform={`translate(${node.x} ${node.y})`}
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
                    stroke={isCurrent ? "var(--color-active-node)" : "var(--color-outline-strong)"}
                    strokeWidth={isCurrent ? 3 : 2}
                  />
                  {isFinal ? (
                    <circle
                      cx="0"
                      cy="0"
                      r="23"
                      fill="none"
                      stroke="var(--color-outline-strong)"
                      strokeWidth="2"
                    />
                  ) : null}
                  <text
                    fill="var(--color-text)"
                    fontFamily="var(--font-display)"
                    fontSize="14"
                    textAnchor="middle"
                    y="5"
                  >
                    {node.id}
                  </text>
                </g>
              );
            })}

            {activeLayout && playbackMode === "running" && !reducedMotion ? (
              <circle
                key={activeStep?.edgeKey}
                fill="var(--color-active-edge)"
                opacity="0.95"
                r="6"
              >
                <animateMotion dur={`${speed}ms`} fill="freeze" path={activeLayout.path} />
              </circle>
            ) : tokenPoint ? (
              <circle
                cx={tokenPoint.x}
                cy={tokenPoint.y}
                fill="var(--color-active-edge)"
                opacity="0.95"
                r="6"
              />
            ) : null}

            {currentNode ? (
              <text
                fill="var(--color-text-muted)"
                fontFamily="var(--font-display)"
                fontSize="11"
                x={currentNode.x}
                y={currentNode.y + 54}
                textAnchor="middle"
              >
                Active state
              </text>
            ) : null}
          </g>
        </svg>
      </div>
    </section>
  );
}
