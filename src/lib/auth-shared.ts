export type SessionRole = "admin" | "user";

export const ADMIN_PHONES = new Set(["09368165125", "09107701704"]);

export type SessionUser = {
  name: string;
  role: SessionRole;
  phone?: string;
};

export function resolveRoleForPhone(phone: string): SessionRole {
  return ADMIN_PHONES.has(phone) ? "admin" : "user";
}

export function getPostLoginPath(role: SessionRole): string {
  return role === "admin" ? "/admin" : "/dashboard";
}

export function verifyAdminCredentials(
  phone_number: string,
  password: string,
): boolean {
  const adminPhone_number = process.env.ADMIN_PHONE_NUMBER ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme";
  return phone_number === adminPhone_number && password === adminPassword;
}

export function generateOtpCode(): string {
  const devCode = process.env.OTP_DEV_CODE;
  if (devCode) {
    return devCode;
  }
  return String(Math.floor(1000 + Math.random() * 9000));
}

export const OTP_TTL_SEC = 2 * 60;

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_SEC * 1000);
}
