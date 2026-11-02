import { SavedGrid } from "@/components/buyer/saved-grid";
import { TopBar } from "@/components/buyer/top-bar";
import { getCatalog, getFeed } from "@/lib/api";
import { savedCollections, savedPosts } from "@/lib/data/buyer";

export const metadata = { title: "Enregistrés" };

/** SC6 · Mes enregistrements (US-23): saved, reposted and liked posts. */
export default async function SavedPage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const [feed, catalog, { onglet }] = await Promise.all([getFeed(), getCatalog(), searchParams]);
  const toTiles = (ids: string[]) =>
    ids.map((id, i) => {
      const post = feed.find((p) => p.id === id)!;
      const product = catalog.find((p) => p.id === post.productId)!;
      return { key: `${id}-${i}`, id, kind: post.kind, swatch: post.swatch, likes: post.likes, productId: product.id, name: product.name, category: product.category };
    });
  return (
    <>
      <TopBar title="Enregistrés" fallback="/acheteur/compte" />
      <SavedGrid initialTab={onglet === "aimes" ? "liked" : onglet === "republies" ? "reposted" : "saved"} tabs={{ saved: toTiles(savedPosts.saved), reposted: toTiles(savedPosts.reposted), liked: toTiles(savedPosts.liked) }} collections={savedCollections} />
    </>
  );
}
