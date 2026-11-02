"use client";

import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/** E1 · Accueil hors ligne. Also previewable with ?hors-ligne in the URL. */
export function OfflineBanner() {
  const offline = useSyncExternalStore(
    subscribe,
    () => !navigator.onLine || new URLSearchParams(window.location.search).has("hors-ligne"),
    () => false,
  );
  if (!offline) return null;
  return (
    <div role="status" className="mx-4 flex animate-fade-in gap-3 rounded-lg bg-warning-subtle p-4">
      <WifiOff className="mt-0.5 size-5 shrink-0 text-fg-warning" />
      <div>
        <p className="type-label-m text-fg-warning">Tu es hors ligne</p>
        <p className="type-body-s text-fg-secondary">Les prix et le stock affichés datent de ta dernière connexion. Le paiement reprendra au retour de la connexion.</p>
      </div>
    </div>
  );
}
