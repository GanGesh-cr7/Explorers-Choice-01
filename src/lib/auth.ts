export type UserProfile = {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  country: string;
  role: string;
  auth_provider?: "EMAIL" | "GOOGLE";
  is_staff: boolean;
  created_at: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  country: string;
  requested_role?: "CUSTOMER" | "TRAVEL_AGENT" | "HOTEL_OWNER";
};

export type LoginPayload = {
  email: string;
  password: string;
};

import { CLIENT_API_URL as API_URL } from "@/lib/api";

function apiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object" || !("detail" in body)) return fallback;

  const detail = body.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "msg" in item && typeof item.msg === "string") {
        return item.msg;
      }
      return null;
    }).filter((message): message is string => Boolean(message));
    if (messages.length > 0) return messages.join(" ");
  }

  return fallback;
}

export async function registerUser(payload: RegisterPayload): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(apiErrorMessage(body, "We could not create your account. Please try again."));
  return body as UserProfile;
}

export async function loginUser(payload: LoginPayload): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(apiErrorMessage(body, "Incorrect email or password."));
  return body as UserProfile;
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
    if (!response.ok) return null;
    return (await response.json()) as UserProfile;
  } catch {
    return null;
  }
}

export async function updateProfile(updates: Partial<Pick<UserProfile, "full_name" | "phone" | "country">>): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(apiErrorMessage(body, "Your profile could not be updated."));
  return body as UserProfile;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(apiErrorMessage(body, "Your password could not be changed."));
}

export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(apiErrorMessage(body, "We could not send a reset link."));
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, password }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(apiErrorMessage(body, "This reset link is invalid or has expired."));
  }
}

/**
 * Build a URL that sends the browser through the backend-driven Google OAuth
 * flow. The `next` path is where the user lands after a successful sign-in
 * (validated server-side to a local path).
 */
export function googleLoginUrl(next?: string): string {
  const path = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return `${API_URL}/auth/google?next=${encodeURIComponent(path)}`;
}