import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { getAuthSecret } from "@/lib/auth-secret";
import type { SessionUser } from "@/lib/auth-shared";

export type { SessionRole, SessionUser } from "@/lib/auth-shared";
export {
  ADMIN_PHONE,
  generateOtpCode,
  getOtpExpiry,
  getPostLoginPath,
  resolveRoleForPhone,
  verifyAdminCredentials,
} from "@/lib/auth-shared";

const SESSION_COOKIE = "console_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function signPayload(payload: string): string {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
}

function encodeSession(user: SessionUser): string {
  const payload = JSON.stringify({
    ...user,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const signature = signPayload(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

function decodeSession(token: string): SessionUser | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const separator = decoded.lastIndexOf(".");
    if (separator === -1) return null;

    const payload = decoded.slice(0, separator);
    const signature = decoded.slice(separator + 1);
    const expected = signPayload(payload);

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const data = JSON.parse(payload) as SessionUser & { exp: number };

    if (Date.now() > data.exp) {
      return null;
    }

    return {
      name: data.name,
      role: data.role,
      phone: typeof data.phone === "string" ? data.phone : undefined,
    };
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}

export async function requireUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || session.role !== "user") {
    return null;
  }
  return session;
}
