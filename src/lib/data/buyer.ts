import type { Address, BuyerDispute, BuyerNotification, BuyerOrder, CartLine, CatalogProduct, Category, FeedComment, FeedPost, Shop } from "@/lib/types";

export const buyer = {
  name: "Jean Mukendi",
  phone: "+243 81 234 5678",
  city: "Kinshasa",
  commune: "Kalamu",
  email: "jean.mukendi@email.cd",
  wallet: "M-Pesa",
  favorites: 12,
};

export const shops: Shop[] = [
  { id: "jbl-store-kin", name: "JBL Store Kin", category: "Électronique et audio", area: "Gombe", rating: 4.6, reviews: 312, followers: 12_800, verified: true, delivery: "24–48 h" },
  { id: "audio-plus", name: "Audio Plus Gombe", category: "Audio", area: "Gombe", rating: 4.4, reviews: 188, followers: 5_400, verified: true, delivery: "24–48 h" },
  { id: "tech-lingwala", name: "Tech Lingwala", category: "Électronique", area: "Lingwala", rating: 4.3, reviews: 96, followers: 2_100, verified: true, delivery: "48 h" },
  { id: "bilokos2kin", name: "Bilokos2Kin", category: "Électronique", area: "Gombe", rating: 4.8, reviews: 540, followers: 31_000, verified: true, delivery: "24 h" },
  { id: "mama-luka", name: "Mama Luka Mode", category: "Mode", area: "Kinshasa", rating: 4.7, reviews: 421, followers: 18_300, verified: true, delivery: "48 h" },
  { id: "kin-beaute", name: "Kin Beauté", category: "Beauté", area: "Ngaliema", rating: 4.5, reviews: 77, followers: 3_900, verified: true, delivery: "24–48 h" },
];

export const categories: Category[] = [
  { id: "electronique", label: "Électronique", count: "1 240 produits" },
  { id: "mode", label: "Mode", count: "3 510 produits" },
  { id: "beaute", label: "Beauté", count: "980 produits" },
  { id: "maison", label: "Maison", count: "2 430 produits" },
  { id: "audio", label: "Audio", count: "410 produits" },
  { id: "promos", label: "Promos", count: "126 offres" },
];

const yellow = { name: "Jaune", hex: "#F5C842" };
const blue = { name: "Bleu", hex: "#2F6FDB" };
const black = { name: "Noir", hex: "#1A1A1A" };
const white = { name: "Blanc", hex: "#F2F2F2" };
const orange = { name: "Orange", hex: "#FB7800" };

