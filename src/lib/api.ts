export function buildClientApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_EXPLORERS_API_URL;
  if (configured) return configured.replace(/\/$/, "");

  // When served over the LAN (e.g. http://192.168.86.15:3000), call the API
  // on the same host so friends on other devices reach this machine's backend.
  if (typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }
  return "http://localhost:8000/api";
}

export const CLIENT_API_URL = buildClientApiUrl();
export const SERVER_API_URL = (process.env.EXPLORERS_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");
