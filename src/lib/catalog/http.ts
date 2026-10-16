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

export function catalogErrorResponse(error: unknown): NextResponse {
  if (error instanceof CatalogError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const message = issue && "message" in issue ? String(issue.message) : "اطلاعات وارد شده معتبر نیست";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  console.error(error);
  return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
}
