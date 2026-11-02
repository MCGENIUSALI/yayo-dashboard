import { MissionFlow } from "@/components/courier/screens";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: `Mission #${(await params).id}` };
}

/** L5 · Collecte, L6 · En livraison, L7 · Confirmer (code + cash), L8 · Livraison confirmée (US-17). */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <MissionFlow id={(await params).id} />;
}
