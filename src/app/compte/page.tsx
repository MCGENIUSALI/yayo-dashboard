import { BadgeCheck, KeyRound, Mail, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { ProfileForm } from "@/components/auth/profile-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { ListRow } from "@/components/ui/misc";
import { roleLabels } from "@/lib/auth/display";
import { requireUser } from "@/lib/auth/server";
import { getGoogleLink } from "@/lib/auth/service";

export const metadata: Metadata = { title: "Mon compte" };

export default async function ProfilePage() {
  const { user } = await requireUser();
  const google = await getGoogleLink(user.id);
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Profil" subtitle="Les informations de ton compte YA YO!." />
        <div className="p-4 md:p-5">
          <ProfileForm name={user.name} />
        </div>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader title="Identifiants" />
        <div className="divide-y divide-line-subtle pt-2">
          <ListRow icon={<Mail />} title="Adresse e-mail" subtitle={user.email} trailing={user.emailVerified ? <Badge tone="success" icon={<BadgeCheck className="size-3.5" />}>Vérifiée</Badge> : <Badge tone="warning">À confirmer</Badge>} />
          <ListRow icon={<ShieldCheck />} title="Accès" subtitle={user.roles.map((r) => roleLabels[r]).join(" · ")} />
          <ListRow
            icon={<KeyRound />}
            title="Méthodes de connexion"
            subtitle={[user.hasPassword && "Mot de passe", google && "Google"].filter(Boolean).join(" · ") || "Aucune"}
            href="/compte/securite"
          />
        </div>
      </Card>
    </div>
  );
}
