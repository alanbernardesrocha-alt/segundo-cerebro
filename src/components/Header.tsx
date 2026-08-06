import Image from "next/image";
import { getDB, listSpacesWithCounts } from "@/lib/db";
import NewItemButton from "./NewItemButton";
import NavLinks from "./NavLinks";
import BackButton from "./BackButton";
import SidebarToggle from "./SidebarToggle";

const SCALLOP =
  "M0,10 Q17.5,2 35,10 Q52.5,2 70,10 Q87.5,2 105,10 Q122.5,2 140,10 Q157.5,2 175,10 Q192.5,2 210,10 Q227.5,2 245,10 Q262.5,2 280,10 Q297.5,2 315,10 Q332.5,2 350,10 Q367.5,2 385,10 Q402.5,2 420,10 Q437.5,2 455,10 Q472.5,2 490,10 Q507.5,2 525,10 Q542.5,2 560,10 Q577.5,2 595,10 Q612.5,2 630,10 Q647.5,2 665,10 Q682.5,2 700,10 Q717.5,2 735,10 Q752.5,2 770,10 Q787.5,2 805,10 Q822.5,2 840,10 Q857.5,2 875,10 Q892.5,2 910,10 Q927.5,2 945,10 Q962.5,2 980,10 Q997.5,2 1015,10 Q1032.5,2 1050,10 Q1067.5,2 1085,10 Q1102.5,2 1120,10 L1120,16 L0,16 Z";

export default async function Header() {
  const db = await getDB();
  const spaces = await listSpacesWithCounts(db);
  const totalItems = spaces.reduce((s, x) => s + x.itemCount, 0);
  const connRow = await db
    .prepare(`SELECT COUNT(*) as count FROM "Connection"`)
    .first<{ count: number }>();
  const totalConnections = connRow?.count ?? 0;

  return (
    <header className="app-header">
      <span
        className="absolute inset-x-0 top-0 z-10 h-1"
        style={{ background: "linear-gradient(90deg,#b5482d,#c99a45 50%,#b5482d)" }}
        aria-hidden
      />

      {/* Tier 1 — emblema, título, ação */}
      <div className="relative flex items-center gap-4 px-4 pb-3 pt-5 md:gap-6 md:px-8 md:pt-6">
        <SidebarToggle />
        <span
          className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#c99a45] shadow-[0_0_0_3px_rgba(0,0,0,0.35),inset_0_3px_12px_rgba(0,0,0,0.6)] sm:h-[62px] sm:w-[62px] md:h-[88px] md:w-[88px]"
          style={{ background: "radial-gradient(circle at 50% 38%,#3a2817,#1c130b)" }}
        >
          <Image
            src="/cerebro-logo.png"
            alt="Segundo cérebro de Alan — cérebro com cartola"
            width={140}
            height={152}
            priority
            className="emblem-breathe h-[82%] w-[82%] object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-stamp text-[9px] uppercase tracking-[0.3em] text-[#d8b46a] md:text-[10px]">
            <span className="text-[#c99a45]">✦</span>Gabinete Cerebral
            <span className="hidden text-[#c99a45] sm:inline">✦</span>
          </p>
          <h1 className="header-title mt-1 text-2xl leading-[0.98] md:text-[42px]">
            Segundo cérebro de Alan
          </h1>
        </div>
        <div className="shrink-0 self-start">
          <NewItemButton spaces={spaces} />
        </div>
      </div>

      {/* Tier 2 — navegação + contagem */}
      <div
        className="relative flex items-center gap-2 px-4 py-2 md:px-8"
        style={{ background: "rgba(15,10,6,0.32)", borderTop: "1px solid rgba(201,154,69,0.3)" }}
      >
        <BackButton />
        <NavLinks />
        <div className="hidden flex-1 md:block" />
        <div className="hidden items-center gap-3 font-stamp text-[11px] tracking-wide text-[#c9b58c] md:flex">
          <span>
            <b className="text-[#e6a86f]">{totalItems}</b> {totalItems === 1 ? "item" : "itens"}
          </span>
          <span className="opacity-40">·</span>
          <span>
            <b className="text-[#8fb8a8]">{spaces.length}</b> {spaces.length === 1 ? "tema" : "temas"}
          </span>
          <span className="opacity-40">·</span>
          <span>
            <b className="text-[#9fbad6]">{totalConnections}</b>{" "}
            {totalConnections === 1 ? "conexão" : "conexões"}
          </span>
        </div>
      </div>

      {/* borda recortada descendo pro pergaminho */}
      <svg
        viewBox="0 0 1120 16"
        preserveAspectRatio="none"
        className="relative block h-2.5 w-full"
        aria-hidden
      >
        <path d={SCALLOP} fill="#efe4c6" />
      </svg>
    </header>
  );
}
