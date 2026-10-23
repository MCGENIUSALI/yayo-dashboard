import type { Comment, Notification, Order, Post, Product } from "@/lib/types";

export const currentSeller = {
  id: "shop_jbl",
  owner: "Grâce",
  name: "JBL Store Kin",
  category: "Électronique et audio",
  area: "Gombe",
  address: "Av. du Commerce n°18, Gombe",
  hours: "Lun–Sam, 8h–18h",
  rating: 4.6,
  reviews: 312,
  followers: 12_800,
  verified: true,
  verifiedAt: "14 oct.",
  payout: { provider: "M-Pesa", phone: "+243 81 *** 678" },
};

export const products: Product[] = [
  { id: "p1", name: "JBL Go 3 – Enceinte portable", category: "Électronique › Audio", price: 95_000, compareAt: 118_000, stock: 14, rating: 4.5, online: true, colors: ["Jaune", "Bleu", "Noir"], image: "teal", description: "Son JBL Pro, 5 h d’autonomie, étanche IP67." },
  { id: "p2", name: "JBL Charge 5 – Bleu", category: "Électronique › Audio", price: 310_000, stock: 0, rating: 4.5, online: true, colors: ["Bleu"], image: "slate", description: "20 h d’autonomie, powerbank intégrée." },
  { id: "p3", name: "JBL Tune 510BT – Casque sans fil", category: "Électronique › Audio", price: 125_000, stock: 3, rating: 4.5, online: true, colors: ["Noir", "Blanc"], image: "dark", description: "Casque Bluetooth 5.0, 40 h d’autonomie." },
  { id: "p4", name: "JBL Pulse 5 – Enceinte lumineuse", category: "Électronique › Audio", price: 180_000, stock: 8, rating: 4.8, online: true, colors: ["Noir"], image: "sun", description: "Son 360° et show lumineux personnalisable." },
  { id: "p5", name: "Earbuds Pro – Orange", category: "Électronique › Audio", price: 160_000, stock: 21, rating: 4.3, online: true, colors: ["Orange", "Noir"], image: "orange", description: "Réduction de bruit active, boîtier de charge." },
  { id: "p6", name: "JBL Flip 6 – Rouge", category: "Électronique › Audio", price: 220_000, stock: 5, rating: 4.7, online: false, colors: ["Rouge"], image: "red", description: "Brouillon : photos à compléter." },
];

export const sellerOrders: Order[] = [
  { id: "YY-24871", buyer: "Grâce M.", buyerArea: "Kalamu", seller: "JBL Store Kin", createdAt: "14:05", lines: [{ product: "JBL Tune 510BT", variant: "Noir", qty: 1, unitPrice: 125_000 }, { product: "Earbuds Pro", variant: "Orange", qty: 1, unitPrice: 160_000 }], deliveryFee: 14_250, commissionRate: 0.1, payment: "held", sellerStatus: "new", method: "M-Pesa", handoverCode: "H067" },
  { id: "YY-24875", buyer: "Junior K.", buyerArea: "Lemba", seller: "JBL Store Kin", createdAt: "14:32", lines: [{ product: "JBL Go 3", variant: "Jaune", qty: 2, unitPrice: 95_000 }], deliveryFee: 0, commissionRate: 0.1, payment: "held", sellerStatus: "new", method: "Orange Money", handoverCode: "K241" },
  { id: "YY-24860", buyer: "Sarah I.", buyerArea: "Ngaliema", seller: "JBL Store Kin", createdAt: "11:20", lines: [{ product: "JBL Pulse 5", variant: "Noir", qty: 1, unitPrice: 180_000 }], deliveryFee: 9_000, commissionRate: 0.1, payment: "held", sellerStatus: "preparing", method: "Cash", handoverCode: "P552" },
  { id: "YY-24852", buyer: "Jean M.", buyerArea: "Limete", seller: "JBL Store Kin", createdAt: "09:48", lines: [{ product: "JBL Go 3", variant: "Bleu", qty: 1, unitPrice: 95_000 }], deliveryFee: 5_000, commissionRate: 0.1, payment: "held", sellerStatus: "ready", delivery: "assigned", courier: "Patrick K.", method: "M-Pesa", handoverCode: "Z903" },
  { id: "YY-24790", buyer: "Ruth N.", buyerArea: "Bandal", seller: "JBL Store Kin", createdAt: "Hier", lines: [{ product: "Earbuds Pro", variant: "Noir", qty: 1, unitPrice: 82_000 }], deliveryFee: 0, commissionRate: 0.1, payment: "released", sellerStatus: "delivered", delivery: "delivered", courier: "Didier L.", method: "Airtel Money" },
];

export const sellerKpis = {
  salesToday: { value: 1_250_000, delta: 12 },
  toProcess: 4,
  secured: 830_000,
  rating: { value: 4.6, delta: -0.1 },
  balance: 1_240_500,
  nextPayout: "22 oct.",
  monthSales: { value: 3_450_000, delta: 12 },
  monthCommission: 345_000,
  monthDelivery: 172_500,
};

export const salesWeek = [
  { label: "Lun", value: 620_000 },
  { label: "Mar", value: 410_000 },
  { label: "Mer", value: 880_000 },
  { label: "Jeu", value: 540_000 },
  { label: "Ven", value: 1_120_000 },
  { label: "Sam", value: 1_480_000 },
  { label: "Dim", value: 1_250_000 },
];

