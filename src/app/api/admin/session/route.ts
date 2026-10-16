import { NextResponse } from "next/server";

import { resolveRoleForPhone } from "@/lib/auth-shared";
import { normalizeIranPhone } from "@/lib/phone";

import {
  ADMIN_SESSION_COOKIE,
  adminSessionFromRequest,
  createAdminSessionToken,
  findAdminPhone,
} from "@/lib/catalog/session";

export const dynamic = "force-dynamic";

type UpstreamAuth = {
  success?: boolean;
  message?: string;
  data?: {
    access?: string;
    refresh?: string;
    phone_number?: string;
  };
};

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function apiBaseUrl(): string {
  return (process.env.API_BASE_URL?.trim() || "https://api.k3isonfire.ir/api/v1").replace(
    /\/$/,
    "",
  );
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export async function POST(request: Request) {
  let body: { phone_number?: string; password?: string; otp?: string };
  try {
    body = (await request.json()) as { phone_number?: string; password?: string; otp?: string };
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const phone = normalizeIranPhone(body.phone_number ?? "");
  if (!phone || resolveRoleForPhone(phone) !== "admin") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const password = body.password?.trim();
  const otp = body.otp?.trim();
  if (!password && !otp) {
    return NextResponse.json({ error: "رمز یا کد تایید لازم است" }, { status: 400 });
  }

  const path = otp ? "/auth/verify-otp/" : "/auth/login/";
  const upstreamBody = otp
    ? { phone_number: phone, otp }
    : { phone_number: phone, password };

  let payload: UpstreamAuth | null = null;
  let ok = false;
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": process.env.NEXT_PUBLIC_API_TENANT_ID?.trim() || "shop-ghab",
      },
      body: JSON.stringify(upstreamBody),
      signal: AbortSignal.timeout(10_000),
    });
    ok = response.ok;
    payload = (await response.json()) as UpstreamAuth;
  } catch {
    return NextResponse.json({ error: "ارتباط با سرویس ورود برقرار نشد" }, { status: 502 });
  }

  if (!ok || payload?.success === false || !payload?.data?.refresh) {
    return NextResponse.json(
      { error: payload?.message || "ورود مدیر تایید نشد" },
      { status: 401 },
    );
  }

  const response = NextResponse.json(payload);
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(phone), cookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return response;
}

export async function GET(request: Request) {
  const session = adminSessionFromRequest(request);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}

function readTokenField(payload: unknown, key: "access" | "refresh"): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  if (typeof record[key] === "string" && record[key]) return record[key];
  const data = record.data;
  if (data && typeof data === "object") {
    const nested = (data as Record<string, unknown>)[key];
    if (typeof nested === "string" && nested) return nested;
  }
  return undefined;
}

export async function PUT(request: Request) {
  let body: { refresh?: string };
  try {
    body = (await request.json()) as { refresh?: string };
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const refresh = body.refresh?.trim();
  if (!refresh) {
    return NextResponse.json({ error: "نشست معتبر نیست" }, { status: 400 });
  }

  let payload: unknown = null;
  let ok = false;
  try {
    const response = await fetch(`${apiBaseUrl()}/auth/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": process.env.NEXT_PUBLIC_API_TENANT_ID?.trim() || "shop-ghab",
      },
      body: JSON.stringify({ refresh }),
      signal: AbortSignal.timeout(10_000),
    });
    ok = response.ok;
    payload = await response.json();
  } catch {
    return NextResponse.json({ error: "ارتباط با سرویس ورود برقرار نشد" }, { status: 502 });
  }

  if (!ok) {
    return NextResponse.json({ error: "نشست مدیر تایید نشد" }, { status: 401 });
  }

  const access = readTokenField(payload, "access");
  const rotated = readTokenField(payload, "refresh");
  const phone = findAdminPhone(payload, access);
  const tokens = {
    ...(access ? { access } : {}),
    ...(rotated ? { refresh: rotated } : {}),
  };

  if (!phone) {
    return NextResponse.json(
      { error: "برای مدیریت کاتالوگ دوباره وارد شوید", ...tokens },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ ok: true, ...tokens });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(phone), cookieOptions());
  return response;
}
