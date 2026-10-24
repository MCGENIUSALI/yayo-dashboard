/**
 * Re-mounted on every navigation inside the space (the layout and its menu
 * persist): the new screen fades in with a short rise. No exit animation, so
 * the next page is never delayed.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
