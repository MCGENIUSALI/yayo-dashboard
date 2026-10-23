import type { Order } from "@/lib/types";

/** Net vendeur = commande − commission YA YO − frais de livraison (§7.5.9). */
export function orderBreakdown(order: Pick<Order, "lines" | "commissionRate" | "deliveryFee">) {
  const subtotal = order.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const commission = Math.round(subtotal * order.commissionRate);
  const net = subtotal - commission - order.deliveryFee;
  return { subtotal, commission, deliveryFee: order.deliveryFee, net };
}

export function orderTotal(order: Pick<Order, "lines">) {
  return order.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
}
