import type { Comment, Courier, Dispute, KycFile, Order, Transaction, User } from "@/lib/types";

export const adminKpis = {
  gmvToday: { value: 48_250_000, delta: "+8 % vs lundi dernier", trend: "up" as const },
  orders: { value: 312, delta: "+21 aujourd’hui", trend: "up" as const },
  escrow: { value: 126_400_000, delta: "Stable", trend: "neutral" as const },
  disputes: { value: 14, delta: "+3 depuis hier", trend: "down" as const },
  couriers: { value: 86, delta: "Stable", trend: "neutral" as const },
};

export const watchOrders: Order[] = [
  { id: "YY-24611", buyer: "Grâce Mbuyi", buyerArea: "Kalamu", seller: "Fashion Kin", createdAt: "17 oct.", lines: [{ product: "Robe wax", qty: 1, unitPrice: 185_000 }], deliveryFee: 0, commissionRate: 0.12, payment: "disputed", sellerStatus: "delivered", method: "M-Pesa" },
  { id: "YY-24702", buyer: "Junior Kabeya", buyerArea: "Lemba", seller: "Tech Lingwala", createdAt: "19 oct.", lines: [{ product: "Chargeur 65W", qty: 1, unitPrice: 82_000 }], deliveryFee: 0, commissionRate: 0.08, payment: "failed", sellerStatus: "new", method: "Orange Money" },
  { id: "YY-24755", buyer: "Sarah Ilunga", buyerArea: "Ngaliema", seller: "JBL Store Kin", createdAt: "5 h", lines: [{ product: "JBL Charge 5", qty: 1, unitPrice: 310_000 }], deliveryFee: 0, commissionRate: 0.1, payment: "in_delivery", delivery: "delivering", sellerStatus: "handed_over", method: "M-Pesa", courier: "Patrick K." },
  { id: "YY-24790", buyer: "Jean Mukendi", buyerArea: "Limete", seller: "Tech Lingwala", createdAt: "47 h", lines: [{ product: "Clavier sans fil", qty: 1, unitPrice: 82_000 }], deliveryFee: 0, commissionRate: 0.08, payment: "delivered", delivery: "delivered", sellerStatus: "delivered", method: "Cash", courier: "Didier L." },
];

export const allOrders: Order[] = [
  ...watchOrders,
  { id: "YY-24871", buyer: "Grâce M.", buyerArea: "Kalamu", seller: "JBL Store Kin", createdAt: "14:05", lines: [{ product: "JBL Tune 510BT", qty: 1, unitPrice: 125_000 }, { product: "Earbuds Pro", qty: 1, unitPrice: 160_000 }], deliveryFee: 14_250, commissionRate: 0.1, payment: "held", sellerStatus: "new", method: "M-Pesa" },
  { id: "YY-24868", buyer: "Jean Mukendi", buyerArea: "Limete", seller: "JBL Store Kin", createdAt: "13:10", lines: [{ product: "JBL Go 3", qty: 1, unitPrice: 95_000 }], deliveryFee: 5_000, commissionRate: 0.1, payment: "disputed", delivery: "delivered", sellerStatus: "delivered", method: "M-Pesa", courier: "Patrick K." },
  { id: "YY-24860", buyer: "Sarah I.", buyerArea: "Ngaliema", seller: "JBL Store Kin", createdAt: "11:20", lines: [{ product: "JBL Pulse 5", qty: 1, unitPrice: 180_000 }], deliveryFee: 9_000, commissionRate: 0.1, payment: "pending", sellerStatus: "preparing", method: "Cash" },
  { id: "YY-24852", buyer: "Jean M.", buyerArea: "Limete", seller: "JBL Store Kin", createdAt: "09:48", lines: [{ product: "JBL Go 3", qty: 1, unitPrice: 95_000 }], deliveryFee: 5_000, commissionRate: 0.1, payment: "held", delivery: "picking_up", sellerStatus: "ready", method: "M-Pesa", courier: "Patrick K." },
  { id: "YY-24820", buyer: "Ruth Nsimba", buyerArea: "Bandal", seller: "Beauté Kin", createdAt: "Hier", lines: [{ product: "Coffret soins", qty: 1, unitPrice: 45_000 }], deliveryFee: 0, commissionRate: 0.12, payment: "refunded", delivery: "failed", sellerStatus: "delivered", method: "Airtel Money" },
  { id: "YY-24801", buyer: "David Mpia", buyerArea: "Masina", seller: "Audio Plus", createdAt: "Hier", lines: [{ product: "Barre de son", qty: 1, unitPrice: 125_000 }], deliveryFee: 0, commissionRate: 0.08, payment: "released", delivery: "delivered", sellerStatus: "delivered", method: "M-Pesa", courier: "Didier L." },
];

