"use client";

import { UserCheck } from "lucide-react";
import { useState } from "react";
import { MasterDetail } from "@/components/admin/master-detail";
import { ActionError, Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { ProductThumb } from "@/components/ui/media";
import { Chips } from "@/components/ui/segmented";
import { KycBadge } from "@/components/ui/status";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks/use-async-action";
import { decideKyc } from "@/lib/actions";
import type { KycFile, KycStatus } from "@/lib/types";

type Filter = "all" | "courier" | "seller" | "rejected";

const decisionToast: Partial<Record<KycStatus, string>> = { approved: "Compte validé", rejected: "Dossier refusé", unreadable: "Nouvelle pièce demandée" };

function KycDetail({ f, onDecide }: { f: KycFile; onDecide: (s: KycStatus) => void }) {
  const toast = useToast();
  const done = f.status === "approved" || f.status === "rejected";
  const decide = useAsyncAction(async (s: KycStatus) => {
    await decideKyc(f.id, s);
    onDecide(s);
    toast({ tone: "success", title: decisionToast[s] ?? "Décision enregistrée", description: f.name });
  });
  const running = (s: KycStatus) => decide.pending && decide.args?.[0] === s;
  const secondary: KycStatus = f.status === "unreadable" ? "rejected" : "unreadable";
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Avatar name={f.name} size="lg" />
        <div>
          <p className="type-h4">{f.name}</p>
          <p className="type-body-s text-fg-tertiary">
            {f.detail} · {f.area}
          </p>
        </div>
      </div>
      <div>
        <Overline className="mb-2">Documents</Overline>
        <div className="flex flex-wrap gap-2">
          {["Recto", "Verso", "Selfie", f.role === "courier" ? "Permis" : "RCCM"].map((d) => (
            <figure key={d} className="flex flex-col items-center gap-1">
              <ProductThumb swatch="slate" name={d} className="size-20" />
              <figcaption className="type-caption text-fg-tertiary">{d}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <dl className="flex flex-col gap-2 type-body-m">
        <div className="flex justify-between gap-3">
          <dt className="text-fg-secondary">Pièce d’identité</dt>
          <dd className="type-label-m">{f.idType}</dd>
        </div>
        {f.license && (
          <div className="flex justify-between gap-3">
            <dt className="text-fg-secondary">Permis</dt>
            <dd className="type-label-m">{f.license}</dd>
          </div>
        )}
        {f.rccm && (
          <div className="flex justify-between gap-3">
            <dt className="text-fg-secondary">RCCM</dt>
            <dd className="type-label-m">{f.rccm}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-fg-secondary">Mobile Money</dt>
          <dd className="type-label-m">{f.mobileMoney}</dd>
        </div>
      </dl>
      {done ? (
        <Alert className="animate-fade-in" tone={f.status === "approved" ? "success" : "danger"} title={f.status === "approved" ? "Compte validé" : "Dossier refusé"}>
          {f.status === "approved" ? "La personne peut désormais travailler sur YA YO." : "Un message expliquant le refus a été envoyé."}
        </Alert>
      ) : (
        <div className="flex flex-col gap-3">
          <ActionError error={decide.error} onRetry={() => decide.args && decide.run(...decide.args)} />
          <div className="flex gap-2">
            <Button variant="outline" size="lg" block loading={running(secondary)} disabled={decide.pending && !running(secondary)} onClick={() => decide.run(secondary)}>
              {f.status === "unreadable" ? "Refuser" : "Pièce illisible"}
            </Button>
            <Button size="lg" block loading={running("approved")} disabled={decide.pending && !running("approved")} onClick={() => decide.run("approved")}>
              Valider le {f.role === "courier" ? "livreur" : "vendeur"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function KycAdmin({ files }: { files: KycFile[] }) {
  const [rows, setRows] = useState(files);
  const [filter, setFilter] = useState<Filter>("all");
  const open = rows.filter((f) => f.status !== "rejected");
  const list = rows.filter((f) => (filter === "all" ? f.status !== "rejected" : filter === "rejected" ? f.status === "rejected" : f.role === filter && f.status !== "rejected"));

  return (
    <div className="flex flex-col gap-4">
      <Chips
        value={filter}
        onChange={setFilter}
        items={[
          { value: "all", label: "Tous", count: open.length },
          { value: "courier", label: "Livreurs", count: open.filter((f) => f.role === "courier").length },
          { value: "seller", label: "Vendeurs", count: open.filter((f) => f.role === "seller").length },
          { value: "rejected", label: "Refusés" },
        ]}
      />
      <MasterDetail
        empty={<EmptyState icon={<UserCheck />} title="Aucun dossier">Rien à valider dans cette catégorie.</EmptyState>}
        rows={list}
        rowKey={(f) => f.id}
        title={(f) => `#${f.id} · ${f.name}`}
        detailTitle={(f) => f.name}
        actionLabel={(f) => (f.status === "unreadable" ? "Relancer" : f.status === "to_review" ? "Ouvrir" : "Voir")}
        columns={[
          { key: "id", header: "Dossier", cell: (f) => <span className="type-label-m whitespace-nowrap">#{f.id}</span>, hideOnMobile: true },
          { key: "name", header: "Nom", cell: (f) => f.name, hideOnMobile: true },
          { key: "role", header: "Rôle", cell: (f) => f.detail },
          { key: "area", header: "Zone", cell: (f) => f.area },
          { key: "status", header: "Statut", cell: (f) => <KycBadge status={f.status} /> },
          { key: "sent", header: "Envoyé", cell: (f) => f.sentAgo },
        ]}
        renderDetail={(f) => <KycDetail f={f} onDecide={(s) => setRows((rs) => rs.map((r) => (r.id === f.id ? { ...r, status: s } : r)))} />}
      />
    </div>
  );
}
