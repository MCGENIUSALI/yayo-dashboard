import { IncidentForm } from "@/components/courier/screens";

export const metadata = { title: "Impossible de livrer" };

/** L9 · Incident de livraison (US-18). */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <IncidentForm id={(await params).id} />;
}
