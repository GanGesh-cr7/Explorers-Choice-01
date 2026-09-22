export function buildClientApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_EXPLORERS_API_URL;
  if (configured) {
    const base = configured.replace(/\/$/, "");
    return base.endsWith("/api") ? base : `${base}/api`;
  }
  return "http://localhost:8000/api";
}

export const CLIENT_API_URL = buildClientApiUrl();
export const SERVER_API_URL = buildClientApiUrl();
