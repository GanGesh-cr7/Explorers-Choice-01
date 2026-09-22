/**
 * Get the backend base URL at runtime (not build time).
 * This ensures Vercel's environment variable is always used, not a build-time default.
 */
export function getApiBaseUrl(): string {
  const configured = typeof process !== "undefined" && typeof process.env !== "undefined"
    ? process.env.NEXT_PUBLIC_EXPLORERS_API_URL
    : undefined;
  return (configured || "http://localhost:8000")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
}

export function buildClientApiUrl(): string {
  return `${getApiBaseUrl()}/api`;
}

/**
 * Lazy getters to prevent module initialization crashes.
 * These are called on every access to ensure runtime env var resolution.
 */
export const CLIENT_API_URL = buildClientApiUrl();
export const SERVER_API_URL = buildClientApiUrl();
