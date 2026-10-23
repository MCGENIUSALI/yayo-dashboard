import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const sizes = { sm: "size-8 type-label-s", md: "size-10 type-label-m", lg: "size-14 type-h4", xl: "size-16 type-h3" } as const;

export function Avatar({ name, size = "md", verified, className }: { name: string; size?: keyof typeof sizes; verified?: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center rounded-full bg-accent-subtle text-fg-accent", sizes[size], className)}>
      {initials(name)}
      {verified && <BadgeCheck aria-label="Vérifié" className="absolute -right-0.5 -bottom-0.5 size-4 rounded-full bg-surface fill-info text-surface" />}
    </span>
  );
}
