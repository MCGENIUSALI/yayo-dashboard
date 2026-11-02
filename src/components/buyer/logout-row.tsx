"use client";

import { ChevronRight, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutRow() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.push("/acheteur/bienvenue")} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-muted">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken">
        <LogOut className="size-5" />
      </span>
      <span className="flex-1 type-label-l">Se déconnecter</span>
      <ChevronRight className="size-5 text-fg-tertiary" />
    </button>
  );
}