export const transactions: Transaction[] = [
  { id: "TX-88213", orderId: "YY-24755", buyer: "Jean Mukendi", seller: "JBL Store Kin", amount: 405_000, status: "in_delivery", method: "M-Pesa", at: "Aujourd’hui 13:20" },
  { id: "TX-88209", orderId: "YY-24871", buyer: "Jean Mukendi", seller: "Audio Plus", amount: 125_000, status: "held", method: "M-Pesa", at: "Aujourd’hui 12:02" },
  { id: "TX-88190", orderId: "YY-24790", buyer: "Grâce Mbuyi", seller: "JBL Store Kin", amount: 290_000, status: "delivered", method: "Cash", at: "Hier 17:44" },
  { id: "TX-88177", orderId: "YY-24702", buyer: "Junior Kabeya", seller: "Tech Lingwala", amount: 82_000, status: "failed", method: "Orange Money", at: "19 oct." },
  { id: "TX-88140", orderId: "YY-24820", buyer: "Ruth Nsimba", seller: "Beauté Kin", amount: 45_000, status: "refunded", method: "Airtel Money", at: "18 oct." },
  { id: "TX-88102", orderId: "YY-24801", buyer: "Sarah Ilunga", seller: "Fashion Kin", amount: 185_000, status: "released", method: "Carte", at: "17 oct." },
  { id: "TX-88099", orderId: "YY-24799", buyer: "Patience L.", seller: "Tech Lingwala", amount: 64_000, status: "pending", method: "M-Pesa", at: "17 oct." },
];

export const escrowKpis = { held: 126_400_000, toRelease: 8_920_000, releasedMonth: 412_300_000, refundedMonth: 3_150_000 };

export const disputes: Dispute[] = [
  { id: "LT-0318", orderId: "YY-24868", buyer: "Jean Mukendi", seller: "JBL Store Kin", amount: 95_000, reason: "non_conforme", openedAgo: "1 h", quote: "Reçu en bleu, j’avais commandé la jaune.", courier: "Patrick K.", deadline: "21 oct. 15:10" },
  { id: "LT-0311", orderId: "YY-24611", buyer: "Grâce Mbuyi", seller: "Fashion Kin", amount: 185_000, reason: "non_recu", openedAgo: "3 j", quote: "Le livreur dit avoir livré mais je n’ai rien reçu.", courier: "Didier L.", deadline: "20 oct. 10:00" },
  { id: "LT-0305", orderId: "YY-24577", buyer: "Ruth Nsimba", seller: "Beauté Kin", amount: 45_000, reason: "article_manquant", openedAgo: "4 j", quote: "Il manque le sérum dans le coffret.", courier: "Patrick K.", deadline: "19 oct. 18:00" },
];

export const kycFiles: KycFile[] = [
  { id: "KYC-0412", name: "Patrick Kalala", role: "courier", detail: "Livreur · Moto", area: "Gombe", status: "to_review", sentAgo: "2 h", idType: "Carte d’électeur", license: "Catégorie A", mobileMoney: "+243 99 *** 432" },
  { id: "KYC-0411", name: "Sarah Ilunga", role: "seller", detail: "Vendeur", area: "Lingwala", status: "to_review", sentAgo: "5 h", idType: "Passeport", mobileMoney: "+243 81 *** 019", rccm: "CD/KIN/RCCM/24-A-01234" },
  { id: "KYC-0409", name: "David Mpia", role: "courier", detail: "Livreur · Voiture", area: "Lemba", status: "unreadable", sentAgo: "1 j", idType: "Carte d’électeur", license: "Catégorie B", mobileMoney: "+243 97 *** 870" },
  { id: "KYC-0405", name: "Fashion Kin", role: "seller", detail: "Vendeur", area: "Gombe", status: "approved", sentAgo: "2 j", idType: "Carte d’électeur", mobileMoney: "+243 82 *** 554" },
  { id: "KYC-0401", name: "Héritier B.", role: "courier", detail: "Livreur · Moto", area: "Kintambo", status: "rejected", sentAgo: "3 j", idType: "Carte d’électeur", license: "—", mobileMoney: "+243 89 *** 111" },
];

