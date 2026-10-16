import { createHmac, timingSafeEqual } from "node:crypto";

import { resolveRoleForPhone } from "@/lib/auth-shared";
import { normalizeIranPhone } from "@/lib/phone";

export const ADMIN_SESSION_COOKIE = "catalog_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type SessionPayload = {
  phone: string;
  exp: number;
};

function sessionSecret(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "changeme";
}

function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(body: string): string {
  return createHmac("sha256", sessionSecret()).update(body).digest("base64url");
}

export function createAdminSessionToken(phone: string, now = Date.now()): string {
  const payload: SessionPayload = { phone, exp: now + SESSION_TTL_MS };
  const body = encode(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined,
  now = Date.now(),
): { phone: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  if (!body || !signature) return null;

  const expected = sign(body);
  const actualBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(actualBuf, expectedBuf)) return null;

  try {
    const payload = JSON.parse(decode(body)) as SessionPayload;
    if (typeof payload.phone !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp <= now) return null;
    return { phone: payload.phone };
  } catch {
    return null;
  }
}

export function readSessionToken(request: Request): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === ADMIN_SESSION_COOKIE) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return undefined;
}

export function adminSessionFromRequest(request: Request): { phone: string } | null {
  return verifyAdminSessionToken(readSessionToken(request));
}

function collectPhones(value: unknown, found: Set<string>, depth: number): void {
  if (depth > 6 || value == null) return;
  if (typeof value === "string") {
    const phone = normalizeIranPhone(value);
    if (phone) found.add(phone);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectPhones(item, found, depth + 1);
    return;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) collectPhones(item, found, depth + 1);
  }
}

function decodeJwtPayload(token: string): unknown {
  const body = token.split(".")[1];
  if (!body) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as unknown;
  } catch {
    return null;
  }
}

/** Phone must come from the upstream body or access-token claims, never from the client alone. */
export function findAdminPhone(upstream: unknown, accessToken?: string): string | null {
  const phones = new Set<string>();
  collectPhones(upstream, phones, 0);
  if (accessToken) collectPhones(decodeJwtPayload(accessToken), phones, 0);
  for (const phone of phones) {
    if (resolveRoleForPhone(phone) === "admin") return phone;
  }
  return null;
}
