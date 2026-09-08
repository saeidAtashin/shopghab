const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const SESSION_PHONE_KEY = "session_phone";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAuthToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getSessionPhone(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(SESSION_PHONE_KEY);
}

export function setSessionPhone(phone: string): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SESSION_PHONE_KEY, phone);
}

export function clearSessionPhone(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_PHONE_KEY);
}

export function clearAuthSession(): void {
  clearAuthToken();
  clearRefreshToken();
  clearSessionPhone();
}