export const catalog: CatalogProduct[] = [
  { id: "jbl-go-3", name: "JBL Go 3 – Enceinte Bluetooth portable, étanche IP67", short: "JBL Go 3 – Enceinte portable", shopId: "jbl-store-kin", category: "audio", tags: ["enceinte", "bluetooth", "jbl", "promos"], price: 95_000, compareAt: 118_000, stock: 14, rating: 4.5, reviews: 128, colors: [yellow, blue, black], swatch: "teal", description: "Son JBL Pro puissant, 5 h d’autonomie, résistant à l’eau et à la poussière. Livraison à Kinshasa en 24 à 48 h.", fast: true, cod: true },
  { id: "jbl-tune-510bt", name: "JBL Tune 510BT – Casque sans fil", short: "JBL Tune 510BT – Casque sans fil", shopId: "audio-plus", category: "audio", tags: ["casque", "bluetooth", "jbl", "promos"], price: 125_000, compareAt: 156_000, stock: 9, rating: 4.5, reviews: 86, colors: [black, white], swatch: "dark", description: "Casque Bluetooth 5.0, 40 h d’autonomie, charge rapide : 5 min pour 2 h d’écoute.", fast: true, cod: true },
  { id: "earbuds-pro", name: "Earbuds Pro – Écouteurs à réduction de bruit", short: "Earbuds Pro – Orange", shopId: "tech-lingwala", category: "audio", tags: ["écouteurs", "bluetooth", "casque"], price: 160_000, stock: 21, rating: 4.3, reviews: 54, colors: [orange, black], swatch: "orange", description: "Réduction de bruit active, boîtier de charge, 24 h d’autonomie au total.", cod: true },
  { id: "jbl-charge-5", name: "JBL Charge 5 – Bleu", short: "JBL Charge 5", shopId: "jbl-store-kin", category: "audio", tags: ["enceinte", "bluetooth", "jbl"], price: 310_000, stock: 0, rating: 4.5, reviews: 64, colors: [blue], swatch: "slate", description: "20 h d’autonomie, powerbank intégrée, étanche IP67." },
  { id: "jbl-pulse-5", name: "JBL Pulse 5 – Enceinte lumineuse", short: "JBL Pulse 5 – Enceinte lumineuse", shopId: "bilokos2kin", category: "audio", tags: ["enceinte", "bluetooth", "jbl", "lumineuse"], price: 180_000, stock: 6, rating: 4.8, reviews: 212, colors: [black], swatch: "sun", description: "Son 360° et show lumineux personnalisable. Livrée en 24 h à Kinshasa.", fast: true, cod: true },
  { id: "jbl-go-3-gris", name: "JBL Go 3 – Gris", short: "JBL Go 3 – Gris", shopId: "audio-plus", category: "audio", tags: ["enceinte", "bluetooth", "jbl"], price: 89_000, stock: 4, rating: 4.4, reviews: 41, colors: [{ name: "Gris", hex: "#9AA3AD" }], swatch: "slate", description: "La plus petite JBL, toujours aussi fun.", cod: true },
  { id: "veste-wax", name: "Veste en jean col wax, taillée sur mesure", short: "Veste jean col wax", shopId: "mama-luka", category: "mode", tags: ["veste", "wax", "mode"], price: 65_000, stock: 12, rating: 4.7, reviews: 133, colors: [{ name: "Denim", hex: "#3B5277" }], swatch: "denim", description: "Nouvelle collection wax : vestes taillées sur mesure, livraison 48 h.", cod: true },
  { id: "robe-ankara", name: "Robe Ankara longue", short: "Robe Ankara", shopId: "mama-luka", category: "mode", tags: ["robe", "wax", "mode", "promos"], price: 45_000, compareAt: 55_000, stock: 7, rating: 4.6, reviews: 58, colors: [{ name: "Rouge", hex: "#C42A23" }, orange], swatch: "red", description: "Coton wax 100 %, coupe longue, tailles S à XL.", cod: true },
  { id: "serum-karite", name: "Sérum éclat au karité", short: "Sérum éclat karité", shopId: "kin-beaute", category: "beaute", tags: ["beauté", "karité", "soin"], price: 28_000, stock: 30, rating: 4.5, reviews: 39, colors: [], swatch: "cream", description: "Sérum visage au beurre de karité de Kisangani, 30 ml.", fast: true, cod: true },
  { id: "smartphone-a15", name: "Smartphone A15 – 128 Go", short: "Smartphone A15", shopId: "tech-lingwala", category: "electronique", tags: ["téléphone", "smartphone"], price: 420_000, stock: 5, rating: 4.2, reviews: 27, colors: [black, blue], swatch: "dark", description: "Écran 6,5″, double SIM, batterie 5 000 mAh." },
];

/** Demo cart: one price went up and one item went out of stock since it was added (E7). */
export const initialCart: CartLine[] = [
  { productId: "jbl-go-3", color: "Jaune", qty: 1, unitPrice: 89_000 },
  { productId: "jbl-charge-5", color: "Bleu", qty: 1, unitPrice: 310_000 },
  { productId: "jbl-tune-510bt", color: "Noir", qty: 1, unitPrice: 125_000 },
];

export const DELIVERY_FEE_PER_SHOP = 5_000;
export const PROMO = { code: "YAYO10", amount: 20_000, minimum: 100_000 };

export const addresses: Address[] = [
  { id: "maison", label: "Maison", line: "12, av. Kasa-Vubu, Q. Matonge, Kalamu", phone: "+243 81 234 5678", kind: "home" },
  { id: "bureau", label: "Bureau", line: "45, bd du 30 Juin, Gombe", phone: "+243 99 876 5432", kind: "work" },
];

export const slots = ["Dès que possible", "Demain 9h–12h", "Demain 14h–18h"];

export const recentSearches = ["Chaussures sport", "JBL Go 3"];
export const searchSuggestions = ["Casque bluetooth", "Enceinte JBL", "Robe wax", "Sérum karité"];

const deliveredSteps = (at: string): BuyerOrder["steps"] => [
  { title: "Paiement sécurisé", detail: "Fonds bloqués par YA YO", state: "done" },
  { title: "Commande préparée", detail: "Colis prêt chez le vendeur", state: "done" },
  { title: "Colis collecté", detail: "Par le livreur", state: "done" },
  { title: "En livraison", detail: "Livreur en route", state: "done" },
  { title: "Livrée", detail: at, state: "done" },
];

