import type { Metadata } from "next";
import { one } from "@/app/(auth)/notices";
import { VerifyEmail } from "@/components/auth/verify-email";
import { tryGetConfig } from "@/lib/auth/config";
import { tokenMessage } from "@/lib/auth/service";
import { inspectToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Confirmer mon adresse", referrer: "no-referrer", robots: { index: false } };

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verification-email">) {
  const token = one((await searchParams).token) ?? "";
  const state = tryGetConfig() ? await inspectToken(db, token, "verify_email") : ({ status: "invalid" } as const);
  return <VerifyEmail token={state.status === "valid" ? token : null} initial={state.status === "valid" ? { status: "valid" } : { status: state.status, message: tokenMessage(state.status) }} />;
}
