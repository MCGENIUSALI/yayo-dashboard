import { BadgeCheck, Package, ShieldCheck, Tag, Truck, Wallet } from "lucide-react";
import Link from "next/link";
import { ScreenHeader } from "@/components/buyer/ui";
import { getBuyerNotifications } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { BuyerNotification } from "@/lib/types";

export const metadata = { title: "Notifications" };

const icons: Record<BuyerNotification["kind"], React.ReactNode> = {
  delivery: <Truck />,
  escrow: <ShieldCheck />,
  delivered: <Package />,
  refund: <Wallet />,
  promo: <Tag />,
};

/** D6 · Notifications (US-06). */
export default async function NotificationsPage() {
  const items = await getBuyerNotifications();
  const unread = items.filter((n) => n.unread).length;
  return (
    <>
      <ScreenHeader overline={unread ? `${unread} non lues` : "Tout est lu"} title="Notifications" />
      <ul className="flex flex-col bg-surface">
        {items.map((n) => {
          const body = (
            <>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-surface [&_svg]:size-5">{icons[n.kind]}</span>
              <span className="min-w-0 flex-1">
                <span className="block type-label-l">{n.title}</span>
                <span className="block type-body-m text-fg-secondary">{n.body}</span>
                <span className="mt-0.5 block type-body-s text-fg-tertiary">{n.ago}</span>
              </span>
              {n.unread && <span aria-label="Non lue" className="mt-2 size-2 shrink-0 rounded-full bg-accent" />}
            </>
          );
          const cls = cn("flex gap-4 px-6 py-4", n.unread && "bg-accent-subtle");
          return (
            <li key={n.id}>
              {n.href ? (
                <Link href={n.href} className={cn(cls, "hover:bg-surface-muted")}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="flex items-center justify-center gap-2 px-6 py-6 type-body-s text-fg-tertiary">
        <BadgeCheck className="size-4" /> Les notifications de paiement viennent toujours de YA YO.
      </p>
    </>
  );
}
