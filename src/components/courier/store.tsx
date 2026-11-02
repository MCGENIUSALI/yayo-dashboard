"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { cashToReturn, missions as seed, type Mission } from "@/lib/data/courier";

interface CourierStore {
  available: boolean;
  setAvailable: (v: boolean) => void;
  missions: Mission[];
  setStatus: (id: string, status: Mission["status"]) => void;
  /** Cash collected and not yet handed back to YA YO. */
  cash: { orderId: string; name: string; at: string; amount: number }[];
  addCash: (entry: { orderId: string; name: string; at: string; amount: number }) => void;
  clearCash: () => void;
}

const Ctx = createContext<CourierStore | null>(null);

/** Client state of the courier app: availability, mission progress, cash to hand back. */
export function CourierStoreProvider({ children }: { children: ReactNode }) {
  const [available, setAvailable] = useState(true);
  const [missions, setMissions] = useState(seed);
  const [cash, setCash] = useState(cashToReturn.slice(1));
  const value = useMemo<CourierStore>(
    () => ({
      available,
      setAvailable,
      missions,
      setStatus: (id, status) => setMissions((ms) => ms.map((m) => (m.id === id ? { ...m, status } : m))),
      cash,
      addCash: (e) => setCash((c) => (c.some((x) => x.orderId === e.orderId) ? c : [e, ...c])),
      clearCash: () => setCash([]),
    }),
    [available, missions, cash],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCourier() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCourier must be used inside <CourierStoreProvider>");
  return ctx;
}
