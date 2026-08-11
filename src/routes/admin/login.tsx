import { FormEvent, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Text } from "@/components/typography/Text";
import { adminLogin } from "@/lib/admin/auth.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin login — UXLAB" },
      { name: "robots", content: "noindex,nofollow,noarchive,nosnippet" },
      { name: "googlebot", content: "noindex,nofollow,noarchive,nosnippet" },
      { name: "referrer", content: "no-referrer" },
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
    <div className="rj-admin rj-admin--login theme-light">
      <div className="rj-admin__login-logo">
        <Logo href="/" />
      </div>

      <div className="rj-admin__panel rj-admin__login-card">
        <p className="rj-admin__eyebrow">Admin</p>
        <Text as="h1" variant="heading" className="rj-admin__title">
          Sign in
        </Text>
        <Text variant="caption" muted className="rj-admin__subtitle">
          Super-admin only. Not indexed by search or LLMs.
        </Text>

        <form onSubmit={onSubmit} className="rj-admin__form" style={{ marginTop: "var(--rj-space-6)" }}>
          <label className="rj-admin__field">
            <span className="rj-admin__label">Email</span>
            <input
              className="rj-admin__input"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="rj-admin__field">
            <span className="rj-admin__label">Password</span>
            <input
              className="rj-admin__input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error ? (
            <p className="rj-admin__error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="rj-admin__btn" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
