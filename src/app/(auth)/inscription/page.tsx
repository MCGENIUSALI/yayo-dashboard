import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { tryGetConfig } from "@/lib/auth/config";
import { getSession } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function SignUpPage() {
  if ((await getSession()).state === "valid") redirect("/");
  return <SignUpForm googleEnabled={Boolean(tryGetConfig()?.googleEnabled)} />;
}
