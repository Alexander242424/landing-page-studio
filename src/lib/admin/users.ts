import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { adminUsersPath } from "@/lib/admin/paths";
import { verifyPassword } from "@/lib/admin/password";

export type AdminUserRecord = {
  email: string;
  /** scrypt$salt$hash — never store plaintext */
  passwordHash: string;
  role: "superadmin";
};

/**
 * Seed super-admin (hashed). Password is the one provided for bootstrap;
 * only the hash ships in this server module — not written to a public file.
 */
const SEED_ADMIN: AdminUserRecord = {
  email: "alex@uxdrive.io",
  // Dev bootstrap hash only — rotate for production.
  passwordHash:
    "scrypt$a1b2c3d4e5f60718293a4b5c6d7e8f90$a9d64864af2d1a20dd05dcedfc79428bdd31e858fbf71ce8b14128e626ee5c1a345f27188b1a9c791b49fe3ee3aead7da30832fa57f7d4b90ff1023a8ff5ea9d",
  role: "superadmin",
};

async function ensureUsersFile(): Promise<AdminUserRecord[]> {
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
    // Cheap equalize timing a bit
    verifyPassword(password, SEED_ADMIN.passwordHash);
    return null;
  }
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}
