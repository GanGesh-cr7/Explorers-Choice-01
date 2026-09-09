import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  onDark = false,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  onDark?: boolean;
  className?: string;
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${alignCls} ${className}`}>
      {eyebrow && (
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
          {eyebrow}
        </p>
      )}
      <h2 className={`font-display text-4xl leading-tight sm:text-5xl ${onDark ? "text-ivory" : "text-forest"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-5 text-lg leading-relaxed ${onDark ? "text-ivory/75" : "text-charcoal-soft"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
