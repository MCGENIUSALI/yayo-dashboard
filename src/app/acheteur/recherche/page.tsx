import { SearchPanel } from "@/components/buyer/search-panel";
import { recentSearches, searchSuggestions } from "@/lib/data/buyer";

export const metadata = { title: "Rechercher" };

/** E4 · Recherche en cours: recent searches and suggestions while typing. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <SearchPanel initial={q ?? ""} recents={recentSearches} suggestions={searchSuggestions} />;
}