export const payouts = [
  { id: "m1", label: "Commande #YY-24790", detail: "Libéré · Airtel Money", amount: 73_800, at: "Hier", kind: "in" as const },
  { id: "m2", label: "Virement M-Pesa", detail: "+243 81 *** 678", amount: -1_500_000, at: "15 oct.", kind: "out" as const },
  { id: "m3", label: "Commande #YY-24711", detail: "Libéré · M-Pesa", amount: 256_500, at: "14 oct.", kind: "in" as const },
  { id: "m4", label: "Commande #YY-24688", detail: "Libéré · Cash", amount: 112_500, at: "13 oct.", kind: "in" as const },
];

export const posts: Post[] = [
  { id: "c1", caption: "Le son 360° de la JBL Pulse en vrai 🔊 #kinshasa #jbl", kind: "video", state: "published", publishedAt: "18 oct.", duration: "0:24", cover: "sun", productIds: ["p4", "p1"], stats: { views: 48_200, likes: 12_400, clicks: 3_150, sales: 27, revenue: 4_800_000, shares: 640, saves: 1_100 }, allowComments: true, allowShare: true, allowOrder: true },
  { id: "c2", caption: "Go 3 : la plus petite, la plus fun", kind: "photo", state: "published", publishedAt: "16 oct.", cover: "teal", productIds: ["p1"], stats: { views: 12_100, likes: 2_300, clicks: 640, sales: 6, revenue: 570_000, shares: 88, saves: 210 }, allowComments: true, allowShare: true, allowOrder: true },
  { id: "c3", caption: "Unboxing Charge 5 bleue", kind: "video", state: "published", publishedAt: "14 oct.", duration: "0:41", cover: "slate", productIds: ["p2"], stats: { views: 9_800, likes: 1_450, clicks: 410, sales: 2, revenue: 620_000, shares: 51, saves: 132 }, allowComments: true, allowShare: true, allowOrder: true },
  { id: "c4", caption: "Le Tune 510BT au quotidien", kind: "photo", state: "published", publishedAt: "12 oct.", cover: "dark", productIds: ["p3"], stats: { views: 4_300, likes: 610, clicks: 150, sales: 1, revenue: 125_000, shares: 12, saves: 40 }, allowComments: true, allowShare: true, allowOrder: true },
  { id: "c5", caption: "Earbuds Pro, couleur de la saison", kind: "video", state: "published", publishedAt: "10 oct.", duration: "0:18", cover: "orange", productIds: ["p5"], stats: { views: 3_900, likes: 520, clicks: 98, sales: 1, revenue: 160_000, shares: 9, saves: 22 }, allowComments: true, allowShare: true, allowOrder: true },
  { id: "c6", caption: "Go 3 jaune · arrivage", kind: "photo", state: "published", publishedAt: "8 oct.", cover: "teal", productIds: ["p1"], stats: { views: 2_200, likes: 300, clicks: 60, sales: 0, revenue: 0, shares: 4, saves: 18 }, allowComments: true, allowShare: true, allowOrder: true },
  { id: "c7", caption: "Flip 6 rouge (brouillon)", kind: "video", state: "draft", publishedAt: "—", duration: "0:12", cover: "red", productIds: ["p6"], stats: { views: 0, likes: 0, clicks: 0, sales: 0, revenue: 0, shares: 0, saves: 0 }, allowComments: true, allowShare: true, allowOrder: false },
  { id: "c8", caption: "Sélection week-end", kind: "photo", state: "draft", publishedAt: "—", cover: "sun", productIds: [], stats: { views: 0, likes: 0, clicks: 0, sales: 0, revenue: 0, shares: 0, saves: 0 }, allowComments: true, allowShare: true, allowOrder: true },
];

export const comments: Comment[] = [
  { id: "k1", postId: "c1", author: "Grâce M.", at: "2 h", body: "Elle existe en bleu ? Livraison possible à Lemba ?", likes: 0 },
  { id: "k2", postId: "c1", author: "Utilisateur", at: "5 min", body: "[Numéro masqué par YA YO] — contactez-moi", likes: 0, masked: true },
  { id: "k3", postId: "c1", author: "Junior K.", at: "1 j", body: "Reçue hier, le son est incroyable 🔥", likes: 14, sellerReply: "Merci Junior ! Profite bien 🙏" },
  { id: "k4", postId: "c2", author: "Ruth N.", at: "3 j", body: "Le prix en dollars ?", likes: 2 },
];

export const sellerNotifications: Notification[] = [
  { id: "n1", kind: "order", title: "Nouvelle commande #YY-24875", body: "Junior K. · 2× JBL Go 3 · 171 000 FC net estimé.", ago: "il y a 2 min", unread: true, href: "/vendeur/commandes/YY-24875" },
  { id: "n2", kind: "courier", title: "Livreur assigné", body: "Patrick K. vient collecter #YY-24871 vers 14:20.", ago: "il y a 15 min", unread: true, href: "/vendeur/commandes/YY-24871/remise" },
  { id: "n3", kind: "stock", title: "Stock faible", body: "JBL Tune 510BT : plus que 3 en stock.", ago: "il y a 1 h", unread: true, href: "/vendeur/produits/p3" },
  { id: "n4", kind: "payout", title: "Paiement libéré", body: "73 800 FC versés pour #YY-24790.", ago: "Hier", unread: false, href: "/vendeur/revenus" },
  { id: "n5", kind: "dispute", title: "Litige ouvert", body: "#LT-0318 : réponds avant le 21 oct. 15:10.", ago: "Hier", unread: false },
  { id: "n6", kind: "comment", title: "2 commentaires à modérer", body: "Sur « Le son 360° de la JBL Pulse… »", ago: "Hier", unread: false, href: "/vendeur/contenus/c1" },
];
