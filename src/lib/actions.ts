/**
 * Write operations (client side). Like api.ts for reads, this is the only file
 * to wire to the real YA YO API: each function must resolve only once the
 * backend confirmed the change, and throw an Error with a user-facing message
 * otherwise.
 *
 * Until then they simulate network latency. To test the slow and failure
 * paths, add ?simuler=lent or ?simuler=echec to the URL (kept for the tab),
 * or set localStorage "yayo-simulate" to "slow" / "fail".
 */
import type { KycStatus, SellerOrderStatus, User } from "@/lib/types";

type Mode = "normal" | "slow" | "fail";

function mode(): Mode {
  if (typeof window === "undefined") return "normal";
  try {
    const q = new URLSearchParams(window.location.search).get("simuler");
    if (q) sessionStorage.setItem("yayo-simulate", q === "echec" ? "fail" : q === "lent" ? "slow" : "normal");
    const v = sessionStorage.getItem("yayo-simulate") ?? localStorage.getItem("yayo-simulate");
    return v === "fail" || v === "slow" ? v : "normal";
  } catch {
    return "normal";
  }
}

async function request<T>(result: T, failure: string): Promise<T> {
  const m = mode();
  const latency = m === "slow" ? 2600 : 450 + Math.random() * 350;
  await new Promise((r) => setTimeout(r, latency));
  if (m === "fail") throw new Error(`${failure} Vérifie ta connexion puis réessaie.`);
  return result;
}

export const updateOrderStatus = (id: string, status: SellerOrderStatus) => request({ id, status }, "Le statut de la commande n’a pas pu être mis à jour.");
export const reportStockout = (id: string, line: string) => request({ id, line }, "Le signalement de rupture n’a pas été envoyé.");
export const confirmHandover = (id: string) => request({ id }, "La remise au livreur n’a pas pu être confirmée.");
export const requestWithdrawal = (amount: number) => request({ amount }, "La demande de retrait n’a pas abouti.");
export const saveProduct = (kind: "draft" | "publish" | "save") => request({ kind }, "Le produit n’a pas été enregistré.");
export const deleteProduct = (id: string) => request({ id }, "Le produit n’a pas été supprimé.");
export const publishPost = (scheduled: boolean) => request({ scheduled }, "La publication n’a pas été envoyée.");
export const moderateComment = (id: string, action: "reply" | "hide" | "report") => request({ id, action }, "L’action sur le commentaire a échoué.");
export const submitShop = () => request(true, "Le dossier n’a pas été envoyé.");

export const decideDispute = (id: string, decision: "refund" | "exchange" | "reject") => request({ id, decision }, "La décision n’a pas été enregistrée.");
export const decideKyc = (id: string, status: KycStatus) => request({ id, status }, "La décision KYC n’a pas été enregistrée.");
export const releaseEscrow = (id: string) => request({ id }, "Les fonds n’ont pas été libérés.");
export const remindCourier = (id: string) => request({ id }, "La relance n’a pas été envoyée.");
export const resolveReport = (id: string, action: "restore" | "delete" | "suspend") => request({ id, action }, "Le signalement n’a pas été traité.");
export const setUserStatus = (id: string, status: User["status"]) => request({ id, status }, "Le statut du compte n’a pas changé.");
export const saveCommissionSettings = <T>(settings: T) => request(settings, "Les paramètres n’ont pas été enregistrés.");

/* ---------- Buyer app ---------- */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const sendOtp = (phone: string) => request({ phone }, "Le code n’a pas pu être envoyé.");
/** Demo: "000000" simulates a wrong or expired code (E8). */
export const verifyOtp = async (code: string) => {
  const r = await request({ code }, "Le code n’a pas pu être vérifié.");
  if (code === "000000") throw new Error("Code incorrect. Il te reste 2 essais.");
  return r;
};
export const saveProfile = () => request(true, "Ton profil n’a pas été enregistré.");
export const placeOrder = (method: string) => request({ id: "YY-24880", method }, "La commande n’a pas pu être créée.");
/** Mobile Money: the buyer validates on their phone, the operator answers after a few seconds. */
export const awaitMobileMoney = async () => {
  await wait(3200);
  return request(true, "Solde Mobile Money insuffisant.");
};
export const submitReview = () => request(true, "Ton avis n’a pas été publié.");
export const openDispute = (orderId: string) => request({ id: "LT-0318", orderId }, "Le signalement n’a pas été envoyé.");
export const addDisputeInfo = (id: string) => request({ id }, "L’information n’a pas été ajoutée.");
export const toggleFollow = (shopId: string, follow: boolean) => request({ shopId, follow }, "L’abonnement n’a pas été mis à jour.");
export const subscribeRestock = (productId: string) => request({ productId }, "L’alerte n’a pas été activée.");
export const postComment = (postId: string, body: string) => request({ postId, body }, "Ton commentaire n’a pas été publié.");
export const repost = (postId: string) => request({ postId }, "La publication n’a pas été republiée.");

/* ---------- Courier app ---------- */
export const submitCourierKyc = () => request(true, "Le dossier n’a pas été envoyé.");
export const setAvailability = (on: boolean) => request({ on }, "Ta disponibilité n’a pas changé.");
export const acceptMission = (id: string) => request({ id }, "La mission n’a pas pu être acceptée.");
/** Demo: handover code must match the seller's code. */
export const confirmPickup = async (id: string, code: string, expected: string) => {
  await request({ id }, "La collecte n’a pas été confirmée.");
  if (code.toUpperCase() !== expected) throw new Error("Code de remise incorrect. Demande-le à nouveau au vendeur.");
};
export const confirmDelivery = async (id: string, code: string, expected: string) => {
  await request({ id }, "La livraison n’a pas été confirmée.");
  if (code !== expected) throw new Error("Code de réception incorrect. Le client le trouve dans le suivi de sa commande.");
};
export const reportIncident = (id: string, reason: string) => request({ id, reason }, "L’incident n’a pas été déclaré.");
export const returnCash = (amount: number, channel: string) => request({ amount, channel }, "Le reversement n’a pas abouti.");

/* ---------- Seller content studio ---------- */
export const scheduleLive = () => request(true, "Le live n’a pas été programmé.");
export const publishStory = () => request(true, "La story n’a pas été publiée.");
export const saveCollection = (name: string) => request({ name }, "La collection n’a pas été enregistrée.");
export const startLive = (id: string) => request({ id }, "Le live n’a pas pu démarrer.");
