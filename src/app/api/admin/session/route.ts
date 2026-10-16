import { NextResponse } from "next/server";

import { resolveRoleForPhone } from "@/lib/auth-shared";
import { normalizeIranPhone } from "@/lib/phone";

import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from "@/lib/catalog/session";

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
