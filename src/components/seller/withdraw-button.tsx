"use client";

import { Check, Wallet } from "lucide-react";
import { useState } from "react";
import { ActionError, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { requestWithdrawal } from "@/lib/actions";
import { formatFC } from "@/lib/format";

export function WithdrawButton({ balance, account }: { balance: number; account: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(balance);
  const withdraw = useAsyncAction(async () => {
    await requestWithdrawal(amount);
    toast({ tone: "success", title: "Demande de retrait envoyée", description: `${formatFC(amount)} vers ${account}, sous 24 h ouvrées.` });
  });
  const sent = withdraw.status === "success";
  const error = amount > balance ? "Montant supérieur au solde disponible." : amount <= 0 ? "Indique un montant à retirer." : undefined;

  return (
    <>
      <Button variant="accent" icon={<Wallet className="size-4" />} onClick={() => setOpen(true)}>
        Retirer vers M-Pesa
      </Button>
      <Sheet
        open={open}
        busy={withdraw.pending}
        onClose={() => {
          setOpen(false);
          withdraw.reset();
        }}
        title="Retirer mes gains"
        footer={
          <div className="flex flex-col gap-3">
            <ActionError error={withdraw.error} />
            <Button size="lg" block disabled={Boolean(error) || sent} loading={withdraw.pending} variant={sent ? "secondary" : "primary"} icon={sent ? <Check className="size-5" /> : undefined} onClick={() => withdraw.run()}>
              {sent ? "Demande envoyée" : withdraw.error ? "Réessayer" : `Retirer ${formatFC(amount)}`}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Montant (FC)" hint={`Disponible : ${formatFC(balance)}`} error={error}>
            {(id) => <Input id={id} inputMode="numeric" value={amount || ""} disabled={withdraw.pending || sent} onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")))} />}
          </Field>
          <Alert tone="info" title={`Vers ${account}`}>
            Virement Mobile Money sous 24 h ouvrées. Les fonds encore sous séquestre ne sont pas retirables.
          </Alert>
        </div>
      </Sheet>
    </>
  );
}
