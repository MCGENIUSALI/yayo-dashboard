import { Bookmark, Eye, Heart, MousePointerClick, Share2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { CommentModeration } from "@/components/seller/comment-moderation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { PostTile, ProductThumb } from "@/components/ui/media";
import { Price } from "@/components/ui/price";
import { getComments, getPost, getProducts } from "@/lib/api";
import { formatCompact, formatNumber } from "@/lib/format";

export const metadata = { title: "Statistiques de la publication" };

export default async function PostStatsPage({ params }: PageProps<"/vendeur/contenus/[id]">) {
  const { id } = await params;
  const [post, comments, products] = await Promise.all([getPost(id), getComments(id), getProducts()]);
  if (!post) notFound();
  const linked = products.filter((p) => post.productIds.includes(p.id));
  const s = post.stats;
  const conversion = s.clicks ? ((s.sales / s.clicks) * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) : "0";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/vendeur/contenus" title="Statistiques" />

      <Card className="flex gap-3 p-3">
        <PostTile swatch={post.cover} caption={post.caption} kind={post.kind} views={s.views} className="w-20 shrink-0" />
        <div className="min-w-0 py-1">
          <p className="line-clamp-2 type-label-l">{post.caption}</p>
          <p className="type-body-s text-fg-tertiary">
            {post.state === "published" ? `Publiée le ${post.publishedAt}` : "Brouillon"} · {post.kind === "video" ? `Vidéo ${post.duration}` : "Photos"}
          </p>
          <Badge tone={post.state === "published" ? "success" : "neutral"} className="mt-1.5">
            {post.state === "published" ? "En ligne" : "Brouillon"}
          </Badge>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <section aria-label="Statistiques" className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <KpiCard icon={<Eye />} label="Vues" value={formatNumber(s.views)} />
            <KpiCard icon={<Heart />} label="J’aime" value={formatNumber(s.likes)} />
            <KpiCard icon={<MousePointerClick />} label="Clics produit" value={formatNumber(s.clicks)} trendLabel={`${conversion} % convertis`} trend="up" />
            <KpiCard icon={<ShoppingBag />} label="Ventes générées" value={`${s.sales} · ${formatCompact(s.revenue)} FC`} />
            <KpiCard icon={<Share2 />} label="Partages" value={formatNumber(s.shares)} />
            <KpiCard icon={<Bookmark />} label="Enregistrements" value={formatNumber(s.saves)} />
          </section>

          {linked.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="type-h4">Produits liés</h2>
              <ul className="grid gap-2 md:grid-cols-2">
                {linked.map((p) => (
                  <li key={p.id}>
                    <Link href={`/vendeur/produits/${p.id}`} className="flex items-center gap-3 rounded-lg border border-line-subtle bg-surface p-3 hover:bg-surface-muted">
                      <ProductThumb swatch={p.image} name={p.name} className="size-12" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate type-label-m">{p.name}</span>
                        <Price amount={p.price} size="s" inline />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <CommentModeration initial={comments} />
      </div>
    </div>
  );
}
