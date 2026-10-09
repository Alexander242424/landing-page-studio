import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ArrowLinkProps = {
  children: ReactNode;
  className?: string;
  underlined?: boolean;
} & Omit<ComponentPropsWithoutRef<"a">, "children" | "className">;

/**
 * Inline SVG instead of the ↗ unicode glyph.
 * Safari often paints U+2197 as a color emoji, which disappears under
 * header `mix-blend-mode: difference`. SVG with currentColor stays visible.
 */
export function ArrowIcon() {
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

function ArrowCueInner({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="rj-arrow__icon rj-arrow__icon--b" aria-hidden="true">
        <ArrowIcon />
      </span>
      <span className="rj-arrow__content">{children}</span>
      <span className="rj-arrow__icon rj-arrow__icon--a" aria-hidden="true">
        <ArrowIcon />
      </span>
    </>
  );
}

/**
 * Visual-only arrow cue (for when a parent element is already the link).
 */
export function ArrowCue({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("rj-arrow", className)}>
      <ArrowCueInner>{children}</ArrowCueInner>
    </span>
  );
}

/**
 * Rejouice b-arrow CTA: label slides right on hover while the ↗ icon
 * exits up-right and a second ↗ enters from bottom-left.
 */
export function ArrowLink({
  children,
  className,
  underlined = false,
  ...props
}: ArrowLinkProps) {
  return (
    <a
      className={cn(
        "rj-arrow",
        underlined && "rj-arrow--underlined rj-link-active-full-small",
        className,
      )}
      {...props}
    >
      <ArrowCueInner>{children}</ArrowCueInner>
    </a>
  );
}
