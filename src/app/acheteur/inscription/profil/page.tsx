import { RoleStep } from "@/components/buyer/onboarding";

export const metadata = { title: "Choix du profil" };

/** A8 · Choix du profil: acheteur, vendeur (→ V1) ou livreur (→ L1). */
export default function Page() {
  return <RoleStep />;
}
