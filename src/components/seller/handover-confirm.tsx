"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function HandoverConfirm() {
  const [done, setDone] = useState(false);
  return (
    <Button variant={done ? "secondary" : "outline"} size="lg" block disabled={done} onClick={() => setDone(true)}>
      {done ? "Collecte confirmée ✓" : "Le livreur a récupéré le colis"}
    </Button>
  );
}
