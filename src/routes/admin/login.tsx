import { FormEvent, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { adminLogin } from "@/lib/admin/auth.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin login — UXLAB" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await adminLogin({ data: { email, password } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await navigate({ to: "/admin" });
    } catch {
      setError("Login failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6b7280]">
          UXLAB
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Admin sign in
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">Super-admin only.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm text-[#374151]">Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none ring-[#111827] focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-[#374151]">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none ring-[#111827] focus:ring-2"
            />
          </label>

          {error ? (
            <p className="text-sm text-[#b91c1c]" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#111827] px-3 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
