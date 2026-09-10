export const CLIENT_API_URL = (process.env.NEXT_PUBLIC_EXPLORERS_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");
export const SERVER_API_URL = (process.env.EXPLORERS_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");
