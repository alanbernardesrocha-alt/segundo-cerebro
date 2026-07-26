import Link from "next/link";
import { ITEM_TYPE_LABEL, type ItemWithSpace } from "@/lib/types";

const TYPE_ICON: Record<string, string> = {
  NOTE: "📝",
  FILE: "📎",
  LINK: "🔗",
};

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function ItemCard({
  item,
  showSpace = false,
}: {
  item: ItemWithSpace;
  showSpace?: boolean;
}) {
  const preview =
    item.type === "LINK"
      ? item.url
      : item.type === "FILE"
      ? item.fileName
      : (item.content ?? "").slice(0, 140);

  return (
    <Link
      href={`/items/${item.id}`}
      className="flex flex-col gap-1.5 rounded-xl border border-[#e7ddc9] bg-white px-4 py-3 transition hover:border-[#c3b7a2] hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-[#2b2620]">
          <span>{TYPE_ICON[item.type]}</span>
          <span className="truncate">{item.title}</span>
        </span>
        <span className="shrink-0 text-xs text-[#a89d86]">{formatDate(item.updatedAt)}</span>
      </div>
      {preview && (
        <p className="truncate text-xs text-[#8a8270]">{preview}</p>
      )}
      {showSpace && (
        <span className="flex w-fit items-center gap-1.5 rounded-full bg-[#f1ead9] px-2 py-0.5 text-[11px] text-[#6b6558]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: item.space.color }}
          />
          {item.space.name}
        </span>
      )}
      <span className="text-[11px] uppercase tracking-wide text-[#c3b7a2]">
        {ITEM_TYPE_LABEL[item.type]}
      </span>
    </Link>
  );
}
