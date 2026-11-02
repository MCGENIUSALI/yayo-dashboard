import { CourierTabBar } from "@/components/courier/tab-bar";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))]">{children}</div>
      <CourierTabBar />
    </>
  );
}
