"use client";

import { LogOut } from "lucide-react";
import { useState, type ReactNode } from "react";
import { RailAction } from "@/components/layout/sidebar-nav";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";

/** Ends the session on the server (revocation + cookie removal), then shows the sign-out confirmation. */
export function SignOutButton({ variant = "outline", className, children = "Se déconnecter" }: { variant?: ButtonVariant; className?: string; children?: ReactNode }) {
  const [pending, setPending] = useState(false);
  return (
    <Button
      variant={variant}
      icon={<LogOut className="size-4.5" />}
      loading={pending}
      className={className}
      onClick={async () => {
        setPending(true);
        try {
          await signOutAction();
        } catch {
          setPending(false);
        }
      }}
    >
      {children}
    </Button>
  );
}

/** Side menu variant (same look and tooltip as the other rail actions). */
export function SignOutRailAction() {
  const [pending, setPending] = useState(false);
  return (
    <RailAction
      label={pending ? "Déconnexion…" : "Se déconnecter"}
      icon={<LogOut />}
      onClick={async () => {
        if (pending) return;
        setPending(true);
        try {
          await signOutAction();
        } catch {
          setPending(false);
        }
      }}
    />
  );
}
