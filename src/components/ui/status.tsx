import {
  CircleCheck,
  CircleDollarSign,
  CircleX,
  Clock,
  LoaderCircle,
  Package,
  PackageCheck,
  PackageX,
  RotateCcw,
  Scale,
  ShieldCheck,
  Bike,
  Store,
  Truck,
  UserRoundCheck,
  Sparkles,
  Hourglass,
  Ban,
} from "lucide-react";
import { Badge, type Tone } from "@/components/ui/badge";
import type { DeliveryStatus, KycStatus, PaymentStatus, SellerOrderStatus } from "@/lib/types";

const payment: Record<PaymentStatus, { label: string; tone: Tone; icon: React.ReactNode }> = {
  initiated: { label: "Paiement initié", tone: "neutral", icon: <Clock /> },
  pending: { label: "En attente de paiement", tone: "warning", icon: <LoaderCircle /> },
  held: { label: "Fonds sécurisés", tone: "inverse", icon: <ShieldCheck /> },
  in_delivery: { label: "En livraison", tone: "info", icon: <Truck /> },
  delivered: { label: "Livré", tone: "success", icon: <PackageCheck /> },
  released: { label: "Paiement libéré au vendeur", tone: "success", icon: <CircleDollarSign /> },
  failed: { label: "Paiement échoué", tone: "danger", icon: <CircleX /> },
  refunded: { label: "Remboursé", tone: "accent", icon: <RotateCcw /> },
  disputed: { label: "Litige · fonds bloqués", tone: "danger", icon: <Scale /> },
};

/** Escrow payment status (9 states), synchronised with delivery (§9). */
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const s = payment[status];
  return (
    <Badge tone={s.tone} icon={s.icon}>
      {s.label}
    </Badge>
  );
}

const delivery: Record<DeliveryStatus, { label: string; tone: Tone; icon: React.ReactNode }> = {
  assigned: { label: "Livreur assigné", tone: "neutral", icon: <UserRoundCheck /> },
  picking_up: { label: "En collecte", tone: "warning", icon: <Store /> },
  delivering: { label: "En livraison", tone: "info", icon: <Bike /> },
  delivered: { label: "Livrée", tone: "success", icon: <PackageCheck /> },
  failed: { label: "Échec de livraison", tone: "danger", icon: <PackageX /> },
};

export function DeliveryBadge({ status }: { status: DeliveryStatus }) {
  const s = delivery[status];
  return (
    <Badge tone={s.tone} icon={s.icon}>
      {s.label}
    </Badge>
  );
}

const sellerOrder: Record<SellerOrderStatus, { label: string; tone: Tone; icon: React.ReactNode }> = {
  new: { label: "Nouvelle", tone: "accent", icon: <Sparkles /> },
  preparing: { label: "En préparation", tone: "warning", icon: <Package /> },
  ready: { label: "Prête · livreur assigné", tone: "info", icon: <UserRoundCheck /> },
  handed_over: { label: "Remise au livreur", tone: "info", icon: <Truck /> },
  delivered: { label: "Livrée", tone: "success", icon: <PackageCheck /> },
};

export function SellerOrderBadge({ status }: { status: SellerOrderStatus }) {
  const s = sellerOrder[status];
  return (
    <Badge tone={s.tone} icon={s.icon}>
      {s.label}
    </Badge>
  );
}

const kyc: Record<KycStatus, { label: string; tone: Tone; icon: React.ReactNode }> = {
  to_review: { label: "À vérifier", tone: "warning", icon: <Hourglass /> },
  unreadable: { label: "Pièce illisible", tone: "danger", icon: <CircleX /> },
  approved: { label: "Validé", tone: "success", icon: <CircleCheck /> },
  rejected: { label: "Refusé", tone: "neutral", icon: <Ban /> },
};

export function KycBadge({ status }: { status: KycStatus }) {
  const s = kyc[status];
  return (
    <Badge tone={s.tone} icon={s.icon}>
      {s.label}
    </Badge>
  );
}
