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

/* ---------- Buyer app (US-01 à US-09, US-20 à US-23) ---------- */

export interface Shop {
  id: string;
  name: string;
  category: string;
  area: string;
  rating: number;
  reviews: number;
  followers: number;
  verified: boolean;
  delivery: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  /** Short name used in lists and order summaries. */
  short: string;
  shopId: string;
  category: CategoryId;
  tags: string[];
  price: number;
  compareAt?: number;
  stock: number;
  rating: number;
  reviews: number;
  colors: { name: string; hex: string }[];
  swatch: string;
  description: string;
  fast?: boolean;
  cod?: boolean;
}

export type CategoryId = "electronique" | "mode" | "beaute" | "maison" | "audio" | "promos";

export interface Category {
  id: CategoryId;
  label: string;
  count: string;
}

export interface CartLine {
  productId: string;
  color: string;
  qty: number;
  /** Price when the item was added: compared with the catalogue at checkout (E7). */
  unitPrice: number;
}

export interface Address {
  id: string;
  label: string;
  line: string;
  phone: string;
  kind: "home" | "work";
}

export type BuyerOrderTab = "ongoing" | "delivered" | "dispute";

export interface BuyerOrder {
  id: string;
  placedAt: string;
  shopId: string;
  lines: CartLine[];
  deliveryFee: number;
  payment: PaymentStatus;
  delivery?: DeliveryStatus;
  method: PaymentMethod;
  tab: BuyerOrderTab;
  courier?: { name: string; vehicle: string; rating: number };
  receptionCode?: string;
  eta?: string;
  deliveredAt?: string;
  rated?: boolean;
  disputeId?: string;
  steps: { title: string; detail: string; state: "done" | "current" | "upcoming" }[];
}

export interface BuyerDispute {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  openedAt: string;
  attachments: number;
}

export interface FeedPost {
  id: string;
  shopId: string;
  kind: PostKind;
  caption: string;
  swatch: string;
  productId: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  media: number;
  sound?: string;
}

export interface FeedComment {
  id: string;
  author: string;
  seller?: boolean;
  ago: string;
  body: string;
  likes: number;
  masked?: boolean;
}

export interface BuyerNotification {
  id: string;
  kind: "delivery" | "escrow" | "delivered" | "refund" | "promo";
  title: string;
  body: string;
  ago: string;
  unread: boolean;
  href?: string;
}
