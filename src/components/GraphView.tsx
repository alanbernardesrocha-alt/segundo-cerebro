"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import type { GraphData } from "@/lib/types";

const WIDTH = 900;
const HEIGHT = 620;
const PAD = 48; // margem interna: os nós nunca encostam na borda
const MIN_SCALE = 0.6;
const MAX_SCALE = 4;

type SimNode = {
  id: string;
  kind: "hub" | "item";
  title: string;
  type?: string;
  spaceName: string;
  color: string;
  r: number;
  x: number;
  y: number;
};

type View = { scale: number; tx: number; ty: number };

const TYPE_ICON: Record<string, string> = { NOTE: "📝", FILE: "📎", LINK: "🔗" };
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const hubId = (space: string) => `hub:${space}`;

export default function GraphView({ data }: { data: GraphData }) {
  const router = useRouter();
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [view, setView] = useState<View>({ scale: 1, tx: 0, ty: 0 });
  const dragId = useRef<string | null>(null);
  const dragMoved = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  // pointers ativos (coordenadas em unidades do viewBox) para pan + pinça
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchPrev = useRef<{ dist: number; cx: number; cy: number } | null>(null);
  const panPrev = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (data.nodes.length === 0) {
      setNodes([]);
      return;
    }

    const colorBySpace = new Map<string, string>();
    for (const n of data.nodes) {
      if (!colorBySpace.has(n.spaceName)) colorBySpace.set(n.spaceName, n.spaceColor);
    }
    const spaceNames = [...colorBySpace.keys()];

    const hubs: SimNode[] = spaceNames.map((name, i) => {
      const a = (i / Math.max(1, spaceNames.length)) * Math.PI * 2;
      return {
        id: hubId(name),
        kind: "hub",
        title: name,
        spaceName: name,
        color: colorBySpace.get(name) || "#6b4a2f",
        r: 27,
        x: WIDTH / 2 + Math.cos(a) * 190,
        y: HEIGHT / 2 + Math.sin(a) * 140,
      };
    });

    const items: SimNode[] = data.nodes.map((n, i) => {
      const a = i * 2.399;
      return {
        id: n.id,
        kind: "item",
        title: n.title,
        type: n.type,
        spaceName: n.spaceName,
        color: n.spaceColor,
        r: 18,
        x: WIDTH / 2 + Math.cos(a) * 100 + (Math.random() - 0.5) * 40,
        y: HEIGHT / 2 + Math.sin(a) * 100 + (Math.random() - 0.5) * 40,
      };
    });

    const simNodes = [...hubs, ...items];

    const spokeLinks = data.nodes.map((n) => ({
      source: n.id,
      target: hubId(n.spaceName),
      kind: "spoke" as const,
    }));
    const confirmedLinks = data.edges.map((e) => ({
      source: e.source,
      target: e.target,
      kind: "edge" as const,
    }));
    const links = [...spokeLinks, ...confirmedLinks];

    const simulation = forceSimulation(simNodes as never[])
      .force(
        "link",
        forceLink(links as never[])
          .id((d) => (d as unknown as SimNode).id)
          .distance((l) => ((l as { kind: string }).kind === "spoke" ? 88 : 130))
          .strength((l) => ((l as { kind: string }).kind === "spoke" ? 0.85 : 0.35))
      )
      .force("charge", forceManyBody().strength(-280))
      .force("collide", forceCollide((d) => (d as unknown as SimNode).r + 16))
      .force("x", forceX(WIDTH / 2).strength(0.05))
      .force("y", forceY(HEIGHT / 2).strength(0.08))
      .stop();

    for (let i = 0; i < 440; i++) simulation.tick();

    for (const n of simNodes) {
      n.x = clamp(n.x, PAD, WIDTH - PAD);
      n.y = clamp(n.y, PAD, HEIGHT - PAD);
    }
    setNodes(simNodes);
  }, [data]);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const spokes = useMemo(
    () => data.nodes.map((n) => ({ id: `sp-${n.id}`, item: n.id, hub: hubId(n.spaceName) })),
    [data]
  );

  // client XY -> coordenadas do viewBox (ignora o transform interno de zoom)
  function toViewBox(clientX: number, clientY: number) {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * WIDTH,
      y: ((clientY - rect.top) / rect.height) * HEIGHT,
    };
  }
  // viewBox -> coordenadas do grafo (desfaz zoom/pan) para arrastar nós
  function toGraph(vx: number, vy: number, v: View) {
    return { x: (vx - v.tx) / v.scale, y: (vy - v.ty) / v.scale };
  }

  // zoom mantendo o ponto (vx,vy) do viewBox fixo na tela
  function zoomAt(vx: number, vy: number, factor: number) {
    setView((v) => {
      const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE);
      const k = scale / v.scale;
      return { scale, tx: vx - (vx - v.tx) * k, ty: vy - (vy - v.ty) * k };
    });
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>, id?: string) {
    svgRef.current?.setPointerCapture?.(e.pointerId);
    const vb = toViewBox(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, vb);
    if (id) {
      dragId.current = id;
      dragMoved.current = false;
    } else if (pointers.current.size === 1) {
      panPrev.current = vb; // pan de fundo com 1 dedo
    }
    if (pointers.current.size === 2) {
      dragId.current = null; // pinça vence o arrasto
      const [a, b] = [...pointers.current.values()];
      pinchPrev.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
      };
    }
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const vb = toViewBox(e.clientX, e.clientY);
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, vb);

    // 2 dedos -> pinça (zoom + arrasto do conjunto)
    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const prev = pinchPrev.current;
      if (prev && prev.dist > 0) {
        setView((v) => {
          const scale = clamp(v.scale * (dist / prev.dist), MIN_SCALE, MAX_SCALE);
          const k = scale / v.scale;
          return {
            scale,
            tx: cx - (prev.cx - v.tx) * k,
            ty: cy - (prev.cy - v.ty) * k,
          };
        });
      }
      pinchPrev.current = { dist, cx, cy };
      return;
    }

    // arrastar um nó
    if (dragId.current) {
      dragMoved.current = true;
      const g = toGraph(vb.x, vb.y, view);
      setNodes((prev) =>
        prev.map((n) =>
          n.id === dragId.current
            ? { ...n, x: clamp(g.x, PAD, WIDTH - PAD), y: clamp(g.y, PAD, HEIGHT - PAD) }
            : n
        )
      );
      return;
    }

    // pan de fundo com 1 dedo/mouse
    if (panPrev.current) {
      const dx = vb.x - panPrev.current.x;
      const dy = vb.y - panPrev.current.y;
      panPrev.current = vb;
      setView((v) => ({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
    }
  }

  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchPrev.current = null;
    if (pointers.current.size === 0) {
      panPrev.current = null;
      dragId.current = null;
    } else {
      // se sobrou 1 dedo depois da pinça, ele reassume o pan
      panPrev.current = [...pointers.current.values()][0];
    }
  }

  function onWheel(e: React.WheelEvent<SVGSVGElement>) {
    const vb = toViewBox(e.clientX, e.clientY);
    zoomAt(vb.x, vb.y, e.deltaY < 0 ? 1.12 : 1 / 1.12);
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
            <line x1="0" y1="4" x2="26" y2="4" stroke="#8a6f3f" strokeWidth="1.8" opacity="0.7" />
          </svg>
          liga ao tema
        </span>
        <span className="flex items-center gap-2 font-stamp text-[10px] text-[#6b5c47]">
          <svg width="26" height="8">
            <line x1="0" y1="4" x2="26" y2="4" stroke="#6b4a2f" strokeWidth="2" opacity="0.7" />
          </svg>
          conexão entre itens
        </span>
        <span className="ml-auto font-stamp text-[10px] text-[#8a6f3f] sm:hidden">
          ✦ dois dedos para dar zoom
        </span>
      </div>

      <div
        className="relative overflow-hidden border border-[#6B4A2F]/40 bg-[#fffdf6] shadow-[inset_0_0_0_1px_rgba(201,154,69,0.35)]"
        style={{ width: "100%", aspectRatio: `${WIDTH} / ${HEIGHT}`, maxHeight: "72vh" }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full touch-none select-none"
          onPointerDown={(e) => onPointerDown(e)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
        >
          <g transform={`translate(${view.tx},${view.ty}) scale(${view.scale})`}>
            {/* raios: item → tema (tingidos pela cor do tema) */}
            {spokes.map((sp) => {
              const s = nodeById.get(sp.item);
              const t = nodeById.get(sp.hub);
              if (!s || !t) return null;
              const hot = hoveredId === sp.item || hoveredId === sp.hub;
              return (
                <line
                  key={sp.id}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke={t.color}
                  strokeWidth={hot ? 2.6 : 1.5}
                  opacity={hot ? 0.85 : 0.4}
                />
              );
            })}

            {/* conexões confirmadas entre itens */}
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
                  strokeWidth={hot ? 2.8 : 1.8}
                  opacity={hot ? 0.9 : 0.55}
                />
              );
            })}

            {/* nós-tema (hubs) */}
            {nodes
              .filter((n) => n.kind === "hub")
              .map((node) => (
                <g
                  key={node.id}
                  className="graph-node"
                  transform={`translate(${node.x},${node.y})`}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onPointerDown(e, node.id);
                  }}
                  onPointerEnter={() => setHoveredId(node.id)}
                  onPointerLeave={() => setHoveredId((h) => (h === node.id ? null : h))}
                >
                  <circle r={node.r + 5} fill={node.color} opacity={0.14} />
                  <circle r={node.r} fill="#fffdf6" stroke={node.color} strokeWidth={3} />
                  <circle r={node.r - 8} fill={node.color} opacity={0.85} />
                  <text
                    y={node.r + 17}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={700}
                    fill="#3a332a"
                    fontFamily="'Libre Baskerville', serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {node.title.length > 20 ? `${node.title.slice(0, 20)}…` : node.title}
                  </text>
                </g>
              ))}

            {/* nós-item */}
            {nodes
              .filter((n) => n.kind === "item")
              .map((node, i) => (
                <g
                  key={node.id}
                  className="graph-node"
                  transform={`translate(${node.x},${node.y})`}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onPointerDown(e, node.id);
                  }}
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
                    <circle r={node.r} fill={node.color} stroke="#f7f0de" strokeWidth={2.5} />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={14}
                      style={{ pointerEvents: "none" }}
                    >
                      {TYPE_ICON[node.type ?? "NOTE"]}
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
          </g>
        </svg>

        {/* controles de zoom — úteis no toque e no mouse */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
          <button
            className="graph-zoom-btn"
            aria-label="Aproximar"
            onClick={() => zoomAt(WIDTH / 2, HEIGHT / 2, 1.25)}
          >
            +
          </button>
          <button
            className="graph-zoom-btn"
            aria-label="Afastar"
            onClick={() => zoomAt(WIDTH / 2, HEIGHT / 2, 1 / 1.25)}
          >
            −
          </button>
          <button
            className="graph-zoom-btn text-[13px]"
            aria-label="Restaurar zoom"
            onClick={() => setView({ scale: 1, tx: 0, ty: 0 })}
          >
            ⤢
          </button>
        </div>
      </div>
    </div>
  );
}
