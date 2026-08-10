import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type TextVariant =
  | "display"
  | "title"
  | "heading"
  | "subhead"
  | "lead"
  | "body"
  | "caption";

type TextProps<T extends ElementType = "p"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  variant?: TextVariant;
  muted?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

const variantClass: Record<TextVariant, string> = {
  display: "rj-type-display",
  title: "rj-type-title",
  heading: "rj-type-heading",
  subhead: "rj-type-subhead",
  lead: "rj-type-lead",
  body: "rj-type-body",
  caption: "rj-type-caption",
};

export function Text<T extends ElementType = "p">({
  as,
  children,
  className,
  variant = "body",
  muted = false,
  ...props
}: TextProps<T>) {
  const Comp = as ?? "p";
  return (
    <Comp
      className={cn(variantClass[variant], muted && "rj-type-muted", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
