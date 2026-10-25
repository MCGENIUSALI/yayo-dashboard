import path from "node:path";

export const ADMIN_DATABASE_URL = process.env.TEST_DATABASE_ADMIN_URL ?? "postgres://postgres:postgres@localhost:5432/postgres";
export const E2E_DATABASE_URL = (() => {
  const u = new URL(ADMIN_DATABASE_URL);
  u.pathname = "/yayo_e2e";
  return u.toString();
})();
export const MAIL_DIR = path.resolve(".mail-e2e");
export const STAFF_STATE = path.resolve("test-results/.auth/staff.json");

/** Seeded accounts (test data only). */
export const STAFF = { email: "staff@yayo.test", password: "staff phrase de passe", name: "Admin YA YO" };
export const SELLER = { email: "seller@yayo.test", password: "seller phrase de passe", name: "Grâce Mbala" };
