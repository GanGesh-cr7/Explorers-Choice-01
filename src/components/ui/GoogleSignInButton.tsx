"use client";

import { useMemo } from "react";
import { googleLoginUrl } from "@/lib/auth";

function GoogleGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.56 5.56 0 0 1-2.4 3.58v3h3.88c2.26-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.28a12 12 0 0 0 0 10.74l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.93 11.93 0 0 0 12 0 12 12 0 0 0 1.28 6.63l3.99 3.09C6.22 6.87 8.87 4.76 12 4.76Z"
      />
    </svg>
  );
}

type GoogleSignInButtonProps = {
  next?: string;
  label?: string;
  className?: string;
};

export function GoogleSignInButton({
  next,
  label = "Continue with Google",
  className = "",
}: GoogleSignInButtonProps) {
  const href = useMemo(() => googleLoginUrl(next), [next]);

  return (
    <a
      href={href}
      className={`btn-press inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-8 py-4 text-base font-semibold tracking-wide text-charcoal transition-colors hover:border-forest/40 hover:bg-forest/5 focus-visible:outline-terracotta ${className}`}
    >
      <GoogleGlyph />
      {label}
    </a>
  );
}