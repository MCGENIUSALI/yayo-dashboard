import { PageHeader } from "@/components/layout/page-header";
import { LiveScheduleForm } from "@/components/seller/content-studio";
import { getProducts } from "@/lib/api";

export const metadata = { title: "Programmer un live" };

export default async function ScheduleLivePage() {
  const products = await getProducts();
  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/vendeur/contenus/lives" title="Programmer un live" />
      <LiveScheduleForm products={products} />
    </div>
  );
}
