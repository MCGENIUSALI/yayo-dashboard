/**
 * Post-authentication destination. Only same-origin paths inside the app are
 * accepted: absolute URLs, protocol-relative "//host", backslash tricks and
 * auth screens themselves fall back to "/" (no open redirect, no loop).
 */
const ALLOWED = ["/vendeur", "/admin", "/compte"];

export function safeNext(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  // Control characters (tab, newline) are stripped by URL parsers and can turn "/\t/evil" into "//evil".
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  let url: URL;
  try {
    url = new URL(value, "https://yayo.invalid");
  } catch {
    return fallback;
  }
  if (url.origin !== "https://yayo.invalid") return fallback;
  const path = url.pathname;
  if (path === "/" || ALLOWED.some((p) => path === p || path.startsWith(`${p}/`))) return `${path}${url.search}${url.hash}`;
  return fallback;
}
