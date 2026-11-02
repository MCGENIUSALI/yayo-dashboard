"use client";

import { Phone } from "lucide-react";
import { useToast } from "@/components/ui/toast";

/** The courier's number is never shown: the call is bridged by YA YO. */
export function CallCourier({ name }: { name: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      aria-label={`Appeler ${name} via YA YO`}
      onClick={() => toast({ tone: "info", title: `Appel de ${name} en cours…`, description: "YA YO te met en relation, ton numéro reste masqué." })}
      className="pressable flex size-12 items-center justify-center rounded-md bg-surface-sunken"
    >
      <Phone className="size-5" />
    </button>
  );
}
