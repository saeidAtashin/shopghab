const AUTH_SECRET_MISSING = "AUTH_SECRET is not configured";

export function getAuthSecretConfigError(): string | null {
  if (!process.env.AUTH_SECRET?.trim()) {
    return "AUTH_SECRET تنظیم نشده است";
  }
  return null;
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error(AUTH_SECRET_MISSING);
  }
  return secret;
}

export function isAuthSecretMissingError(error: unknown): boolean {
  return error instanceof Error && error.message === AUTH_SECRET_MISSING;
}
