import { Eye, Headphones, Play, Speaker } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";

/** Swatches used as product / post visuals until real media is wired to the API. */
const swatches: Record<string, string> = {
  teal: "from-[#3ccfc0] to-[#1aa597]",
  slate: "from-[#9aa3ad] to-[#5d6670]",
  dark: "from-[#4a4a50] to-[#141417]",
  sun: "from-[#f2e7a1] to-[#d9c95b]",
  orange: "from-[#ffb36b] to-[#fb7800]",
  red: "from-[#f28c87] to-[#c42a23]",
};

export function ProductThumb({ swatch, name, className }: { swatch: string; name: string; className?: string }) {
  const Icon = /casque|tune|earbuds/i.test(name) ? Headphones : Speaker;
  return (
    <span role="img" aria-label={name} className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br text-white/90", swatches[swatch] ?? swatches.slate, className)}>
      <Icon className="size-1/2 drop-shadow" strokeWidth={1.5} />
    </span>
  );
}

export function PostTile({ swatch, caption, kind, views, className }: { swatch: string; caption: string; kind: "video" | "photo"; views?: number; className?: string }) {
  return (
    <span className={cn("relative block aspect-[3/4] overflow-hidden rounded-md", className)}>
      <ProductThumb swatch={swatch} name={caption} className="size-full rounded-none" />
      {kind === "video" && <Play className="absolute top-2 left-2 size-4 fill-white text-white" />}
      {views !== undefined && (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 type-label-s text-white drop-shadow">
          <Eye className="size-3.5" />
          {formatCompact(views)}
        </span>
      )}
    </span>
  );
}
