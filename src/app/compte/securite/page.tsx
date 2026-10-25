import type { Metadata } from "next";
import { errors, one } from "@/app/(auth)/notices";
import { FormAlert } from "@/components/auth/form-alert";
import { ChangePasswordForm, GoogleLink, SessionList, type SessionView } from "@/components/auth/security";
import { Card, CardHeader } from "@/components/ui/card";
import { tryGetConfig } from "@/lib/auth/config";
import { deviceLabel, formatDateTime } from "@/lib/auth/device";
import { requireUser } from "@/lib/auth/server";
import { getGoogleLink } from "@/lib/auth/service";
import { listActiveSessions } from "@/lib/auth/sessions";

export const metadata: Metadata = { title: "Sécurité" };

const linkErrors: Record<string, { title: string; body: string }> = {
  ...errors,
  google_deja_lie: { title: "Association impossible", body: "Ce compte Google est déjà associé à un autre compte YA YO!, ou ton compte a déjà un compte Google associé." },
  google_echec: { title: "L’association avec Google n’a pas abouti", body: "La réponse de Google n’a pas pu être vérifiée ou a expiré. Recommence." },
};

export default async function SecurityPage({ searchParams }: PageProps<"/compte/securite">) {
  const q = await searchParams;
  const { user, session } = await requireUser();
  const [sessions, google] = await Promise.all([listActiveSessions(user.id), getGoogleLink(user.id)]);
  const error = linkErrors[one(q.erreur) ?? ""];
  // Only display fields cross the client boundary: no token, no hash, no internal id.
  const views: SessionView[] = sessions.map((s) => ({
    publicId: s.publicId,
    device: deviceLabel(s.userAgent),
    mobile: /Mobile|Android|iPhone/.test(s.userAgent ?? ""),
    createdAt: formatDateTime(s.createdAt),
    lastSeenAt: formatDateTime(s.lastSeenAt),
    method: s.authMethod === "google" ? "Google" : "Mot de passe",
    persistent: s.persistent,
    current: s.publicId === session.publicId,
  }));
  return (
    <div className="flex flex-col gap-6">
      {one(q.message) === "google_lie" && (
        <FormAlert tone="success" title="Google associé">
          Tu peux maintenant te connecter avec ton compte Google.
        </FormAlert>
      )}
      {error && <FormAlert title={error.title}>{error.body}</FormAlert>}
      <Card>
        <CardHeader title="Mot de passe" subtitle={user.hasPassword ? "Le changer déconnecte tes autres appareils." : undefined} />
        <div className="p-4 md:p-5">
          <ChangePasswordForm email={user.email} hasPassword={user.hasPassword} />
        </div>
      </Card>
      <Card>
        <CardHeader title="Connexion avec Google" />
        <div className="p-4 md:p-5">
          <GoogleLink linked={google ? { email: google.email, linkedAt: formatDateTime(google.linkedAt) } : null} hasPassword={user.hasPassword} googleEnabled={Boolean(tryGetConfig()?.googleEnabled)} />
        </div>
      </Card>
      <Card>
        <CardHeader title="Sessions actives" subtitle="Les appareils connectés à ton compte. Déconnecte ceux que tu ne reconnais pas." />
        <div className="p-4 md:p-5">
          <SessionList sessions={views} />
        </div>
      </Card>
    </div>
  );
}
