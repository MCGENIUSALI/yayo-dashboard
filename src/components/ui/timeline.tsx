import { Check, Clock, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StepState = "done" | "current" | "upcoming";

/** Vertical stepper (DS "Order Timeline": Done / Current / Upcoming). */
export function Timeline({ steps }: { steps: { title: string; detail?: ReactNode; state: StepState; icon?: ReactNode }[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex gap-3 pb-5 last:pb-0">
          {i < steps.length - 1 && (
            <span aria-hidden className={cn("absolute top-7 bottom-0 left-[13px] w-0.5", s.state === "done" ? "bg-success" : "bg-line")} />
          )}
          <span
            className={cn(
              "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
              s.state === "done" && "bg-success text-white",
              s.state === "current" && "bg-accent text-white",
              s.state === "upcoming" && "bg-surface-sunken text-fg-tertiary",
            )}
          >
            {s.icon ?? (s.state === "done" ? <Check /> : s.state === "current" ? <Truck /> : <Clock />)}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className={cn("type-label-m", s.state === "upcoming" && "text-fg-tertiary")}>{s.title}</p>
            {s.detail && <p className="type-body-s text-fg-tertiary">{s.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