export const buyerOrders: BuyerOrder[] = [
  {
    id: "YY-24868",
    placedAt: "Aujourd’hui",
    shopId: "jbl-store-kin",
    lines: [
      { productId: "jbl-go-3", color: "Jaune", qty: 1, unitPrice: 95_000 },
      { productId: "jbl-charge-5", color: "Bleu", qty: 1, unitPrice: 310_000 },
    ],
    deliveryFee: 0,
    payment: "in_delivery",
    delivery: "delivering",
    method: "M-Pesa",
    tab: "ongoing",
    courier: { name: "Patrick K.", vehicle: "Moto", rating: 4.9 },
    receptionCode: "4827",
    eta: "14:30 – 14:50",
    steps: [
      { title: "Paiement sécurisé", detail: "Aujourd’hui 10:12 · fonds bloqués par YA YO", state: "done" },
      { title: "Commande préparée", detail: "JBL Store Kin · 11:40", state: "done" },
      { title: "Colis collecté", detail: "Patrick K. · 13:55", state: "done" },
      { title: "En livraison", detail: "Arrivée vers 14:30", state: "current" },
      { title: "Livrée", detail: "Le livreur saisit ton code de réception", state: "upcoming" },
    ],
  },
  {
    id: "YY-24872",
    placedAt: "Aujourd’hui",
    shopId: "audio-plus",
    lines: [{ productId: "jbl-tune-510bt", color: "Noir", qty: 1, unitPrice: 125_000 }],
    deliveryFee: 0,
    payment: "held",
    delivery: "assigned",
    method: "Orange Money",
    tab: "ongoing",
    courier: { name: "Didier L.", vehicle: "Moto", rating: 4.7 },
    receptionCode: "1593",
    eta: "Demain, 9h–12h",
    steps: [
      { title: "Paiement sécurisé", detail: "Aujourd’hui 12:30 · fonds bloqués par YA YO", state: "done" },
      { title: "Commande préparée", detail: "Audio Plus Gombe prépare ton colis", state: "current" },
      { title: "Colis collecté", detail: "Didier L. est assigné", state: "upcoming" },
      { title: "En livraison", detail: "Demain, 9h–12h", state: "upcoming" },
      { title: "Livrée", detail: "Le livreur saisit ton code de réception", state: "upcoming" },
    ],
  },
  {
    id: "YY-24790",
    placedAt: "15 oct.",
    shopId: "tech-lingwala",
    lines: [{ productId: "earbuds-pro", color: "Orange", qty: 1, unitPrice: 82_000 }],
    deliveryFee: 0,
    payment: "released",
    delivery: "delivered",
    method: "Airtel Money",
    tab: "delivered",
    courier: { name: "Patrick K.", vehicle: "Moto", rating: 4.9 },
    deliveredAt: "15 oct. à 14:42",
    steps: deliveredSteps("15 oct. à 14:42"),
  },
  {
    id: "YY-24711",
    placedAt: "9 oct.",
    shopId: "mama-luka",
    lines: [{ productId: "veste-wax", color: "Denim", qty: 1, unitPrice: 65_000 }],
    deliveryFee: 5_000,
    payment: "released",
    delivery: "delivered",
    method: "Cash",
    tab: "delivered",
    courier: { name: "Merveille T.", vehicle: "Moto", rating: 4.8 },
    deliveredAt: "11 oct. à 10:05",
    rated: true,
    steps: deliveredSteps("11 oct. à 10:05"),
  },
  {
    id: "YY-24655",
    placedAt: "5 oct.",
    shopId: "jbl-store-kin",
    lines: [{ productId: "jbl-go-3", color: "Jaune", qty: 1, unitPrice: 95_000 }],
    deliveryFee: 0,
    payment: "disputed",
    delivery: "delivered",
    method: "M-Pesa",
    tab: "dispute",
    courier: { name: "Patrick K.", vehicle: "Moto", rating: 4.9 },
    deliveredAt: "20 oct. à 14:42",
    disputeId: "LT-0318",
    steps: deliveredSteps("20 oct. à 14:42"),
  },
];

export const buyerDisputes: BuyerDispute[] = [{ id: "LT-0318", orderId: "YY-24655", amount: 95_000, reason: "Produit non conforme", openedAt: "20 oct. 2026, 15:10", attachments: 1 }];

