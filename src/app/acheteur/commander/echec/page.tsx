import { FailedStep } from "@/components/buyer/checkout";

export const metadata = { title: "Paiement échoué" };

/** C6 · Paiement échoué (US-05). Reached from C4 when the operator refuses (try ?simuler=echec). */
export default async function Page({ searchParams }: { searchParams: Promise<{ motif?: string }> }) {
  const { motif } = await searchParams;
  return <FailedStep reason={motif} />;
}
