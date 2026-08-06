import Link from "next/link";
import { getDB, listSpacesWithCounts } from "@/lib/db";
import NewSpaceButton from "./NewSpaceButton";
import SidebarSearch from "./SidebarSearch";
import SidebarDrawer from "./SidebarDrawer";

export default async function Sidebar() {
  const db = await getDB();
  const spaces = await listSpacesWithCounts(db);

  return (
    <SidebarDrawer>
      <div className="flex flex-1 flex-col overflow-hidden px-4 pb-4 pt-5">
        <SidebarSearch />

        <div className="mt-5 flex items-center justify-between px-1">
          <span className="font-stamp text-[11px] tracking-[0.2em] text-[#8a6f3f]">✦ Temas</span>
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
    </SidebarDrawer>
  );
}
