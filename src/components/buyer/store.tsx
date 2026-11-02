"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { addresses, catalog, initialCart, slots } from "@/lib/data/buyer";
import { cartIssues, cartTotals } from "@/lib/cart";
import type { CartLine } from "@/lib/types";

export type PayMethod = "momo" | "cash" | "card";

interface Checkout {
  addressId: string;
  slot: string;
  note: string;
  method: PayMethod;
  phone: string;
}

interface PlacedOrder {
  id: string;
  items: number;
  shops: number;
  total: number;
  method: PayMethod;
  slot: string;
}

interface BuyerStore {
  lines: CartLine[];
  count: number;
  totals: ReturnType<typeof cartTotals>;
  add: (productId: string, color: string, qty: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  /** Applies E7: drops out-of-stock items and updates prices to the catalogue. */
  acceptAdjustments: () => void;
  issues: ReturnType<typeof cartIssues>;
  checkout: Checkout;
  setCheckout: (patch: Partial<Checkout>) => void;
  placed: PlacedOrder | null;
  /** Records the order; the cart is emptied by the confirmation screen (so checkout screens never see an empty cart mid-redirect). */
  confirmOrder: (id: string) => void;
  clearCart: () => void;
  favorites: Set<string>;
  toggleFavorite: (productId: string) => void;
  following: Set<string>;
  setFollowing: (shopId: string, follow: boolean) => void;
}

const Ctx = createContext<BuyerStore | null>(null);

/**
 * Client state of the buyer app (cart, checkout choices, favourites, follows).
 * Lives in the /acheteur layout, so it survives navigation between screens.
 * Swapping for the real API: keep the same shape and sync it with the cart endpoint.
 */
export function BuyerStoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(initialCart);
  const [checkout, setCheckoutState] = useState<Checkout>({ addressId: addresses[0].id, slot: slots[0], note: "", method: "momo", phone: "81 234 5678" });
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(["jbl-pulse-5"]));
  const [following, setFollowingState] = useState<Set<string>>(() => new Set(["mama-luka", "bilokos2kin", "kin-beaute"]));

  const add = useCallback((productId: string, color: string, qty: number) => {
    const product = catalog.find((p) => p.id === productId);
    if (!product) return;
    setLines((ls) => {
      const existing = ls.find((l) => l.productId === productId);
      if (existing) return ls.map((l) => (l.productId === productId ? { ...l, color, qty: Math.min(product.stock, l.qty + qty) } : l));
      return [...ls, { productId, color, qty, unitPrice: product.price }];
    });
  }, []);
  const setQty = useCallback((productId: string, qty: number) => setLines((ls) => ls.map((l) => (l.productId === productId ? { ...l, qty } : l))), []);
  const remove = useCallback((productId: string) => setLines((ls) => ls.filter((l) => l.productId !== productId)), []);
  const acceptAdjustments = useCallback(
    () =>
      setLines((ls) =>
        ls.flatMap((l) => {
          const p = catalog.find((x) => x.id === l.productId);
          if (!p || p.stock === 0) return [];
          return [{ ...l, unitPrice: p.price, qty: Math.min(l.qty, p.stock) }];
        }),
      ),
    [],
  );
  const setCheckout = useCallback((patch: Partial<Checkout>) => setCheckoutState((c) => ({ ...c, ...patch })), []);
  const toggleFavorite = useCallback(
    (id: string) =>
      setFavorites((f) => {
        const n = new Set(f);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return n;
      }),
    [],
  );
  const setFollowing = useCallback(
    (id: string, follow: boolean) =>
      setFollowingState((f) => {
        const n = new Set(f);
        if (follow) n.add(id);
        else n.delete(id);
        return n;
      }),
    [],
  );

  const value = useMemo<BuyerStore>(() => {
    const totals = cartTotals(lines, catalog);
    return {
      lines,
      count: totals.items,
      totals,
      add,
      setQty,
      remove,
      acceptAdjustments,
      issues: cartIssues(lines, catalog),
      checkout,
      setCheckout,
      placed,
      confirmOrder: (id: string) => {
        setPlaced({ id, items: totals.items, shops: totals.shops, total: totals.total, method: checkout.method, slot: checkout.slot });
      },
      clearCart: () => setLines([]),
      favorites,
      toggleFavorite,
      following,
      setFollowing,
    };
  }, [lines, add, setQty, remove, acceptAdjustments, checkout, setCheckout, placed, favorites, toggleFavorite, following, setFollowing]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBuyer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBuyer must be used inside <BuyerStoreProvider>");
  return ctx;
}

export const methodLabel: Record<PayMethod, string> = { momo: "M-Pesa", cash: "Cash à la livraison", card: "Carte bancaire" };
