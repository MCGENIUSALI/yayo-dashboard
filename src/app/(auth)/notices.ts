/** Contextual banners on the sign-in screen, keyed by query parameter. No user data comes from the URL. */
export const errors: Record<string, { title: string; body: string; tone?: "danger" | "warning" }> = {
  google_refus: { title: "Connexion Google annulée", body: "Tu as refusé l’accès sur Google. Tu peux réessayer ou te connecter avec ton adresse e-mail.", tone: "warning" },
  google_echec: { title: "La connexion avec Google n’a pas abouti", body: "La réponse de Google n’a pas pu être vérifiée ou a expiré. Recommence depuis cette page." },
  google_non_verifie: { title: "Adresse Google non vérifiée", body: "Ton adresse n’est pas vérifiée chez Google. Vérifie-la sur ton compte Google ou inscris-toi avec ton e-mail." },
  google_compte_existant: {
    title: "Un compte existe déjà avec cette adresse",
    body: "Connecte-toi avec ton mot de passe (ou « Mot de passe oublié »), puis associe Google depuis Mon compte › Sécurité. Nous ne relions jamais deux comptes sans ta confirmation.",
    tone: "warning",
  },
  compte_suspendu: { title: "Compte suspendu", body: "Ce compte est suspendu. Contacte le support YA YO! pour en savoir plus." },
  trop_de_tentatives: { title: "Trop de tentatives", body: "Patiente quelques minutes avant de réessayer." },
  indisponible: { title: "Connexion indisponible", body: "Le service de connexion ne répond pas pour le moment. Réessaie dans quelques minutes." },
};

export const reasons: Record<string, { title: string; body: string }> = {
  expiree: { title: "Ta session a expiré", body: "Pour protéger ton compte, reconnecte-toi. Tu reviendras sur la page que tu consultais." },
};

export const messages: Record<string, { title: string; body: string }> = {
  mot_de_passe_modifie: { title: "Mot de passe modifié", body: "Connecte-toi avec ton nouveau mot de passe. Tous tes appareils ont été déconnectés." },
  email_verifie: { title: "Adresse confirmée", body: "Ton compte est actif, tu peux te connecter." },
};

export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
