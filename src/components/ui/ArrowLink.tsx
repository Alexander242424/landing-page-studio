import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ArrowLinkProps = {
  children: ReactNode;
  className?: string;
  underlined?: boolean;
} & Omit<ComponentPropsWithoutRef<"a">, "children" | "className">;

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
      className={cn("rj-arrow", underlined && "rj-arrow--underlined", className)}
      {...props}
    >
      <span className="rj-arrow__icon rj-arrow__icon--b" aria-hidden="true">
        ↗
      </span>
      <span className="rj-arrow__content">{children}</span>
      <span className="rj-arrow__icon rj-arrow__icon--a" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}
