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
  // Dev bootstrap hash only — rotate for production.
  passwordHash:
    "scrypt$a1b2c3d4e5f60718293a4b5c6d7e8f90$20e3d9b6de3cc0984a4c880efe6fae03066ba97badd19dd13f563d2c026dfc3426b31ea856b5e82fd7c4665ae575b135337a9c9ad10f35a20fc99226edeebdfb",
  role: "superadmin",
};

async function ensureUsersFile(): Promise<AdminUserRecord[]> {
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
