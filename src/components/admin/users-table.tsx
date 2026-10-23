"use client";

import { Search, Star, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { Chips } from "@/components/ui/segmented";
import { roleLabel, userStatus } from "@/lib/labels";
import type { Role, User } from "@/lib/types";

export function UsersTable({ users }: { users: User[] }) {
  const [role, setRole] = useState<"all" | Role>("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => users.filter((u) => (role === "all" || u.role === role) && u.name.toLowerCase().includes(q.trim().toLowerCase())), [users, role, q]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Chips
          value={role}
          onChange={setRole}
          items={[
            { value: "all", label: "Tous", count: users.length },
            { value: "buyer", label: "Acheteurs" },
            { value: "seller", label: "Vendeurs" },
            { value: "courier", label: "Livreurs" },
          ]}
        />
        <div className="md:w-72">
          <Input icon={<Search />} type="search" placeholder="Nom de l’utilisateur" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher un utilisateur" />
        </div>
      </div>
      <DataTable
        rows={list}
        rowKey={(u) => u.id}
        empty={<EmptyState icon={<Users />} title="Aucun utilisateur trouvé" />}
        title={(u) => (
          <span className="flex items-center gap-2">
            <Avatar name={u.name} size="sm" /> {u.name}
          </span>
        )}
        columns={[
          {
            key: "name",
            header: "Utilisateur",
            hideOnMobile: true,
            cell: (u) => (
              <span className="flex items-center gap-2.5">
                <Avatar name={u.name} size="sm" />
                <span className="type-label-m">{u.name}</span>
              </span>
            ),
          },
          { key: "role", header: "Rôle", cell: (u) => roleLabel[u.role] },
          { key: "phone", header: "Téléphone", cell: (u) => <span className="whitespace-nowrap">{u.phone}</span> },
          { key: "area", header: "Commune", cell: (u) => u.area },
          { key: "orders", header: "Commandes", cell: (u) => u.orders },
          { key: "rating", header: "Note", cell: (u) => (u.rating ? <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-warning text-warning" />{u.rating.toLocaleString("fr-FR")}</span> : "—") },
          { key: "status", header: "Statut", cell: (u) => <Badge tone={userStatus[u.status].tone}>{userStatus[u.status].label}</Badge> },
        ]}
        action={(u) => (
          <Link href={`/admin/utilisateurs/${u.id}`} className={buttonClass({ variant: "outline", size: "sm" })}>
            Voir
          </Link>
        )}
      />
    </div>
  );
}
