import type { Metadata } from "next";
import { one } from "@/app/(auth)/notices";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default async function ForgotPage({ searchParams }: PageProps<"/mot-de-passe-oublie">) {
  const email = one((await searchParams).email)?.slice(0, 254) ?? "";
  return <ForgotForm initialEmail={email} />;
}
