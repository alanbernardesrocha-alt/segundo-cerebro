import Link from "next/link";
import { ITEM_TYPE_LABEL, type ItemWithSpace } from "@/lib/types";

const TYPE_ICON: Record<string, string> = {
  NOTE: "📝",
  FILE: "📎",
  LINK: "🔗",
};

const TYPE_TAG_CLASS: Record<string, string> = {
  NOTE: "type-tag-note",
  FILE: "type-tag-file",
  LINK: "type-tag-link",
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
      className="card-vintage flex flex-col gap-1.5 rounded-sm px-4 py-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 font-serif text-sm font-bold text-[#2b2620]">
          <span>{TYPE_ICON[item.type]}</span>
          <span className="truncate">{item.title}</span>
        </span>
        <span className="shrink-0 font-stamp text-[10px] text-[#8a6f3f]">
          {formatDate(item.updatedAt)}
        </span>
      </div>
      {preview && <p className="truncate text-xs text-[#6b5c47]">{preview}</p>}
      {showSpace && (
        <span className="flex w-fit items-center gap-1.5 rounded-full border border-[#6B4A2F]/25 bg-[#efe4c9] px-2 py-0.5 text-[11px] text-[#6b5c47]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: item.space.color }}
          />
          {item.space.name}
        </span>
      )}
      <span className={`type-tag w-fit ${TYPE_TAG_CLASS[item.type]}`}>
        {ITEM_TYPE_LABEL[item.type]}
      </span>
    </Link>
  );
}
