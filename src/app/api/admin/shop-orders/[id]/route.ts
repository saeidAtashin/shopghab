import { NextResponse } from "next/server";

import { isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { confirmShopOrder } from "@/lib/shop/activity-store";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const status = body && typeof body === "object" ? (body as { status?: unknown }).status : null;
  if (status !== "confirmed") {
    return NextResponse.json({ error: "وضعیت معتبر نیست." }, { status: 400 });
  }

  const order = await confirmShopOrder(id);
  if (!order) {
    return NextResponse.json({ error: "سفارش در انتظار تایید رسید نیست." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
