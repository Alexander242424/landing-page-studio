import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SmoothScrollProvider } from "@/components/scroll/SmoothScrollProvider";
import { PageRevealProvider } from "@/lib/pageReveal";
import { Preloader } from "@/components/preloader/Preloader";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { SITE, absoluteUrl } from "@/lib/site";

function Arr404() {
  return (
    <svg
      className="rj-arrow__svg"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4.5 3.25h8.25V11.5M12.25 3.75 3.25 12.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowCta({
  href,
  to,
  children,
}: {
  href?: string;
  to?: string;
  children: ReactNode;
}) {
  const inner = (
    <>
      <span className="rj-arrow__icon rj-arrow__icon--b" aria-hidden="true">
        <Arr404 />
      </span>
      <span className="rj-arrow__content">{children}</span>
      <span className="rj-arrow__icon rj-arrow__icon--a" aria-hidden="true">
        <Arr404 />
      </span>
    </>
  );
  if (to) {
    return (
      <Link to={to as "/"} className="rj-arrow">
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className="rj-arrow">
      {inner}
    </a>
  );
}

function NotFoundComponent() {
  useEffect(() => {
    document.title = `Not found — ${SITE.name}`;
  }, []);

  return (
    <div
      className="theme-light flex min-h-screen flex-col"
      style={{ background: "var(--rj-paper, #fff)" }}
    >
      <meta name="robots" content="noindex,nofollow" />

      {/* Minimal wordmark nav */}
      <header
        className="flex h-14 shrink-0 items-center px-[12px] lg:px-12"
        style={{ borderBottom: "1px solid var(--rj-rule, rgba(0,0,0,.07))" }}
      >
        <Link
          to="/"
          aria-label="UXLAB — back to home"
          className="text-sm tracking-tight transition-opacity hover:opacity-60"
          style={{
            fontFamily: "var(--rj-font-sans, 'Suisse Intl', sans-serif)",
            color: "var(--rj-ink)",
          }}
        >
          UXLAB
        </Link>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col justify-center px-[12px] pb-28 lg:px-12">
        <div className="w-full max-w-3xl">
          <p
            className="mb-5 text-[10px] font-medium uppercase tracking-[0.22em]"
            style={{ color: "var(--rj-ink-faint, rgba(0,0,0,.3))" }}
          >
            Error 404
          </p>

          <h1
            className="leading-none tracking-tight"
            style={{
              fontFamily: "var(--rj-font-display, 'Suisse Intl', sans-serif)",
              fontWeight: 300,
              fontSize: "clamp(3.5rem, 11vw, 8rem)",
              color: "var(--rj-ink)",
            }}
          >
            Wrong
            <br />
            turn.
          </h1>

          <p
            className="mt-6 max-w-xs text-sm leading-relaxed"
            style={{ color: "var(--rj-ink-mid, rgba(0,0,0,.5))" }}
          >
            This page doesn't exist or has been moved. Head back to find what
            you were looking for.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-8">
            <ArrowCta to="/">Back home</ArrowCta>
            <ArrowCta to="/resources">Browse resources</ArrowCta>
          </div>
        </div>
      </main>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-[12px]">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-normal tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center bg-foreground px-4 py-2 text-sm font-normal text-background transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center border border-border bg-background px-4 py-2 text-sm font-normal text-foreground transition-opacity hover:opacity-90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: SITE.themeColor },
    ],
    scripts: [
      {
        src: "https://cdn.visitors.now/v.js",
        "data-token": "dbf30a1f-7abe-4ee0-bc23-9a66841a7bd7",
      },
    ],
    links: [
      {
        rel: "preload",
        href: "/fonts/suisse-intl/SuisseIntl-Light.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/suisse-intl/SuisseIntl-Regular.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: SITE.favicon, type: "image/x-icon" },
      { rel: "icon", href: SITE.faviconPng, type: "image/png" },
      { rel: "apple-touch-icon", href: SITE.appleTouchIcon },
      {
        rel: "alternate",
        type: "text/plain",
        href: absoluteUrl("/llms.txt"),
      },
      {
        rel: "alternate",
        type: "text/plain",
        href: absoluteUrl("/llms-full.txt"),
      },
      {
        rel: "alternate",
        type: "application/rss+xml",
        href: absoluteUrl("/feed.xml"),
      },
      {
        rel: "sitemap",
        type: "application/xml",
        href: absoluteUrl("/sitemap.xml"),
      },
      {
        rel: "preload",
        href: "/fonts/aeonik-pro/AeonikPro-Regular.otf",
        as: "font",
        type: "font/otf",
        crossOrigin: "anonymous",
      },
      { rel: "preconnect", href: "https://app.cal.com" },
      { rel: "dns-prefetch", href: "https://app.cal.com" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScrollProvider>
        <PageRevealProvider>
          <Preloader />
          <AnalyticsBeacon />
          <Outlet />
        </PageRevealProvider>
      </SmoothScrollProvider>
    </QueryClientProvider>
  );
}
