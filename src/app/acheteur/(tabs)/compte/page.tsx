import { Bike, Bookmark, CircleHelp, Globe, Heart, MapPin, Pencil, Store, Wallet } from "lucide-react";
import Link from "next/link";
import { ScreenHeader } from "@/components/buyer/ui";
import { LogoutRow } from "@/components/buyer/logout-row";
import { Avatar } from "@/components/ui/avatar";
import { ListRow } from "@/components/ui/misc";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getBuyer } from "@/lib/api";
import { addresses } from "@/lib/data/buyer";

export const metadata = { title: "Mon compte" };

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="px-1 pb-2 type-overline text-fg-tertiary">{title}</h2>
      <div className="divide-y divide-line-subtle overflow-hidden rounded-xl bg-surface">{children}</div>
    </section>
  );
}

const value = (v: string) => <span className="type-label-m text-fg-secondary">{v}</span>;

/** D7 · Profil (US-09) + entries to become a seller (V1) or a courier (L1). */
export default async function AccountPage() {
  const me = await getBuyer();
  return (
    <>
      <ScreenHeader overline="Acheteur" title="Mon compte" />
      <div className="flex flex-col gap-5 p-5">
        <section className="flex items-center gap-4 rounded-xl bg-surface p-4">
          <Avatar name={me.name} size="xl" />
          <div className="min-w-0 flex-1">
            <p className="type-h4">{me.name}</p>
            <p className="truncate type-body-s text-fg-tertiary">
              {me.phone} · {me.commune}, {me.city}
            </p>
          </div>
          <Link href="/acheteur/inscription" aria-label="Modifier mon profil" className="pressable flex size-10 items-center justify-center rounded-md hover:bg-surface-sunken">
            <Pencil className="size-5" />
          </Link>
        </section>
        <Group title="Mes achats">
          <ListRow icon={<MapPin />} title="Adresses de livraison" href="/acheteur/commander/livraison" trailing={value(String(addresses.length))} />
          <ListRow icon={<Wallet />} title="Moyens de paiement" trailing={value(me.wallet)} />
          <ListRow icon={<Heart />} title="Favoris" href="/acheteur/compte/enregistrements?onglet=aimes" trailing={value(String(me.favorites))} />
          <ListRow icon={<Bookmark />} title="Mes enregistrements" href="/acheteur/compte/enregistrements" />
        </Group>
        <Group title="Gagner avec YA YO">
          <ListRow icon={<Store />} title="Ouvrir ma boutique" subtitle="Vérification boutique requise" href="/vendeur/ouverture" />
          <ListRow icon={<Bike />} title="Devenir livreur" subtitle="KYC + validation admin" href="/livreur/inscription" />
        </Group>
        <Group title="Aide et compte">
          <ListRow icon={<CircleHelp />} title="Centre d’aide et litiges" href="/acheteur/commandes" />
          <ListRow icon={<Globe />} title="Langue" trailing={value("Français")} />
          <div className="flex items-center justify-between px-4 py-3">
            <span className="type-label-l">Thème</span>
            <ThemeToggle />
          </div>
          <LogoutRow />
        </Group>
      </div>
    </>
  );
}
