import { CourierMissions } from "@/components/courier/screens";

export const metadata = { title: "Missions" };

/** L13 · Mes missions (US-16). */
export default async function Page({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const { onglet } = await searchParams;
  return <CourierMissions initialTab={onglet === "proposees" ? "proposed" : onglet === "terminees" ? "done" : "ongoing"} />;
}
