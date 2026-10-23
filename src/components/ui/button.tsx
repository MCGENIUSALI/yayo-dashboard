import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const styles = {
  primary: "bg-brand text-fg-inverse hover:opacity-90",
  accent: "bg-accent text-fg-on-accent hover:bg-accent-pressed",
  secondary: "bg-surface-sunken text-fg hover:bg-line",
  outline: "border border-line-strong bg-surface text-fg hover:bg-surface-muted",
  ghost: "text-fg hover:bg-surface-sunken",
  tonal: "bg-accent-subtle text-fg-accent hover:bg-accent/20",
  danger: "bg-danger text-fg-on-accent hover:opacity-90",
} as const;

const sizes = {
  sm: "h-9 px-3 gap-1.5 rounded-md type-label-s",
  md: "h-11 px-4 gap-2 rounded-lg type-label-m",
  lg: "h-13 px-6 gap-2 rounded-lg type-label-l",
} as const;

export type ButtonVariant = keyof typeof styles;
export type ButtonSize = keyof typeof sizes;

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

export function buttonClass({ variant = "primary", size = "md", block }: BaseProps = {}) {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap transition-colors disabled:bg-disabled disabled:text-fg-disabled disabled:border-transparent",
    styles[variant],
    sizes[size],
    block && "w-full min-w-0 shrink",
  );
}

export function Button({ variant, size, icon, iconRight, block, className, children, ...props }: BaseProps & ComponentProps<"button">) {
  return (
    <button type="button" className={cn(buttonClass({ variant, size, block }), className)} {...props}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, iconRight, block, className, children, ...props }: BaseProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(buttonClass({ variant, size, block }), className)} {...props}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

export function IconButton({ label, variant = "secondary", className, children, ...props }: { label: string; variant?: "secondary" | "ghost" | "primary" } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-md transition-colors",
        variant === "secondary" && "bg-surface-sunken text-fg hover:bg-line",
        variant === "ghost" && "text-fg hover:bg-surface-sunken",
        variant === "primary" && "bg-brand text-fg-inverse",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
