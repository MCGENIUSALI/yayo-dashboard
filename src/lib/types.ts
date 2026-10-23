/** Escrow payment lifecycle (cahier des charges §7.5). */
export type PaymentStatus =
  | "initiated"
  | "pending"
  | "held"
  | "in_delivery"
  | "delivered"
  | "released"
  | "failed"
  | "refunded"
  | "disputed";

/** Delivery lifecycle (§8). */
export type DeliveryStatus = "assigned" | "picking_up" | "delivering" | "delivered" | "failed";

/** Seller-side preparation status (§7.6). */
export type SellerOrderStatus = "new" | "preparing" | "ready" | "handed_over" | "delivered";

export type PaymentMethod = "M-Pesa" | "Orange Money" | "Airtel Money" | "Carte" | "Cash";

export type Trend = "up" | "down" | "neutral";

export interface OrderLine {
  product: string;
  variant?: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  buyer: string;
  buyerArea: string;
  seller: string;
  createdAt: string;
  lines: OrderLine[];
  deliveryFee: number;
  commissionRate: number;
  payment: PaymentStatus;
  delivery?: DeliveryStatus;
  sellerStatus: SellerOrderStatus;
  method: PaymentMethod;
  courier?: string;
  handoverCode?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  stock: number;
  rating: number;
  online: boolean;
  colors: string[];
  image: string;
  description: string;
}

export type PostKind = "video" | "photo";
export type PostState = "published" | "draft" | "scheduled";

export interface Post {
  id: string;
  caption: string;
  kind: PostKind;
  state: PostState;
  publishedAt: string;
  duration?: string;
  cover: string;
  productIds: string[];
  stats: { views: number; likes: number; clicks: number; sales: number; revenue: number; shares: number; saves: number };
  allowComments: boolean;
  allowShare: boolean;
  allowOrder: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  at: string;
  body: string;
  likes: number;
  masked?: boolean;
  hidden?: boolean;
  reported?: boolean;
  sellerReply?: string;
}

export type KycStatus = "to_review" | "unreadable" | "approved" | "rejected";
export type Role = "buyer" | "seller" | "courier" | "admin";

export interface KycFile {
  id: string;
  name: string;
  role: "seller" | "courier";
  detail: string;
  area: string;
  status: KycStatus;
  sentAgo: string;
  idType: string;
  license?: string;
  mobileMoney: string;
  rccm?: string;
}

export type DisputeReason = "non_conforme" | "non_recu" | "article_manquant" | "endommage";

export interface Dispute {
  id: string;
  orderId: string;
  buyer: string;
  seller: string;
  amount: number;
  reason: DisputeReason;
  openedAgo: string;
  quote: string;
  courier: string;
  deadline: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  phone: string;
  area: string;
  joinedAt: string;
  orders: number;
  status: "active" | "suspended" | "pending";
  rating?: number;
}

export interface Courier {
  id: string;
  name: string;
  vehicle: string;
  area: string;
  status: "available" | "on_mission" | "offline";
  missionsToday: number;
  cashToReturn: number;
  rating: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  buyer: string;
  seller: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  at: string;
}

export interface Notification {
  id: string;
  kind: "order" | "courier" | "stock" | "payout" | "dispute" | "comment";
  title: string;
  body: string;
  ago: string;
  unread: boolean;
  href?: string;
}
