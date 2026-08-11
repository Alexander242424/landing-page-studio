import { FormEvent, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="theme-light flex min-h-screen flex-col items-center justify-center bg-[var(--rj-white)] px-[var(--rj-grid-margin)] py-16 font-[family-name:var(--rj-font-sans)] text-[var(--rj-fg)]">
      <div className="mb-10">
        <Logo className="rj-logo text-[var(--rj-black)]" href="/" />
      </div>

      <Card className="w-full max-w-[26rem] rounded-[4px] border-[var(--rj-border)] bg-[var(--rj-white)] shadow-none">
        <CardHeader className="space-y-2 p-8 pb-4">
          <p className="text-[1.1rem] font-light uppercase tracking-[0.14em] text-[var(--rj-fg-muted)]">
            Admin
          </p>
          <CardTitle className="text-[2.4rem] font-light tracking-[-0.03em] text-[var(--rj-black)]">
            Sign in
          </CardTitle>
          <CardDescription className="text-[1.4rem] font-light text-[var(--rj-fg-muted)]">
            Super-admin only. Not indexed by search or LLMs.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-2">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="admin-email"
                className="text-[1.3rem] font-light text-[var(--rj-fg)]"
              >
                Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-[4px] border-[var(--rj-border)] bg-[var(--rj-white)] text-[1.4rem] font-light shadow-none focus-visible:ring-[var(--rj-black)]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="admin-password"
                className="text-[1.3rem] font-light text-[var(--rj-fg)]"
              >
                Password
              </Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-[4px] border-[var(--rj-border)] bg-[var(--rj-white)] text-[1.4rem] font-light shadow-none focus-visible:ring-[var(--rj-black)]"
              />
            </div>

            {error ? (
              <Alert
                variant="destructive"
                className="rounded-[4px] border-red-200 bg-red-50 text-[1.3rem] font-light"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="submit"
              disabled={pending}
              className="h-12 w-full rounded-full bg-[var(--rj-black)] text-[1.4rem] font-normal text-[var(--rj-white)] shadow-none hover:bg-[var(--rj-black)]/90"
            >
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
