import { PageHeader } from "@/components/layout/page-header";
import { ShopOnboarding } from "@/components/seller/shop-onboarding";

export const metadata = { title: "Ouvrir ma boutique" };

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <PageHeader back="/vendeur/boutique" title="Ouvrir ma boutique" />
      <ShopOnboarding />
    </div>
  );
}
