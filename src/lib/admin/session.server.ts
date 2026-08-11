import {
  clearSession,
  updateSession,
  useSession,
} from "@tanstack/react-start/server";

export type AdminSessionData = {
  email: string;
  role: "superadmin";
};

const DEV_SECRET = "uxlab-admin-dev-session-secret-change-me!!";

function sessionPassword() {
  const fromEnv = process.env["ADMIN_SESSION_SECRET"]?.trim();
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  if (process.env["NODE_ENV"] === "production" && !fromEnv) {
    console.warn(
      "[admin] ADMIN_SESSION_SECRET missing or <32 chars; using insecure dev default",
    );
  }
  return DEV_SECRET;
}

export function adminSessionConfig() {
  return {
    name: "uxlab_admin_session",
    password: sessionPassword(),
    maxAge: 60 * 60 * 24 * 7, // 7 days
    cookie: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env["NODE_ENV"] === "production",
      path: "/",
    },
  };
}

export async function readAdminSession(): Promise<AdminSessionData | null> {
  const session = await useSession<AdminSessionData>(adminSessionConfig());
  const email = session.data?.email;
  const role = session.data?.role;
  if (!email || role !== "superadmin") return null;
  return { email, role };
}

export async function writeAdminSession(data: AdminSessionData) {
  await updateSession(adminSessionConfig(), data);
}

export async function destroyAdminSession() {
  await clearSession(adminSessionConfig());
}

/** Throws if not authenticated — use from other admin server fns. */
export async function requireAdmin() {
  const session = await readAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
