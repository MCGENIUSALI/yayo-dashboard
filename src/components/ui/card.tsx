import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-lg border border-line-subtle bg-surface", className)} {...props} />;
}

export function CardHeader({ title, subtitle, action, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 px-4 pt-4 md:px-5 md:pt-5", className)}>
      <div className="min-w-0">
        <h2 className="type-h4">{title}</h2>
        {subtitle && <p className="mt-0.5 type-body-s text-fg-tertiary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Overline({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("type-overline text-fg-tertiary", className)}>{children}</p>;
}
