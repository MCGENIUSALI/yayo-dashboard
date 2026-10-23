"use client";

import { Wallet } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { formatFC } from "@/lib/format";

export function WithdrawButton({ balance, account }: { balance: number; account: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(balance);
  const [sent, setSent] = useState(false);
  const invalid = amount <= 0 || amount > balance;
  return (
    <>
      <Button variant="accent" icon={<Wallet className="size-4" />} onClick={() => setOpen(true)}>
        Retirer vers M-Pesa
      </Button>
      <Sheet
        open={open}
        onClose={() => {
          setOpen(false);
          setSent(false);
        }}
        title="Retirer mes gains"
        footer={
          <Button size="lg" block disabled={invalid || sent} onClick={() => setSent(true)}>
            {sent ? "Demande envoyée ✓" : `Retirer ${formatFC(amount)}`}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Montant (FC)" hint={`Disponible : ${formatFC(balance)}`} error={amount > balance ? "Montant supérieur au solde disponible." : undefined}>
            {(id) => <Input id={id} inputMode="numeric" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")))} aria-invalid={invalid || undefined} />}
          </Field>
          <Alert tone="info" title={`Vers ${account}`}>
            Virement Mobile Money sous 24 h ouvrées. Les fonds encore sous séquestre ne sont pas retirables.
          </Alert>
        </div>
      </Sheet>
    </>
  );
}
