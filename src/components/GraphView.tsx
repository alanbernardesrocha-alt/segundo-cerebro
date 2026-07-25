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

type SimLink = {
  id: string;
  label: string | null;
  source: string;
  target: string;
};

const TYPE_ICON: Record<string, string> = { NOTE: "📝", FILE: "📎", LINK: "🔗" };

export default function GraphView({ data }: { data: GraphData }) {
  const router = useRouter();
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);
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

  function onPointerDown(id: string) {
    dragId.current = id;
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragId.current || !svgRef.current) return;
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
      <div className="rounded-2xl border border-dashed border-[#e7ddc9] bg-white/60 px-6 py-16 text-center">
        <p className="text-sm text-[#6b6558]">
          Ainda não há itens suficientes aqui para desenhar um grafo. Crie notas e conecte-as
          entre si.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e7ddc9] bg-white">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        style={{ height: HEIGHT }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {data.edges.map((edge) => {
          const s = nodeById.get(edge.source);
          const t = nodeById.get(edge.target);
          if (!s || !t) return null;
          return (
            <line
              key={edge.id}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke="#d8cfc0"
              strokeWidth={1.5}
            />
          );
        })}

        {nodes.map((node) => (
          <g
            key={node.id}
            transform={`translate(${node.x},${node.y})`}
            onPointerDown={() => onPointerDown(node.id)}
            onPointerEnter={() => setHoveredId(node.id)}
            onPointerLeave={() => setHoveredId((h) => (h === node.id ? null : h))}
            onClick={() => router.push(`/items/${node.id}`)}
            style={{ cursor: "pointer" }}
          >
            <circle r={16} fill={node.spaceColor} opacity={hoveredId === node.id ? 1 : 0.85} />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              style={{ pointerEvents: "none" }}
            >
              {TYPE_ICON[node.type]}
            </text>
            <text
              y={30}
              textAnchor="middle"
              fontSize={11}
              fill="#4a4436"
              style={{ pointerEvents: "none" }}
            >
              {node.title.length > 18 ? `${node.title.slice(0, 18)}…` : node.title}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
