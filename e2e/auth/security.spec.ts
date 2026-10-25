import { expect, test } from "@playwright/test";
import { SELLER, STAFF } from "../env";
import { createAccount, onPath, signIn, sql, uniqueEmail } from "./util";

const PW = "une phrase solide 2026";

test("private pages redirect to sign-in and keep the destination", async ({ page }) => {
  for (const path of ["/vendeur", "/admin/sequestre", "/compte/securite", "/"]) {
    await page.goto(path);
    await onPath(page, "/connexion");
    if (path !== "/") expect(new URL(page.url()).searchParams.get("suite")).toBe(path);
  }
});

test("a forged cookie is rejected server-side", async ({ page, context }) => {
  await context.addCookies([{ name: "yayo_session", value: "A".repeat(43), url: "http://localhost:3100" }]);
  await page.goto("/admin");
  await onPath(page, "/connexion");
  await expect(page.getByText("Ta session a expiré")).toBeVisible();
});

test("the API answers 401 without a session and returns only allowed fields with one", async ({ page }) => {
  const anon = await page.request.get("/api/me");
  expect(anon.status()).toBe(401);
  expect(await anon.json()).toEqual({ error: "unauthenticated" });

  await signIn(page, SELLER.email, SELLER.password, { next: "/compte" });
  await onPath(page, "/compte");
  const me = await page.request.get("/api/me");
  expect(me.status()).toBe(200);
  expect(me.headers()["cache-control"]).toContain("no-store");
  const body = await me.json();
  expect(Object.keys(body).sort()).toEqual(["email", "emailVerified", "id", "name", "roles"]);
  expect(JSON.stringify(body)).not.toMatch(/argon2|password|token|hash/i);
});

test("roles are enforced on the server: a seller cannot open the admin space", async ({ page }) => {
  await signIn(page, SELLER.email, SELLER.password);
  await onPath(page, "/vendeur");
  await page.goto("/admin/sequestre");
  await onPath(page, "/acces-refuse");
  await expect(page.getByRole("heading", { name: "Accès refusé" })).toBeVisible();
  // No admin data in the response, whatever the client does (order and buyer names of the escrow screen).
  const html = await (await page.request.get("/admin/sequestre", { maxRedirects: 0 })).text();
  expect(html).toContain("NEXT_REDIRECT;replace;/acces-refuse");
  for (const secret of ["YY-24", "Grâce Mbuyi", "Junior Kabeya"]) expect(html).not.toContain(secret);
});

test("session cookie is HttpOnly, SameSite=Lax, a browser-session cookie by default and persistent with « Se souvenir de moi »", async ({ page, browser }) => {
  await signIn(page, SELLER.email, SELLER.password);
  await onPath(page, "/vendeur");
  const c = (await page.context().cookies()).find((x) => x.name === "yayo_session")!;
  expect(c).toMatchObject({ httpOnly: true, sameSite: "Lax", path: "/", expires: -1 });
  expect(await page.evaluate(() => document.cookie)).not.toContain("yayo_session");

  const ctx2 = await browser.newContext();
  const p2 = await ctx2.newPage();
  await signIn(p2, SELLER.email, SELLER.password, { remember: true });
  await onPath(p2, "/vendeur");
  const persistent = (await ctx2.cookies()).find((x) => x.name === "yayo_session")!;
  const days = (persistent.expires * 1000 - Date.now()) / 86_400_000;
  expect(days).toBeGreaterThan(29);
  expect(days).toBeLessThanOrEqual(30);
  await ctx2.close();
});

test("admin sessions ignore « Se souvenir de moi »", async ({ page }) => {
  await signIn(page, STAFF.email, STAFF.password, { remember: true });
  await onPath(page, "/");
  expect((await page.context().cookies()).find((x) => x.name === "yayo_session")?.expires).toBe(-1);
});

test("open redirects are neutralised after sign-in", async ({ page }) => {
  await signIn(page, SELLER.email, SELLER.password, { next: "https://evil.example/phish" });
  await onPath(page, "/vendeur");
  expect(new URL(page.url()).host).toBe("localhost:3100");
});