export const users: User[] = [
  { id: "u1", name: "Grâce Mbuyi", role: "buyer", phone: "+243 81 *** 221", area: "Kalamu", joinedAt: "Mars 2026", orders: 18, status: "active" },
  { id: "u2", name: "JBL Store Kin", role: "seller", phone: "+243 81 *** 678", area: "Gombe", joinedAt: "Janv. 2026", orders: 412, status: "active", rating: 4.6 },
  { id: "u3", name: "Patrick Kalala", role: "courier", phone: "+243 99 *** 432", area: "Gombe", joinedAt: "Oct. 2026", orders: 0, status: "pending" },
  { id: "u4", name: "Jean Mukendi", role: "buyer", phone: "+243 97 *** 300", area: "Limete", joinedAt: "Mai 2026", orders: 7, status: "active" },
  { id: "u5", name: "Tech Lingwala", role: "seller", phone: "+243 82 *** 410", area: "Lingwala", joinedAt: "Févr. 2026", orders: 230, status: "active", rating: 4.2 },
  { id: "u6", name: "Didier Lokwa", role: "courier", phone: "+243 85 *** 090", area: "Limete", joinedAt: "Avr. 2026", orders: 640, status: "active", rating: 4.8 },
  { id: "u7", name: "Compte Promo 243", role: "seller", phone: "+243 80 *** 000", area: "Masina", joinedAt: "Oct. 2026", orders: 0, status: "suspended" },
  { id: "u8", name: "Ruth Nsimba", role: "buyer", phone: "+243 84 *** 765", area: "Bandal", joinedAt: "Juin 2026", orders: 3, status: "active" },
];

export const couriers: Courier[] = [
  { id: "l1", name: "Didier Lokwa", vehicle: "Moto", area: "Limete", status: "on_mission", missionsToday: 9, cashToReturn: 0, rating: 4.8 },
  { id: "l2", name: "Patrick K.", vehicle: "Moto", area: "Gombe", status: "on_mission", missionsToday: 6, cashToReturn: 290_000, rating: 4.7 },
  { id: "l3", name: "Christian M.", vehicle: "Voiture", area: "Ngaliema", status: "available", missionsToday: 4, cashToReturn: 480_000, rating: 4.5 },
  { id: "l4", name: "Aimé T.", vehicle: "Moto", area: "Kalamu", status: "available", missionsToday: 7, cashToReturn: 0, rating: 4.9 },
  { id: "l5", name: "Joël N.", vehicle: "Vélo", area: "Bandal", status: "offline", missionsToday: 0, cashToReturn: 1_570_000, rating: 4.1 },
];

export const reportedComments: (Comment & { shop: string; reason: string })[] = [
  { id: "r1", postId: "c1", author: "Utilisateur", at: "5 min", body: "[Numéro masqué par YA YO] — contactez-moi", likes: 0, masked: true, shop: "JBL Store Kin", reason: "Numéro de téléphone" },
  { id: "r2", postId: "c9", author: "Promo243", at: "1 h", body: "Payez directement sur [lien masqué] pour -30 %", likes: 0, masked: true, shop: "Fashion Kin", reason: "Lien de paiement externe" },
  { id: "r3", postId: "c10", author: "Mamie K.", at: "3 h", body: "Arnaque, ne commandez pas ici !!!", likes: 3, reported: true, shop: "Beauté Kin", reason: "Signalé par le vendeur" },
];

export const gmvMonths = [
  { label: "Mai", value: 98 },
  { label: "Juin", value: 112 },
  { label: "Juil.", value: 121 },
  { label: "Août", value: 118 },
  { label: "Sept.", value: 139 },
  { label: "Oct.", value: 156 },
];

export const ordersByStatus = [
  { label: "Livrées", value: 612, tone: "success" as const },
  { label: "En livraison", value: 104, tone: "info" as const },
  { label: "En préparation", value: 71, tone: "warning" as const },
  { label: "Échouées", value: 34, tone: "danger" as const },
  { label: "Litiges", value: 21, tone: "accent" as const },
];

export const topSellers = [
  { name: "JBL Store Kin", gmv: 24_800_000, orders: 412, rating: 4.6 },
  { name: "Fashion Kin", gmv: 18_300_000, orders: 380, rating: 4.4 },
  { name: "Tech Lingwala", gmv: 12_900_000, orders: 230, rating: 4.2 },
  { name: "Beauté Kin", gmv: 7_400_000, orders: 198, rating: 4.5 },
];

export const commissionSettings = {
  defaultRate: 10,
  categories: [
    { name: "Électronique", rate: 8 },
    { name: "Mode et beauté", rate: 12 },
  ],
  deliveryFee: 5_000,
  courierPay: "3 000 FC + 500 FC/km",
  releaseDelayHours: 48,
  allowCash: true,
};
