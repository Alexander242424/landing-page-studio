import { adminUsersPath } from "@/lib/admin/paths.server";
import { verifyPassword } from "@/lib/admin/password.server";

function isNodeRuntime(): boolean {
  return typeof process !== "undefined" && Boolean(process.versions?.node);
}

export type AdminUserRecord = {
  email: string;
  /** scrypt$salt$hash — never store plaintext */
  passwordHash: string;
  role: "superadmin";
};

/**
 * Seed super-admin (hashed). Password is the bootstrap credential;
 * only the hash lives here / in data/admin-users.json.
 */
const SEED_ADMIN: AdminUserRecord = {
  email: "alex@uxdrive.io",
  // Fallback hash — the real source of truth is the ADMIN_USERS_JSON secret.
  passwordHash:
    "scrypt$497aba5bea6c2833191445add769af4f$18cf578b8af7c96659072e5ba66d448793d9e62caae06acf239e030a01ad985dac646fd26a48a2dea1011416d3ba7a236ddf73213b9ecbce7bbfa64d58f5674b",
  role: "superadmin",
};

/**
 * Production source of truth: ADMIN_USERS_JSON secret — JSON array of
 * { email, passwordHash, role }. On Cloudflare Workers there is no durable
 * filesystem, so data/admin-users.json never exists on prod.
 */
function usersFromEnv(): AdminUserRecord[] | null {
  const raw = process.env["ADMIN_USERS_JSON"];
  if (!raw || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as AdminUserRecord[];
    }
  } catch (error) {
    console.error("[admin] ADMIN_USERS_JSON is not valid JSON", error);
  }
  return null;
}

async function ensureUsersFile(): Promise<AdminUserRecord[]> {
  const fromEnv = usersFromEnv();
  if (fromEnv) return fromEnv;

  // Cloudflare Workers (Lovable prod) have no durable filesystem.
  if (!isNodeRuntime()) {
    return [SEED_ADMIN];
  }

  const { mkdir, readFile, writeFile } = await import("node:fs/promises");
  const { dirname } = await import("node:path");
  const path = adminUsersPath();
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as AdminUserRecord[];
    }
  } catch {
    // missing / invalid — seed below
  }

  const users = [SEED_ADMIN];
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  return users;
}

export async function findAdminByEmail(
  email: string,
): Promise<AdminUserRecord | null> {
  const users = await ensureUsersFile();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<AdminUserRecord | null> {
  const user = await findAdminByEmail(email);
  if (!user) {
    verifyPassword(password, SEED_ADMIN.passwordHash);
    return null;
  }
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}
