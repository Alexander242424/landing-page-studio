import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getAdminSession } from "@/lib/admin/auth.functions";

export const Route = createFileRoute("/admin")({
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
    <div className="min-h-screen bg-[#f4f5f7] text-[#111827] antialiased">
      <Outlet />
    </div>
  );
}
