import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  markClassName?: string;
  size?: "md" | "lg";
  title?: string;
} & Omit<ComponentPropsWithoutRef<"a">, "children" | "className">;

/**
 * UXLAB wordmark from witty-quicker-606444.framer.app
 * Asset: public/brand/uxlab-logo.svg (masked so currentColor themes work)
 */
export function Logo({
  className,
  markClassName,
  size = "md",
  title = "UXLAB",
  href = "/",
  ...props
}: LogoProps) {
  return (
    <a href={href} className={cn("rj-logo", className)} aria-label={title} {...props}>
      <span
        className={cn(
          "rj-logo__mark",
          size === "lg" && "rj-logo__mark--lg",
          markClassName,
        )}
        role="img"
        aria-hidden="true"
      />
    </a>
  );
}
