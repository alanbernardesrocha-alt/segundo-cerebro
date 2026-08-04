import Link from "next/link";
import Image from "next/image";
import { getDB, listSpacesWithCounts } from "@/lib/db";
import NewSpaceButton from "./NewSpaceButton";
import SidebarSearch from "./SidebarSearch";

/** Divisor recortado tipo nuvem/escama — a transição da madeira para o pergaminho. */
function ScallopDivider() {
  return (
    <svg
      viewBox="0 0 256 40"
      preserveAspectRatio="none"
      className="block h-6 w-full"
      aria-hidden
    >
      <path
        d="M0,24 Q16,2 32,24 Q48,2 64,24 Q80,2 96,24 Q112,2 128,24 Q144,2 160,24 Q176,2 192,24 Q208,2 224,24 Q240,2 256,24 L256,40 L0,40 Z"
        fill="#F1E6C9"
      />
      <path
        d="M0,24 Q16,2 32,24 Q48,2 64,24 Q80,2 96,24 Q112,2 128,24 Q144,2 160,24 Q176,2 192,24 Q208,2 224,24 Q240,2 256,24"
        fill="none"
        stroke="#C99A45"
        strokeWidth="1.2"
        opacity="0.8"
      />
    </svg>
  );
}

export default async function Sidebar() {
  const db = await getDB();
  const spaces = await listSpacesWithCounts(db);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-[#c9a35f]/40 bg-[#f1e6c9]">
      {/* Masthead — tábua de madeira de verdade com o brasão */}
      <div className="relative">
        <Link
          href="/"
          className="group relative flex flex-col items-center gap-2 overflow-hidden px-4 pb-8 pt-6"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(30,20,12,0.35), rgba(30,20,12,0.75)), url('/textures/wood.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <span className="pointer-events-none absolute inset-2 rounded-sm border border-[#C99A45]/50" />
          <span className="pointer-events-none absolute inset-[6px] rounded-sm border border-[#C99A45]/20" />
          <span className="relative flex h-[4.75rem] w-[4.75rem] items-center justify-center overflow-hidden rounded-full border-2 border-[#C99A45] bg-[#2B1D12] shadow-[0_0_0_3px_rgba(0,0,0,0.35),inset_0_0_14px_rgba(0,0,0,0.6)]">
            <Image
              src="/cerebro-logo.png"
              alt="Segundo cérebro de Alan — cérebro com cartola"
              width={140}
              height={152}
              priority
              className="emblem-breathe h-[88%] w-[88%] object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
            />
          </span>
          <span className="logo-carved relative text-center font-display text-xl font-bold leading-tight tracking-wide text-[#F6ECD4]">
            Segundo cérebro
            <br />
            de Alan
          </span>
          <span className="relative font-stamp text-[9px] tracking-[0.3em] text-[#C99A45]">
            GABINETE CEREBRAL
          </span>
          <span
            className="relative mt-1 h-px w-24 origin-center scale-x-0 bg-[#C99A45] transition-transform duration-700 group-hover:scale-x-100"
            aria-hidden
          />
        </Link>
        <ScallopDivider />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden px-4 pb-4 pt-1">
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
            ✦ Temas
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
