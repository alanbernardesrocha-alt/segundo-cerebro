import Link from "next/link";
import { getDB, listSpacesWithCounts } from "@/lib/db";
import NewSpaceButton from "./NewSpaceButton";
import SidebarSearch from "./SidebarSearch";

/** Emblema: perfil de cabeça cujas raízes viram ramos — o selo do Segundo Cérebro. */
function Emblem({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 300" className={className} fill="none">
      <g stroke="#F1E6C9" strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M60,230 C60,150 75,90 100,55 L225,55 C230,120 230,180 220,230 Z" />
        <path
          d="M100,55
             C52,40 35,-10 52,-55
             C64,-88 96,-112 140,-118
             C148,-140 164,-150 170,-132
             C178,-140 190,-136 186,-118
             C222,-108 248,-78 250,-42
             C262,-34 262,-16 248,-10
             C252,4 242,16 228,12
             C230,34 214,46 198,38
             C196,58 176,66 164,52
             C150,64 132,58 128,42
             C120,50 106,46 106,32"
          transform="translate(0,110)"
        />
        <path
          d="M196,24 C210,26 212,46 198,52 C188,56 182,44 188,32 C190,27 193,24 196,24 Z"
          transform="translate(0,110)"
        />
      </g>
      <g stroke="#F1E6C9" strokeWidth="3.6" fill="none" strokeLinecap="round" className="emblem-roots">
        <path d="M140,-8 C130,-40 110,-58 112,-88" />
        <path d="M112,-88 C100,-100 82,-102 72,-118" />
        <path d="M112,-88 C122,-104 136,-110 138,-128" />
        <path d="M170,-22 C176,-52 164,-72 174,-98" />
        <path d="M174,-98 C168,-114 150,-120 148,-138" />
        <path d="M174,-98 C186,-110 202,-110 212,-126" />
        <path d="M186,-8 C208,-28 226,-28 236,-50" />
      </g>
      <g fill="#3E6259" className="emblem-roots">
        <ellipse cx="72" cy="-122" rx="9" ry="5.5" transform="rotate(-30 72 -122)" />
        <ellipse cx="138" cy="-134" rx="9" ry="5.5" transform="rotate(15 138 -134)" />
        <ellipse cx="212" cy="-132" rx="9" ry="5.5" transform="rotate(35 212 -132)" />
      </g>
      <g fill="#B5482D" className="emblem-roots">
        <circle cx="112" cy="-88" r="5.5" />
        <circle cx="174" cy="-98" r="6" />
      </g>
    </svg>
  );
}

export default async function Sidebar() {
  const db = await getDB();
  const spaces = await listSpacesWithCounts(db);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-[#c9a35f]/40 bg-[#f1e6c9]">
      {/* Masthead — a "tábua de madeira" com o brasão */}
      <Link
        href="/"
        className="group relative flex flex-col items-center gap-2 overflow-hidden px-4 pb-5 pt-6"
        style={{
          background: "linear-gradient(180deg, #3B2A1A 0%, #2B1D12 60%, #1E140C 100%)",
        }}
      >
        <span className="pointer-events-none absolute inset-2 rounded-sm border border-[#C99A45]/40" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#C99A45] bg-[#2B1D12] shadow-inner">
          <Emblem className="h-11 w-11 emblem-breathe" />
        </span>
        <span className="relative font-display text-xl font-bold tracking-wide text-[#F1E6C9]">
          Segundo Cérebro
        </span>
        <span className="relative font-stamp text-[10px] tracking-[0.25em] text-[#C99A45]">
          DE ALAN BERNARDES
        </span>
        <span
          className="relative mt-1 h-px w-24 origin-center scale-x-0 bg-[#C99A45] transition-transform duration-700 group-hover:scale-x-100"
          aria-hidden
        />
      </Link>

      <div className="flex flex-1 flex-col overflow-hidden px-4 py-4">
        <SidebarSearch />

        <nav className="mt-4 flex flex-col gap-0.5 text-sm">
          <Link href="/" className="nav-stamp">
            Painel
          </Link>
          <Link href="/graph" className="nav-stamp">
            Conexões neurais
          </Link>
        </nav>

        <div className="mt-6 flex items-center justify-between px-1">
          <span className="font-stamp text-[11px] tracking-[0.2em] text-[#8a6f3f]">
            Temas
          </span>
          <NewSpaceButton />
        </div>

        <div className="mt-1 flex-1 space-y-0.5 overflow-y-auto pb-4 text-sm">
          {spaces.length === 0 && (
            <p className="px-3 py-2 text-xs text-[#9b8257]">
              Nenhum tema ainda. Crie o primeiro para começar a organizar suas notas.
            </p>
          )}
          {spaces.map((space) => (
            <Link key={space.id} href={`/spaces/${space.slug}`} className="ledger-row">
              <span className="flex items-center gap-2 truncate">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-[#6B4A2F]/30"
                  style={{ backgroundColor: space.color }}
                />
                <span className="truncate">{space.name}</span>
              </span>
              <span className="shrink-0 font-stamp text-[11px] text-[#8a6f3f]">
                {space.itemCount}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
