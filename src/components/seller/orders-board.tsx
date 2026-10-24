"use client";

import { Package } from "lucide-react";
import { useState } from "react";
import { SellerOrderCard } from "@/components/seller/order-card";
import { EmptyState } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/segmented";
import type { Order, SellerOrderStatus } from "@/lib/types";

type Tab = "new" | "preparing" | "ready" | "done";
const groups: Record<Tab, SellerOrderStatus[]> = { new: ["new"], preparing: ["preparing"], ready: ["ready", "handed_over"], done: ["delivered"] };

export function OrdersBoard({ orders }: { orders: Order[] }) {
  const [tab, setTab] = useState<Tab>("new");
  const count = (t: Tab) => orders.filter((o) => groups[t].includes(o.sellerStatus)).length;
  const list = orders.filter((o) => groups[tab].includes(o.sellerStatus));

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        value={tab}
        onChange={setTab}
        items={[
          { value: "new", label: "Nouvelles", count: count("new") },
          { value: "preparing", label: "À préparer", count: count("preparing") },
          { value: "ready", label: "Prêtes", count: count("ready") },
          { value: "done", label: "Livrées" },
        ]}
      />
      {list.length ? (
        <div key={tab} className="grid animate-fade-in gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((o) => (
            <SellerOrderCard key={o.id} order={o} />
          ))}
        </div>
      ) : (
        <EmptyState key={tab} icon={<Package />} title="Aucune commande ici">
          Les nouvelles commandes payées apparaissent ici dès que les fonds sont sécurisés.
        </EmptyState>
      )}
    </div>
  );
}
