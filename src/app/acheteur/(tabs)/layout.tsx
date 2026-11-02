import { TabBar } from "@/components/buyer/tab-bar";

/** Screens reachable from the bottom navigation. */
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))]">{children}</div>
      <TabBar />
    </>
  );
}
