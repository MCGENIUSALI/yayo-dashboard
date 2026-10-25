import type { Metadata } from "next";
import { one } from "@/app/(auth)/notices";
import { ResetForm } from "@/components/auth/reset-form";
import { TokenProblem } from "@/components/auth/token-problem";
import { ButtonLink } from "@/components/ui/button";
import { tryGetConfig } from "@/lib/auth/config";
import { tokenMessage } from "@/lib/auth/service";
import { inspectToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";

// The URL holds a secret: never send it as a referrer.
export const metadata: Metadata = { title: "Nouveau mot de passe", referrer: "no-referrer", robots: { index: false } };

export default async function ResetPage({ searchParams }: PageProps<"/reinitialiser">) {
  const token = one((await searchParams).token) ?? "";
  const state = tryGetConfig() ? await inspectToken(db, token, "reset_password") : ({ status: "invalid" } as const);
  if (state.status !== "valid")
    return (
      <TokenProblem status={state.status} message={tokenMessage(state.status)}>
        <ButtonLink href="/mot-de-passe-oublie">Demander un nouveau lien</ButtonLink>
      </TokenProblem>
    );
  return <ResetForm token={token} />;
}
