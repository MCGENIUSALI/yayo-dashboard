import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SessionSync } from "@/components/auth/session-sync";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { requireUser } from "@/lib/auth/server";
import { AccountTabs } from "@/components/auth/account-tabs";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  const home = user.roles.length > 1 ? "/" : user.roles.includes("admin") ? "/admin" : "/vendeur";
  return (
    <div className="min-h-dvh bg-canvas">
      <SessionSync />
      <header className="sticky top-0 z-30 border-b border-line-subtle bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-2 px-4 md:px-6">
          <Link href={home} className="pressable -ml-2 flex h-10 items-center gap-2 rounded-md px-2 type-label-m hover:bg-surface-sunken">
            <ArrowLeft className="size-5" />
            <span className="hidden sm:inline">Retour à mon espace</span>
            <span className="sr-only sm:hidden">Retour à mon espace</span>
          </Link>
          <Logo size="sm" className="mx-auto sm:mx-0 sm:ml-2" />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pt-6 pb-12 md:px-6 md:pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="type-body-m text-fg-secondary">Mon compte</p>
            <h1 className="truncate type-h1">{user.name}</h1>
          </div>
          <SignOutButton />
        </div>
        <AccountTabs />
        <div className="animate-page-in">{children}</div>
      </main>
    </div>
  );
}