export const buyerNotifications: BuyerNotification[] = [
  { id: "bn1", kind: "delivery", title: "Ton colis est en route", body: "Patrick K. a récupéré ta commande #YY-24868 chez JBL Store Kin.", ago: "il y a 5 min", unread: true, href: "/acheteur/commandes/YY-24868" },
  { id: "bn2", kind: "escrow", title: "Paiement sécurisé", body: "520 000 FC sont bloqués par YA YO jusqu’à la livraison.", ago: "il y a 2 h", unread: true, href: "/acheteur/commandes" },
  { id: "bn3", kind: "delivered", title: "Commande livrée", body: "Ta commande #YY-24790 a été remise. Donne ton avis.", ago: "15 oct.", unread: false, href: "/acheteur/commandes/YY-24790/avis" },
  { id: "bn4", kind: "refund", title: "Remboursement effectué", body: "82 000 FC ont été renvoyés sur ton compte M-Pesa.", ago: "10 oct.", unread: false },
  { id: "bn5", kind: "promo", title: "Promo du week-end", body: "-20 % sur l’audio chez les vendeurs certifiés.", ago: "8 oct.", unread: false, href: "/acheteur/explorer?categorie=promos" },
];

export const feedPosts: FeedPost[] = [
  { id: "f1", shopId: "bilokos2kin", kind: "video", caption: "Le son 360° de la JBL Pulse en vrai 🔊 Livrée en 24 h à Kinshasa, paiement protégé YA YO.", swatch: "sun", productId: "jbl-pulse-5", likes: 12_400, comments: 328, saves: 1_100, shares: 86, media: 4, sound: "Son original · Bilokos2Kin" },
  { id: "f2", shopId: "mama-luka", kind: "photo", caption: "Nouvelle collection wax 🧡 Vestes taillées sur mesure, livraison 48 h.", swatch: "denim", productId: "veste-wax", likes: 2_100, comments: 86, saves: 240, shares: 6, media: 4 },
  { id: "f3", shopId: "jbl-store-kin", kind: "video", caption: "Go 3 : la plus petite, la plus fun. Étanche, 5 h d’autonomie.", swatch: "teal", productId: "jbl-go-3", likes: 5_600, comments: 112, saves: 430, shares: 31, media: 1, sound: "Son original · JBL Store Kin" },
  { id: "f4", shopId: "kin-beaute", kind: "photo", caption: "Le sérum au karité qui fait briller ✨ Stock limité.", swatch: "cream", productId: "serum-karite", likes: 980, comments: 24, saves: 75, shares: 3, media: 2 },
  { id: "f5", shopId: "tech-lingwala", kind: "video", caption: "Earbuds Pro : la réduction de bruit qui change tout dans les embouteillages 🚕", swatch: "orange", productId: "earbuds-pro", likes: 1_400, comments: 45, saves: 120, shares: 12, media: 1, sound: "Son original · Tech Lingwala" },
];

/** Shops the demo buyer follows (SC3). */
export const followedShops = ["mama-luka", "bilokos2kin", "kin-beaute"];

export const feedComments: FeedComment[] = [
  { id: "fc1", author: "Grâce M.", ago: "2 h", body: "Elle existe en bleu ? Livraison possible à Lemba ?", likes: 12 },
  { id: "fc2", author: "Bilokos2Kin", seller: true, ago: "1 h", body: "Oui en bleu et noir 👍 Livraison partout à Kinshasa, commande directement depuis la vidéo.", likes: 30 },
  { id: "fc3", author: "Junior K.", ago: "45 min", body: "Reçue hier, le son est top. Paiement protégé, aucun souci.", likes: 8 },
  { id: "fc4", author: "Utilisateur", ago: "5 min", body: "[Numéro masqué par YA YO] — contactez-moi", likes: 0, masked: true },
];

export const savedPosts = {
  saved: ["f1", "f2", "f3", "f4", "f5", "f1"],
  reposted: ["f1", "f2", "f5"],
  liked: ["f2", "f3", "f4", "f5"],
};

export const savedCollections = ["Tout", "Cadeaux", "Audio", "À acheter en fin de mois"];

/** Lives shown on a shop's public profile (B5 · onglet Lives). */
export const shopLives: Record<string, { id: string; title: string; state: "live" | "scheduled" | "replay"; when: string; viewers?: number; swatch: string }[]> = {
  "jbl-store-kin": [
    { id: "sl1", title: "Super promo JBL : −30 % en direct", state: "live", when: "En direct depuis 12 min", viewers: 842, swatch: "orange" },
    { id: "sl2", title: "Nouveautés de la semaine", state: "scheduled", when: "Vendredi à 18h", swatch: "teal" },
    { id: "sl3", title: "Arrivage spécial casques", state: "replay", when: "18 oct. · 45 min", viewers: 6_200, swatch: "dark" },
  ],
  bilokos2kin: [{ id: "sl4", title: "Unboxing JBL Pulse 5", state: "scheduled", when: "Samedi à 16h", swatch: "sun" }],
  "mama-luka": [{ id: "sl5", title: "Défilé wax : la collection d’octobre", state: "replay", when: "12 oct. · 30 min", viewers: 3_100, swatch: "denim" }],
};
