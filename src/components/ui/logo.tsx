import { cn } from "@/lib/cn";

/** Official mark: "YA" + "YO!" cartouche. */
export function Logo({ size = "md", className }: { size?: "sm" | "md"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-extrabold tracking-tight", size === "md" ? "text-[28px]" : "text-[22px]", className)} aria-label="YA YO!">
      <span>YA</span>
      <span className="rounded-sm bg-brand px-2 py-0.5 leading-tight text-fg-inverse">YO!</span>
    </span>
  );
}
