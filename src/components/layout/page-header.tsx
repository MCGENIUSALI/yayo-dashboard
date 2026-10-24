import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Screen title. Mobile follows the app pattern (eyebrow above a large title);
 * from lg it becomes the back-office header with actions on the right.
 */
export function PageHeader({ title, eyebrow, description, actions, back, className }: { title: ReactNode; eyebrow?: ReactNode; description?: ReactNode; actions?: ReactNode; back?: string; className?: string }) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {back && (
          <Link href={back} aria-label="Retour" className="pressable flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken hover:bg-line">
            <ArrowLeft className="size-5" />
          </Link>
        )}
        <div className="min-w-0">
          {eyebrow && <p className="type-body-m text-fg-secondary">{eyebrow}</p>}
          <h1 className={cn("truncate", back ? "type-h3" : "type-h1")}>{title}</h1>
          {description && <p className="mt-0.5 type-body-m text-fg-secondary">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
