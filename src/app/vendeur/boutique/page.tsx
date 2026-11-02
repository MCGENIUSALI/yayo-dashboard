import { ChartNoAxesColumn, CircleCheck, CircleHelp, Clock, Eye, FolderPlus, LogOut, MapPin, Package, PackagePlus, Radio, ReceiptText, ShieldCheck, ShoppingBag, Star, Store, Video, Wallet } from "lucide-react";
import Link from "next/link";
import { AddContentButton } from "@/components/seller/content-studio";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, Overline } from "@/components/ui/card";
import { ListRow } from "@/components/ui/misc";
import { getContentAnalytics, getPosts, getProducts, getSeller } from "@/lib/api";
import { formatCompact, formatNumber } from "@/lib/format";

export const metadata = { title: "Ma boutique" };

export default async function ShopPage() {
  const [s, products, posts, analytics] = await Promise.all([getSeller(), getProducts(), getPosts(), getContentAnalytics()]);
  const sales = posts.reduce((n, p) => n + p.stats.sales, 0);
  const stats = [
    { label: "Produits", value: formatNumber(products.length) },
    { label: "Abonnés", value: formatCompact(s.followers) },
    { label: "Contenus", value: formatNumber(posts.length) },
    { label: "Ventes", value: formatNumber(sales) },
  ];
  const quick = [
    { href: "/vendeur/contenus/nouveau?type=video", icon: <Video />, label: "Ajouter vidéo" },
    { href: "/vendeur/produits/nouveau", icon: <PackagePlus />, label: "Ajouter produit" },
    { href: "/vendeur/contenus/collections", icon: <FolderPlus />, label: "Créer collection" },
    { href: "/vendeur/contenus/lives/nouveau", icon: <Radio />, label: "Planifier un live" },
    { href: "/vendeur/commandes", icon: <Package />, label: "Voir commandes" },
    { href: "/vendeur/revenus", icon: <Wallet />, label: "Voir revenus" },
  ];
  const week = analytics.semaine;
  const overview = [
    { label: "Vues profil", value: formatNumber(week.profileViews) },
    { label: "Clics", value: formatNumber(week.clicks) },
    { label: "Conversion", value: `${week.conversion.toLocaleString("fr-FR")} %` },
    { label: "Abonnés", value: `+${formatNumber(week.followers[week.followers.length - 1] - week.followers[0])}` },
  ];
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

      {/* Profil créateur (Figma seller-owner-profile) */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-[#3ccfc0] to-[#1c2c48] md:h-32" aria-hidden />
        <div className="flex flex-col gap-4 px-4 pb-4 md:px-5 md:pb-5">
          <div className="flex flex-col gap-2">
            <span className="-mt-10 self-start rounded-full ring-4 ring-surface">
              <Avatar name={s.name} size="xl" verified={s.verified} />
            </span>
            <div className="min-w-0">
              <p className="truncate type-h4">{s.name}</p>
              <p className="inline-flex items-center gap-1 type-body-s text-fg-secondary">
                <Star className="size-3.5 fill-warning text-warning" /> {s.rating.toLocaleString("fr-FR")} <span className="text-fg-tertiary">({s.reviews} avis) · {s.area}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success" icon={<CircleCheck />}>
                Identité vérifiée
              </Badge>
              <Badge icon={<MapPin />}>{s.area}</Badge>
            </div>
          </div>
          <dl className="grid grid-cols-4 gap-2 text-center">
            {stats.map((st) => (
              <div key={st.label}>
                <dd className="type-h4 tabular-nums">{st.value}</dd>
                <dt className="type-caption text-fg-tertiary">{st.label}</dt>
              </div>
            ))}
          </dl>
          <div className="grid grid-cols-3 gap-2">
            <ButtonLink href="/vendeur/ouverture" variant="outline" size="sm">
              Modifier
            </ButtonLink>
            <AddContentButton variant="secondary" size="sm" />
            <ButtonLink href="/vendeur/produits/nouveau" variant="secondary" size="sm" icon={<PackagePlus className="size-4" />}>
              Produit
            </ButtonLink>
          </div>
          <ListRow icon={<ChartNoAxesColumn />} title="Performances et analytics" subtitle="Vues, clics, abonnés, revenus du contenu" href="/vendeur/contenus/performances" className="-mx-1 rounded-lg bg-surface-muted px-3" />
        </div>
      </Card>

      <section className="flex flex-col gap-2">
        <Overline>Actions rapides</Overline>
        <ul className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {quick.map((q) => (
            <li key={q.label}>
              <Link href={q.href} className="pressable flex h-full flex-col items-center gap-2 rounded-lg border border-line-subtle bg-surface p-3 text-center hover:bg-surface-muted">
                <span className="flex size-10 items-center justify-center rounded-md bg-accent-subtle text-fg-accent [&_svg]:size-5">{q.icon}</span>
                <span className="type-label-s">{q.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <Overline>Aperçu rapide (7 j)</Overline>
        <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {overview.map((o) => (
            <div key={o.label} className="rounded-lg border border-line-subtle bg-surface p-3">
              <dt className="type-body-s text-fg-secondary">{o.label}</dt>
              <dd className="type-h4 tabular-nums">{o.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <ButtonLink href="/acheteur/boutiques/jbl-store-kin" variant="outline" icon={<Eye className="size-4" />} className="md:self-start">
        Voir ma boutique comme un client
      </ButtonLink>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <div className="contents">
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
