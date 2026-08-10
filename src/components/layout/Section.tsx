import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionVariant = "default" | "tight" | "hero";

type SectionProps<T extends ElementType = "section"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  variant?: SectionVariant;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

const variantClass: Record<SectionVariant, string> = {
  default: "rj-section",
  tight: "rj-section rj-section--tight",
  hero: "rj-section rj-section--hero",
};

export function Section<T extends ElementType = "section">({
  as,
  children,
  className,
  variant = "default",
  ...props
}: SectionProps<T>) {
  const Comp = as ?? "section";
  return (
    <Comp className={cn(variantClass[variant], className)} {...props}>
      {children}
    </Comp>
  );
}
