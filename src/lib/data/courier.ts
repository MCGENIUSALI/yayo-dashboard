export interface Mission {
  id: string;
  parcels: number;
  fee: number;
  pickup: { shop: string; address: string; handoverCode: string };
  dropoff: { name: string; address: string; note?: string; receptionCode: string };
  orderId: string;
  cash: number;
  distance: string;
  status: "proposed" | "picking_up" | "delivering" | "done" | "failed";
  plannedAt?: string;
}

export const courier = {
  first: "Patrick",
  name: "Patrick Kalala",
  area: "Gombe",
  rating: 4.9,
  rides: 214,
  vehicle: "Moto",
  plate: "KN 4521 BB",
  zones: "Gombe, Kalamu, Lingwala",
  payout: "+243 99 *** 432",
  kycValidatedAt: "21 oct.",
  todayEarnings: 25_500,
  weekEarnings: 127_500,
};

export const missions: Mission[] = [
  {
    id: "M-5521",
    parcels: 2,
    fee: 8_500,
    pickup: { shop: "JBL Store Kin", address: "Av. du Commerce n°18, Gombe", handoverCode: "H067" },
    dropoff: { name: "Grâce M.", address: "12, av. Kasa-Vubu, Q. Matonge, Kalamu", note: "Portail bleu, face à la pharmacie", receptionCode: "4827" },
    orderId: "YY-24871",
    cash: 290_000,
    distance: "6,2 km · 25 min",
    status: "proposed",
  },
  {
    id: "M-5530",
    parcels: 1,
    fee: 6_000,
    pickup: { shop: "Tech Lingwala", address: "Av. Kabinda n°40, Lingwala", handoverCode: "T512" },
    dropoff: { name: "Junior K.", address: "Q. Salongo, Lemba", receptionCode: "7351" },
    orderId: "YY-24875",
    cash: 0,
    distance: "9,8 km · 35 min",
    status: "proposed",
    plannedAt: "Collecte prévue 16:00",
  },
];

/** Cash collected on delivery, to hand back to YA YO (L10). */
export const cashToReturn = [
  { orderId: "YY-24871", name: "Grâce M.", at: "Livrée 14:42", amount: 290_000 },
  { orderId: "YY-24880", name: "Junior K.", at: "Livrée 16:10", amount: 290_000 },
];

export const history = [
  { id: "M-5521", route: "Gombe → Kalamu", at: "Aujourd’hui 14:42", status: "Livrée", fee: 8_500, ok: true },
  { id: "M-5498", route: "Lingwala → Lemba", at: "Hier 17:05", status: "Échec, client absent", fee: 3_000, ok: false },
  { id: "M-5490", route: "Gombe → Bandal", at: "Hier 11:20", status: "Livrée", fee: 7_000, ok: true },
  { id: "M-5476", route: "Kintambo → Ngaliema", at: "17 oct. 15:48", status: "Livrée", fee: 9_500, ok: true },
  { id: "M-5461", route: "Gombe → Limete", at: "16 oct. 10:02", status: "Livrée", fee: 11_000, ok: true },
];

export const earnings = {
  jour: { label: "Aujourd’hui", total: 25_500, missions: 3, rides: 22_500, bonus: 3_000, delta: 8 },
  semaine: { label: "Semaine du 14 au 20 oct.", total: 127_500, missions: 15, rides: 120_000, bonus: 7_500, delta: 12 },
  mois: { label: "Octobre", total: 482_000, missions: 61, rides: 455_000, bonus: 27_000, delta: 5 },
};
