import { PageHeader } from "@/components/layout/page-header";
import { DisputesAdmin } from "@/components/admin/disputes-admin";
import { getDisputes } from "@/lib/api";

export const metadata = { title: "Litiges" };

export default async function DisputesPage() {
  const disputes = await getDisputes();
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Litiges" description="14 ouverts · délai cible 72 h" />
      <DisputesAdmin disputes={disputes} />
    </div>
  );
}
