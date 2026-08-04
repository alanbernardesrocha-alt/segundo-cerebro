"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import type { GraphData } from "@/lib/types";

const WIDTH = 900;
const HEIGHT = 560;

type SimNode = {
  id: string;
  title: string;
  type: string;
  spaceName: string;
  spaceColor: string;
  x: number;
  y: number;
};

const TYPE_ICON: Record<string, string> = { NOTE: "📝", FILE: "📎", LINK: "🔗" };

export default function GraphView({ data }: { data: GraphData }) {
  const router = useRouter();
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);
  const dragMoved = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (data.nodes.length === 0) {
      setNodes([]);
      return;
    }
    const simNodes: SimNode[] = data.nodes.map((n, i) => ({
      ...n,
      x: WIDTH / 2 + Math.cos(i) * 120 + (Math.random() - 0.5) * 60,
      y: HEIGHT / 2 + Math.sin(i) * 120 + (Math.random() - 0.5) * 60,
    }));
    const simLinks = data.edges.map((e) => ({ ...e, source: e.source, target: e.target }));

    const simulation = forceSimulation(simNodes as unknown as { x: number; y: number }[])
      .force("charge", forceManyBody().strength(-260))
      .force(
        "link",
        forceLink(simLinks as never[])
          .id((d) => (d as unknown as SimNode).id)
          .distance(100)
      )
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collide", forceCollide(38))
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();
    setNodes([...simNodes]);
  }, [data]);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Conexões sugeridas automaticamente: itens do MESMO tema que ainda não estão ligados.
  // Ligamos em cadeia (não todos-com-todos) para o mapa não virar um emaranhado.
  const autoEdges = useMemo(() => {
    const confirmed = new Set(
      data.edges.map((e) => [e.source, e.target].sort().join("::"))
    );
    const bySpace = new Map<string, string[]>();
    for (const n of data.nodes) {
      const arr = bySpace.get(n.spaceName) ?? [];
      arr.push(n.id);
      bySpace.set(n.spaceName, arr);
    }
    const auto: { id: string; source: string; target: string }[] = [];
    for (const ids of bySpace.values()) {
      for (let i = 0; i < ids.length - 1; i++) {
        const a = ids[i];
        const b = ids[i + 1];
        const key = [a, b].sort().join("::");
        if (!confirmed.has(key)) {
          auto.push({ id: `auto-${key}`, source: a, target: b });
        }
      }
    }
    return auto;
  }, [data]);

  function onPointerDown(id: string) {
    dragId.current = id;
    dragMoved.current = false;
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragId.current || !svgRef.current) return;
    dragMoved.current = true;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * HEIGHT;
    setNodes((prev) => prev.map((n) => (n.id === dragId.current ? { ...n, x, y } : n)));
  }

  function onPointerUp() {
    dragId.current = null;
  }

  if (data.nodes.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-[#c9a35f]/60 bg-[#fffdf6] px-6 py-16 text-center">
        <p className="text-sm text-[#6b6558]">
          Ainda não há itens suficientes aqui para desenhar um grafo. Crie notas e conecte-as
          entre si.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Legenda */}
      <div className="mb-3 flex flex-wrap items-center gap-4 px-1">
        <span className="flex items-center gap-2 font-stamp text-[10px] text-[#6b5c47]">
          <svg width="26" height="8">
            <line x1="0" y1="4" x2="26" y2="4" stroke="#6b4a2f" strokeWidth="1.6" opacity="0.6" />
          </svg>
          conexão
        </span>
        <span className="flex items-center gap-2 font-stamp text-[10px] text-[#6b5c47]">
          <svg width="26" height="8">
            <line
              x1="0"
              y1="4"
              x2="26"
              y2="4"
              stroke="#c99a45"
              strokeWidth="1.6"
              strokeDasharray="4 4"
            />
          </svg>
          sugerida (automática)
        </span>
      </div>

      <div className="overflow-hidden border border-[#6B4A2F]/40 bg-[#fffdf6] shadow-[inset_0_0_0_1px_rgba(201,154,69,0.35)]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full touch-none"
          style={{ height: HEIGHT }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* arestas sugeridas automaticamente (tracejado dourado marchando) */}
          {autoEdges.map((edge) => {
            const s = nodeById.get(edge.source);
            const t = nodeById.get(edge.target);
            if (!s || !t) return null;
            return (
              <line
                key={edge.id}
                className="graph-auto-edge"
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
              />
            );
          })}

          {/* arestas confirmadas */}
          {data.edges.map((edge) => {
            const s = nodeById.get(edge.source);
            const t = nodeById.get(edge.target);
            if (!s || !t) return null;
            const hot = hoveredId === edge.source || hoveredId === edge.target;
            return (
              <line
                key={edge.id}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="#6b4a2f"
                strokeWidth={hot ? 2.4 : 1.6}
                opacity={hot ? 0.85 : 0.5}
              />
            );
          })}

          {nodes.map((node, i) => (
            <g
              key={node.id}
              className="graph-node"
              transform={`translate(${node.x},${node.y})`}
              onPointerDown={() => onPointerDown(node.id)}
              onPointerEnter={() => setHoveredId(node.id)}
              onPointerLeave={() => setHoveredId((h) => (h === node.id ? null : h))}
              onClick={() => {
                if (!dragMoved.current) router.push(`/items/${node.id}`);
              }}
            >
              <g
                className="graph-float"
                style={{
                  animationDuration: `${4.4 + (i % 3) * 0.7}s`,
                  animationDelay: `${(i % 7) * 0.37}s`,
                }}
              >
                <circle r={18} fill={node.spaceColor} stroke="#f7f0de" strokeWidth={2.5} />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                  style={{ pointerEvents: "none" }}
                >
                  {TYPE_ICON[node.type]}
                </text>
                <text
                  y={34}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#4a4436"
                  fontFamily="'Libre Baskerville', serif"
                  style={{ pointerEvents: "none" }}
                >
                  {node.title.length > 18 ? `${node.title.slice(0, 18)}…` : node.title}
                </text>
              </g>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
