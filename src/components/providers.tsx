import type { ReactNode } from "react";

/**
 * App-level providers. Currently no global client context is needed,
 * but this keeps a single place to mount providers (e.g. a cart or
 * booking context) in the future without touching the root layout.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
