import {
  Bell,
  ChartNoAxesColumn,
  Clapperboard,
  LayoutGrid,
  MessagesSquare,
  Package,
  Scale,
  Settings,
  ShieldCheck,
  Store,
  Tag,
  UserCheck,
  Users,
  Wallet,
  Bike,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  badge?: number;
  /** Also active on these path prefixes. */
  match?: string[];
  mobile?: boolean;
}

export const sellerNav: NavItem[] = [
  { href: "/vendeur", label: "Tableau de bord", short: "Tableau", icon: ChartNoAxesColumn, mobile: true },
  { href: "/vendeur/commandes", label: "Commandes", icon: Package, badge: 2, mobile: true },
  { href: "/vendeur/produits", label: "Produits", icon: Tag, mobile: true, match: ["/vendeur/contenus"] },
  { href: "/vendeur/contenus", label: "Contenus", icon: Clapperboard },
  { href: "/vendeur/revenus", label: "Revenus", icon: Wallet, mobile: true },
  { href: "/vendeur/boutique", label: "Boutique", icon: Store, mobile: true },
  { href: "/vendeur/notifications", label: "Notifications", icon: Bell, badge: 3 },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutGrid },
  { href: "/admin/commandes", label: "Commandes", icon: Package },
  { href: "/admin/sequestre", label: "Paiements et séquestre", icon: ShieldCheck },
  { href: "/admin/litiges", label: "Litiges", icon: Scale, badge: 3 },
  { href: "/admin/kyc", label: "Validations KYC", icon: UserCheck, badge: 7 },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/livreurs", label: "Livreurs", icon: Bike },
  { href: "/admin/moderation", label: "Modération sociale", icon: MessagesSquare, badge: 3 },
  { href: "/admin/commissions", label: "Commissions et frais", icon: Settings },
  { href: "/admin/rapports", label: "Rapports", icon: ChartNoAxesColumn },
];

export function isActive(pathname: string, item: NavItem, root: string, withAliases = false) {
  if (item.href === root) return pathname === root;
  return [item.href, ...(withAliases ? (item.match ?? []) : [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
