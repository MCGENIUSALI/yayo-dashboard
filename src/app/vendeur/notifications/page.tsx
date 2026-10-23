import { Bike, MessageCircle, Package, Scale, ShoppingBag, Wallet } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { getSellerNotifications } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { Notification } from "@/lib/types";

export const metadata = { title: "Notifications" };

const icons: Record<Notification["kind"], React.ReactNode> = {
  order: <ShoppingBag />,
  courier: <Bike />,
  stock: <Package />,
  payout: <Wallet />,
  dispute: <Scale />,
  comment: <MessageCircle />,
};

export default async function NotificationsPage() {
  const list = await getSellerNotifications();
  const unread = list.filter((n) => n.unread).length;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <PageHeader eyebrow={`${unread} non lues`} title="Notifications" />
      <ul className="overflow-hidden rounded-lg border border-line-subtle bg-surface">
        {list.map((n) => {
          const body = (
            <>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface [&_svg]:size-4.5">{icons[n.kind]}</span>
              <span className="min-w-0 flex-1">
                <span className="block type-label-m">{n.title}</span>
                <span className="block type-body-s text-fg-secondary">{n.body}</span>
                <span className="block type-caption text-fg-tertiary">{n.ago}</span>
              </span>
              {n.unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-label="Non lue" />}
            </>
          );
          const cls = cn("flex gap-3 px-4 py-4 transition-colors", n.unread ? "bg-accent-subtle" : "hover:bg-surface-muted");
          return (
            <li key={n.id} className="border-b border-line-subtle last:border-0">
              {n.href ? (
                <Link href={n.href} className={cls}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
