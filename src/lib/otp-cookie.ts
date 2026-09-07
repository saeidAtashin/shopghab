import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { getAuthSecret } from "@/lib/auth-secret";
import { OTP_TTL_SEC } from "@/lib/auth-shared";

export const OTP_COOKIE_NAME = "otp_pending";

type OtpPayload = {
  phone: string;
  code: string;
  exp: number;
};

function signPayload(payload: string): string {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
}

export function buildOtpCookieToken(phone: string, code: string): string {
  const payload = JSON.stringify({
    phone,
    code,
    exp: Date.now() + OTP_TTL_SEC * 1000,
  });
  const signature = signPayload(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function getOtpCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: OTP_TTL_SEC,
  };
}

function decodeOtpToken(token: string): OtpPayload | null {
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

    const data = JSON.parse(payload) as OtpPayload;

    if (
      typeof data.phone !== "string" ||
      typeof data.code !== "string" ||
      typeof data.exp !== "number"
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function codesMatch(stored: string, provided: string): boolean {
  const storedBuffer = Buffer.from(stored);
  const providedBuffer = Buffer.from(provided);
  if (storedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(storedBuffer, providedBuffer);
}

export async function setOtpCookie(phone: string, code: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(OTP_COOKIE_NAME, buildOtpCookieToken(phone, code), getOtpCookieOptions());
}

export async function clearOtpCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OTP_COOKIE_NAME);
}

export async function readOtpCookie(): Promise<OtpPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(OTP_COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeOtpToken(token);
}

export type OtpVerificationResult =
  | { ok: true; phone: string }
  | { ok: false; reason: "missing" | "expired" | "phone_mismatch" | "invalid_code" };

export async function verifyOtpCookie(
  phone: string,
  code: string,
): Promise<OtpVerificationResult> {
  const session = await readOtpCookie();

  if (!session) {
    return { ok: false, reason: "missing" };
  }

  if (session.exp < Date.now()) {
    await clearOtpCookie();
    return { ok: false, reason: "expired" };
  }

  if (session.phone !== phone) {
    return { ok: false, reason: "phone_mismatch" };
  }

  if (!codesMatch(session.code, code)) {
    return { ok: false, reason: "invalid_code" };
  }

  await clearOtpCookie();
  return { ok: true, phone: session.phone };
}
