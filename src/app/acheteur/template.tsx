/** Each buyer screen fades in with a short rise (no exit animation). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 animate-page-in flex-col">{children}</div>;
}
