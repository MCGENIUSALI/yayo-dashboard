import { PageHeader } from "@/components/layout/page-header";
import { CommissionForm } from "@/components/admin/commission-form";
import { getCommissionSettings } from "@/lib/api";

export const metadata = { title: "Commissions et frais" };

export default async function CommissionsPage() {
  const settings = await getCommissionSettings();
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Commissions et frais" description="Paramètres appliqués aux nouvelles commandes" />
      <CommissionForm initial={settings} />
    </div>
  );
}
