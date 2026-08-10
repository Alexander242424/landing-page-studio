import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Span = "all" | 2 | 3 | 4 | 6;

type GridProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

type GridItemProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  span?: Span;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

const spanClass: Record<Span, string> = {
  all: "rj-grid__span-all",
  2: "rj-grid__span-2",
  3: "rj-grid__span-3",
  4: "rj-grid__span-4",
  6: "rj-grid__span-6",
};

export function Grid<T extends ElementType = "div">({
  as,
  children,
  className,
  ...props
}: GridProps<T>) {
  const Comp = as ?? "div";
  return (
    <Comp className={cn("rj-grid", className)} {...props}>
      {children}
    </Comp>
  );
}

export function GridItem<T extends ElementType = "div">({
  as,
  children,
  className,
  span = "all",
  ...props
}: GridItemProps<T>) {
  const Comp = as ?? "div";
  return (
    <Comp className={cn(spanClass[span], className)} {...props}>
      {children}
    </Comp>
  );
}
