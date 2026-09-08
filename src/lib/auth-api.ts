import { apiRequest } from "@/lib/api-client";
import { resolveRoleForPhone } from "@/lib/auth-shared";
import {
  getRefreshToken,
  getSessionPhone,
  setAuthToken,
  setRefreshToken,
} from "@/lib/auth-storage";

export type AuthTokenData = {
  phone_number?: string;
  access?: string;
  refresh?: string;
  is_new_user?: string | boolean;
};

export type AuthLoginPayload = {
  success?: boolean;
  message?: string;
  data?: AuthTokenData;
};

export type TokenRefreshResponse = {
  access?: string;
  refresh?: string;
  data?: { access?: string; refresh?: string };
};

export type SessionUser = {
  name: string;
  role: "admin" | "user";
  phone_number?: string;
  phone?: string;
};

export type RefreshResult = {
  access: string;
  refresh?: string;
};

export function extractAuthTokenData(payload: AuthLoginPayload): AuthTokenData | null {
  if (!payload.data || typeof payload.data !== "object") {
    return null;
  }
  return payload.data;
}

export function extractAccessToken(response: TokenRefreshResponse): string | null {
  if (typeof response.access === "string" && response.access) {
    return response.access;
  }

  if (
    response.data &&
    typeof response.data.access === "string" &&
    response.data.access
  ) {
    return response.data.access;
  }

  return null;
}

export function extractRefreshToken(response: TokenRefreshResponse): string | null {
  if (typeof response.refresh === "string" && response.refresh) {
    return response.refresh;
  }

  if (
    response.data &&
    typeof response.data.refresh === "string" &&
    response.data.refresh
  ) {
    return response.data.refresh;
  }

  return null;
}

export function buildUserFromPhone(phone_number: string): SessionUser {
  return {
    name: phone_number,
    role: resolveRoleForPhone(phone_number),
    phone_number,
    phone: phone_number,
  };
}

export async function refreshAccessToken(refresh: string): Promise<RefreshResult> {
  const response = await apiRequest<TokenRefreshResponse>("/auth/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    auth: false,
  });

  const access = extractAccessToken(response);
  if (!access) {
    throw new Error("Invalid token refresh response");
  }

  const rotatedRefresh = extractRefreshToken(response);
  return { access, refresh: rotatedRefresh ?? undefined };
}

export async function restoreSession(): Promise<SessionUser | null> {
  const refresh = getRefreshToken();
  const phone = getSessionPhone();
  if (!refresh || !phone) {
    return null;
  }

  const refreshed = await refreshAccessToken(refresh);
  setAuthToken(refreshed.access);
  setRefreshToken(refreshed.refresh ?? refresh);
  return buildUserFromPhone(phone);
}
