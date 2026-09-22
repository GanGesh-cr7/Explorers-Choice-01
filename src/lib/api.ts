export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_EXPLORERS_API_URL || "http://localhost:8000"
).replace(/\/+$/, "").replace(/\/api$/, "");

export function buildClientApiUrl(): string {
  return `${API_BASE_URL}/api`;
}

export const CLIENT_API_URL = buildClientApiUrl();
export const SERVER_API_URL = buildClientApiUrl();
