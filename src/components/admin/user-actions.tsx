"use client";

import { Ban, CircleCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import type { User } from "@/lib/types";

export function UserActions({ user }: { user: User }) {
  const [status, setStatus] = useState(user.status);
  const [open, setOpen] = useState(false);
  if (status === "suspended")
    return (
      <Button variant="outline" icon={<CircleCheck className="size-4" />} onClick={() => setStatus("active")}>
        Réactiver le compte
      </Button>
    );
  return (
    <>
      <Button variant="danger" icon={<Ban className="size-4" />} onClick={() => setOpen(true)}>
        Suspendre le compte
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={`Suspendre ${user.name} ?`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="lg" block onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              size="lg"
              block
              onClick={() => {
                setStatus("suspended");
                setOpen(false);
              }}
            >
              Suspendre
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="type-body-m text-fg-secondary">Le compte ne pourra plus se connecter. Les commandes en cours restent sous séquestre jusqu’à leur clôture.</p>
          <Field label="Motif">
            {(id) => (
              <Select id={id}>
                <option>Contact hors application</option>
                <option>Fraude ou arnaque</option>
                <option>Litiges répétés</option>
                <option>Autre</option>
              </Select>
            )}
          </Field>
          <Field label="Note interne">{(id) => <Textarea id={id} />}</Field>
        </div>
      </Sheet>
    </>
  );
}
