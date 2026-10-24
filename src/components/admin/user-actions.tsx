"use client";

import { Ban, CircleCheck } from "lucide-react";
import { useState } from "react";
import { ActionError } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { setUserStatus } from "@/lib/actions";
import type { User } from "@/lib/types";

export function UserActions({ user }: { user: User }) {
  const toast = useToast();
  const [status, setStatus] = useState(user.status);
  const [open, setOpen] = useState(false);
  const change = useAsyncAction(async (next: User["status"]) => {
    await setUserStatus(user.id, next);
    setStatus(next);
    setOpen(false);
    toast({ tone: "success", title: next === "suspended" ? "Compte suspendu" : "Compte réactivé", description: user.name });
  });
  const close = () => {
    setOpen(false);
    change.reset();
  };

  if (status === "suspended")
    return (
      <div className="flex flex-col items-start gap-2">
        <ActionError error={change.error} onRetry={() => change.run("active")} />
        <Button variant="outline" icon={<CircleCheck className="size-4" />} loading={change.pending} onClick={() => change.run("active")}>
          Réactiver le compte
        </Button>
      </div>
    );
  return (
    <>
      <Button variant="danger" icon={<Ban className="size-4" />} onClick={() => setOpen(true)}>
        Suspendre le compte
      </Button>
      <Sheet
        open={open}
        busy={change.pending}
        onClose={close}
        title={`Suspendre ${user.name} ?`}
        footer={
          <div className="flex flex-col gap-3">
            <ActionError error={change.error} />
            <div className="flex gap-2">
              <Button variant="outline" size="lg" block disabled={change.pending} onClick={close}>
                Annuler
              </Button>
              <Button variant="danger" size="lg" block loading={change.pending} onClick={() => change.run("suspended")}>
                {change.error ? "Réessayer" : "Suspendre"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="type-body-m text-fg-secondary">Le compte ne pourra plus se connecter. Les commandes en cours restent sous séquestre jusqu’à leur clôture.</p>
          <Field label="Motif">
            {(id) => (
              <Select id={id} disabled={change.pending}>
                <option>Contact hors application</option>
                <option>Fraude ou arnaque</option>
                <option>Litiges répétés</option>
                <option>Autre</option>
              </Select>
            )}
          </Field>
          <Field label="Note interne">{(id) => <Textarea id={id} disabled={change.pending} />}</Field>
        </div>
      </Sheet>
    </>
  );
}
