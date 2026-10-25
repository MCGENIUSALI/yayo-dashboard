import { Link2Off } from "lucide-react";
import type { ReactNode } from "react";

const titles = { expired: "Lien expiré", used: "Lien déjà utilisé", invalid: "Lien invalide" } as const;

/** Shared state for an e-mailed link that can no longer be used. */
export function TokenProblem({ status, message, children }: { status: keyof typeof titles; message: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-5" role="alert">
      <span className="flex size-14 items-center justify-center rounded-full bg-warning-subtle text-fg-warning">
        <Link2Off className="size-7" />
      </span>
      <div>
        <h1 className="type-h2">{titles[status]}</h1>
        <p className="mt-2 type-body-l text-fg-secondary">{message}</p>
      </div>
      {children}
    </div>
  );
}
