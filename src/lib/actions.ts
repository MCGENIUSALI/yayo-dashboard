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
