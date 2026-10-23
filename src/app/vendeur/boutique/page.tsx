import { CircleCheck, CircleHelp, Clock, Eye, LogOut, MapPin, ReceiptText, ShieldCheck, ShoppingBag, Star, Store, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, Overline } from "@/components/ui/card";
import { ListRow } from "@/components/ui/misc";
import { getSeller } from "@/lib/api";

export const metadata = { title: "Ma boutique" };

export default async function ShopPage() {
  const s = await getSeller();
  const groups = [
    {
      title: "Boutique",
      rows: [
        { icon: <Store />, title: "Informations et logo", subtitle: "Nom, catégorie, description", href: "/vendeur/ouverture" },
        { icon: <MapPin />, title: "Adresse de collecte", subtitle: s.address, href: "/vendeur/ouverture" },
        { icon: <Clock />, title: "Horaires de préparation", subtitle: s.hours, href: "/vendeur/boutique" },
      ],
    },
    {
      title: "Paiements",
      rows: [
        { icon: <Wallet />, title: "Compte de virement", subtitle: `${s.payout.provider} · ${s.payout.phone}`, href: "/vendeur/revenus" },
        { icon: <ReceiptText />, title: "Factures et relevés", href: "/vendeur/revenus" },
      ],
    },
    {
      title: "Compte",
      rows: [
        { icon: <ShieldCheck />, title: "Vérification d’identité", subtitle: `Validée le ${s.verifiedAt}`, href: "/vendeur/ouverture" },
        { icon: <CircleHelp />, title: "Centre d’aide vendeur", href: "/vendeur/boutique" },
        { icon: <ShoppingBag />, title: "Passer en mode acheteur", href: "/" },
        { icon: <LogOut />, title: "Se déconnecter", href: "/" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Vendeur" title="Ma boutique" />
      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <Card className="flex flex-col gap-4 p-4 md:p-5">
          <div className="flex items-center gap-3">
            <Avatar name={s.name} size="xl" verified={s.verified} />
            <div>
              <p className="type-h4">{s.name}</p>
              <p className="inline-flex items-center gap-1 type-body-s text-fg-secondary">
                <Star className="size-3.5 fill-warning text-warning" /> {s.rating.toLocaleString("fr-FR")} <span className="text-fg-tertiary">({s.reviews} avis)</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="success" icon={<CircleCheck />}>
              Identité vérifiée
            </Badge>
            <Badge icon={<MapPin />}>{s.area}</Badge>
          </div>
          <ButtonLink href="/vendeur/boutique" variant="outline" icon={<Eye className="size-4" />} block>
            Voir ma boutique comme un client
          </ButtonLink>
        </Card>

        <div className="flex flex-col gap-5">
          {groups.map((g) => (
            <section key={g.title} className="flex flex-col gap-2">
              <Overline>{g.title}</Overline>
              <Card className="divide-y divide-line-subtle overflow-hidden">
                {g.rows.map((r) => (
                  <ListRow key={r.title} {...r} />
                ))}
              </Card>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
