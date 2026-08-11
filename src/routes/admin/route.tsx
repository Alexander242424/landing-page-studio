import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getAdminSession } from "@/lib/admin/auth.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex,nofollow,noarchive,nosnippet" },
      { name: "googlebot", content: "noindex,nofollow,noarchive,nosnippet" },
    ],
  }),
  beforeLoad: async ({ location }) => {
    const isLogin = location.pathname === "/admin/login";
    const session = await getAdminSession();

    if (!session && !isLogin) {
      throw redirect({ to: "/admin/login" });
    }
    if (session && isLogin) {
      throw redirect({ to: "/admin" });
    }

    return { admin: session };
  },
  component: AdminShell,
});

function AdminShell() {
  return (
    <div className="theme-light rj-admin">
      <Outlet />
    </div>
  );
}
