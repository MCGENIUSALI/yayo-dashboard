import { Welcome } from "@/components/buyer/onboarding";

export const metadata = { title: "Bienvenue" };

/** A1 · Splash, A2–A4 · Onboarding (Découvrir, Escrow, Livraison). */
export default function Page() {
  return <Welcome />;
}
