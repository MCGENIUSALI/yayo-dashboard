"use client";

import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function ShareButton({ title }: { title: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      aria-label="Partager"
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) navigator.share({ title, url }).catch(() => {});
        else {
          await navigator.clipboard?.writeText(url).catch(() => {});
          toast({ tone: "success", title: "Lien copié" });
        }
      }}
      className="pressable flex size-11 items-center justify-center rounded-md"
    >
      <Share2 className="size-5" />
    </button>
  );
}
