import type { ReactNode } from "react";

type Variant = "forest" | "sand" | "terracotta" | "outline";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  forest: "bg-forest text-ivory",
  sand: "bg-sand text-forest",
  terracotta: "bg-terracotta text-ivory",
  outline: "border border-forest/30 text-forest",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-1.5 text-sm",
};

export function Badge({
  children,
  variant = "sand",
  size = "sm",
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
