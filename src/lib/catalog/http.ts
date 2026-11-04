import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { CatalogError } from "./logic";
import { adminSessionFromRequest } from "./session";

export function requireAdmin(request: Request): { phone: string } | NextResponse {
  const session = adminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  return session;
}

export function isAdminSession(
  value: { phone: string } | NextResponse,
): value is { phone: string } {
  return !(value instanceof NextResponse);
}

function isFsLockError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  const code = String((error as { code?: unknown }).code);
  return code === "EPERM" || code === "EBUSY" || code === "EACCES";
}

export function catalogErrorResponse(error: unknown): NextResponse {
  if (error instanceof CatalogError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const message = issue && "message" in issue ? String(issue.message) : "اطلاعات وارد شده معتبر نیست";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  if (isFsLockError(error)) {
    return NextResponse.json(
      {
        error:
          "فایل کاتالوگ قفل است (OneDrive یا آنتی‌ویروس). چند ثانیه بعد دوباره امتحان کنید یا پروژه را خارج از OneDrive نگه دارید.",
      },
      { status: 503 },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
}
