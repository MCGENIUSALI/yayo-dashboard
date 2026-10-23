import { PageHeader } from "@/components/layout/page-header";
import { KycAdmin } from "@/components/admin/kyc-admin";
import { getKycFiles } from "@/lib/api";

export const metadata = { title: "Validations KYC" };

export default async function KycPage() {
  const files = await getKycFiles();
  const pending = files.filter((f) => f.status === "to_review" || f.status === "unreadable").length;
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Validations KYC" description={`${pending} dossiers en attente · vendeurs et livreurs (§8.1)`} />
      <KycAdmin files={files} />
    </div>
  );
}
