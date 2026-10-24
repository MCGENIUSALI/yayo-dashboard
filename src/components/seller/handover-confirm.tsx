"use client";

import { Check } from "lucide-react";
import { ActionError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { confirmHandover } from "@/lib/actions";

export function HandoverConfirm({ orderId }: { orderId: string }) {
  const toast = useToast();
  const confirm = useAsyncAction(async () => {
    await confirmHandover(orderId);
    toast({ tone: "success", title: "Collecte confirmée", description: "Les fonds restent sous séquestre jusqu’à la livraison." });
  });
  const done = confirm.status === "success";
  return (
    <div className="flex flex-col gap-3">
      <ActionError error={confirm.error} onRetry={() => confirm.run()} />
      <Button variant={done ? "secondary" : "outline"} size="lg" block disabled={done} loading={confirm.pending} icon={done ? <Check className="size-5" /> : undefined} onClick={() => confirm.run()}>
        {done ? "Collecte confirmée" : "Le livreur a récupéré le colis"}
      </Button>
    </div>
  );
}