test("a sign-in replayed from another origin is refused (CSRF)", async ({ page }) => {
  // Capture the real Server Action request the form sends, without letting it through.
  await page.goto("/connexion");
  let captured: { url: string; headers: Record<string, string>; body: string } | undefined;
  await page.route("**/connexion**", async (route) => {
    const r = route.request();
    if (r.method() !== "POST") return route.continue();
    captured = { url: r.url(), headers: await r.allHeaders(), body: r.postData() ?? "" };
    return route.abort();
  });
  await page.getByLabel("Adresse e-mail").fill(SELLER.email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(SELLER.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect.poll(() => Boolean(captured)).toBe(true);
  const { url, headers, body } = captured!;
  const pick = (h: Record<string, string>) => Object.fromEntries(Object.entries(h).filter(([k]) => !k.startsWith(":") && !["host", "content-length", "cookie"].includes(k)));

  const forged = await page.request.post(url, { headers: { ...pick(headers), origin: "https://evil.example" }, data: body, maxRedirects: 0 });
  expect(forged.headers()["set-cookie"] ?? "").not.toContain("yayo_session=");

  // Control: the same request from the right origin does sign in.
  const legit = await page.request.post(url, { headers: pick(headers), data: body, maxRedirects: 0 });
  expect(legit.headers()["set-cookie"] ?? "").toContain("yayo_session=");
});

test("repeated failures are rate-limited with a clear, temporary message", async ({ page }) => {
  const email = uniqueEmail("brute");
  await createAccount({ email, password: PW });
  await page.goto("/connexion");
  for (let i = 0; i < 8; i++) {
    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(`mauvais-${i}-xxxxxx`);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText("incorrect");
  }
  await page.getByLabel("Mot de passe", { exact: true }).fill(PW);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toContainText(/Trop de tentatives\. Réessaie dans \d+ minutes?\./);
  expect((await page.context().cookies()).find((x) => x.name === "yayo_session")).toBeUndefined();
});

test("double-clicking « Se connecter » sends a single request and opens a single session", async ({ page }) => {
  const email = uniqueEmail("double");
  const id = await createAccount({ email, password: PW });
  await page.goto("/connexion");
  let posts = 0;
  page.on("request", (r) => r.method() === "POST" && r.url().includes("/connexion") && posts++);
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(PW);
  const button = page.getByRole("button", { name: "Se connecter" });
  await button.dblclick();
  await button.click({ force: true }).catch(() => {});
  await onPath(page, "/vendeur");
  expect(posts).toBe(1);
  expect(await sql("SELECT 1 FROM sessions WHERE user_id = $1", [id])).toHaveLength(1);
});

test("sessions screen: revoking another device signs it out; a user only sees their own sessions", async ({ page, browser }) => {
  const email = uniqueEmail("devices");
  await createAccount({ email, password: PW });
  const phone = await browser.newContext({ userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36" });
  const phonePage = await phone.newPage();
  await signIn(phonePage, email, PW);
  await onPath(phonePage, "/vendeur");

  await signIn(page, email, PW, { next: "/compte/securite" });
  await onPath(page, "/compte/securite");
  const list = page.getByRole("list", { name: "Sessions actives" });
  await expect(list.getByRole("listitem")).toHaveCount(2);
  await expect(list).toContainText("Chrome sur Android");
  await expect(list).toContainText("Cet appareil");
  await list.getByRole("button", { name: "Déconnecter Chrome sur Android" }).click();
  await expect(list.getByRole("listitem")).toHaveCount(1);

  await phonePage.reload();
  await onPath(phonePage, "/connexion");
  await phone.close();
});

test("« Se déconnecter de tous les appareils » closes every session", async ({ page, browser }) => {
  const email = uniqueEmail("everywhere");
  const id = await createAccount({ email, password: PW });
  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await signIn(otherPage, email, PW);
  await onPath(otherPage, "/vendeur");
  await signIn(page, email, PW, { next: "/compte/securite" });
  await onPath(page, "/compte/securite");
  await page.getByRole("button", { name: "Se déconnecter de tous les appareils" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Tout déconnecter" }).click();
  await onPath(page, "/deconnexion");
  await expect(page.getByText("Toutes tes sessions ont été fermées")).toBeVisible();
  expect(await sql("SELECT 1 FROM sessions WHERE user_id = $1 AND revoked_at IS NULL", [id])).toHaveLength(0);
  await otherPage.reload();
  await onPath(otherPage, "/connexion");
  await other.close();
});

test("changing the password keeps this device signed in and signs the others out", async ({ page, browser }) => {
  const email = uniqueEmail("change");
  await createAccount({ email, password: PW });
  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await signIn(otherPage, email, PW);
  await onPath(otherPage, "/vendeur");
  await signIn(page, email, PW, { next: "/compte/securite" });
  await onPath(page, "/compte/securite");
  await page.getByLabel("Mot de passe actuel").fill(PW);
  await page.getByLabel("Nouveau mot de passe").fill("toute nouvelle phrase");
  await page.getByRole("button", { name: "Modifier le mot de passe" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Mot de passe modifié" })).toBeVisible();
  await page.reload();
  await onPath(page, "/compte/securite");
  await otherPage.reload();
  await onPath(otherPage, "/connexion");
  await other.close();
});

test("security headers are set", async ({ page }) => {
  const res = await page.goto("/connexion");
  const h = res!.headers();
  expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["x-powered-by"]).toBeUndefined();
});

test.describe("Google", () => {
  test("starts a real OIDC request (state, nonce, PKCE) and handles a refused consent", async ({ page }) => {
    let authUrl: URL | undefined;
    await page.route("https://accounts.google.com/**", (route) => {
      authUrl = new URL(route.request().url());
      return route.fulfill({ status: 200, contentType: "text/html", body: "<p>Google (intercepté)</p>" });
    });
    await page.goto("/connexion?suite=/vendeur/revenus");
    await page.getByRole("button", { name: "Continuer avec Google" }).click();
    await expect.poll(() => authUrl?.pathname).toBe("/o/oauth2/v2/auth");
    const q = authUrl!.searchParams;
    expect(q.get("client_id")).toBe("e2e-client.apps.googleusercontent.com");
    expect(q.get("redirect_uri")).toBe("http://localhost:3100/auth/google/callback");
    expect(q.get("code_challenge_method")).toBe("S256");
    expect(q.get("scope")).toBe("openid email profile");
    for (const k of ["state", "nonce", "code_challenge"]) expect(q.get(k)).toMatch(/^[A-Za-z0-9_-]{43}$/);
    // The state cookie is HttpOnly and short-lived.
    const oauth = (await page.context().cookies()).find((c) => c.name === "yayo_oauth")!;
    expect(oauth.httpOnly).toBe(true);

    await page.goto(`/auth/google/callback?state=${q.get("state")}&error=access_denied`);
    await onPath(page, "/connexion");
    await expect(page.getByText("Connexion Google annulée")).toBeVisible();
    // The state cookie is consumed by the callback: it cannot be replayed.
    expect((await page.context().cookies()).find((c) => c.name === "yayo_oauth")).toBeUndefined();
  });

  test("a callback with a forged state is rejected without contacting Google", async ({ page }) => {
    await page.route("https://accounts.google.com/**", (route) => route.fulfill({ status: 200, body: "ok" }));
    await page.goto("/connexion");
    await page.getByRole("button", { name: "Continuer avec Google" }).click();
    await expect.poll(async () => (await page.context().cookies()).some((c) => c.name === "yayo_oauth")).toBe(true);
    await page.goto("/auth/google/callback?state=forged&code=attacker-code");
    await onPath(page, "/connexion");
    await expect(page.getByText("La connexion avec Google n’a pas abouti")).toBeVisible();
    expect((await page.context().cookies()).find((c) => c.name === "yayo_session")).toBeUndefined();
  });

  test("a callback without any prior request (login CSRF) is rejected", async ({ page }) => {
    await page.goto("/auth/google/callback?state=x&code=y");
    await onPath(page, "/connexion");
    await expect(page.getByText("La connexion avec Google n’a pas abouti")).toBeVisible();
  });
});
