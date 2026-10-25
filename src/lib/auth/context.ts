/** Who is calling: passed explicitly to the auth services so they stay testable without Next request APIs. */
export interface RequestContext {
  /** Client IP when it comes from a trusted proxy (Vercel), otherwise null. */
  ip: string | null;
  userAgent: string | null;
}
