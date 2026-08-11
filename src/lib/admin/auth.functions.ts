import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticateAdmin } from "@/lib/admin/users";
import {
  destroyAdminSession,
  readAdminSession,
  writeAdminSession,
} from "@/lib/admin/session";

const LoginInput = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
});

export const getAdminSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await readAdminSession();
    if (!session) return null;
    return { email: session.email, role: session.role };
  },
);

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LoginInput.parse(input))
  .handler(async ({ data }) => {
    const user = await authenticateAdmin(data.email, data.password);
    if (!user) {
      return { ok: false as const, error: "Invalid email or password" };
    }
    await writeAdminSession({ email: user.email, role: user.role });
    return { ok: true as const, email: user.email };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(
  async () => {
    await destroyAdminSession();
    return { ok: true as const };
  },
);

/** Throws if not authenticated — use from other admin server fns. */
export async function requireAdmin() {
  const session = await readAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
