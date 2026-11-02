import { Headphones, House, Shirt, Smartphone, Sparkles, Tag } from "lucide-react";
import type { CategoryId } from "@/lib/types";

const icons = { electronique: Smartphone, mode: Shirt, beaute: Sparkles, maison: House, audio: Headphones, promos: Tag } as const;

export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const Icon = icons[id];
  return <Icon className={className} />;
}
