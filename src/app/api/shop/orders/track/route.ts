import { NextResponse } from "next/server";

import { findShopOrderTracking } from "@/lib/shop/activity-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  const order = findShopOrderTracking(code);
  if (!order) {
    return NextResponse.json({ success: false, message: "سفارش پیدا نشد" }, { status: 404 });
  }
  return NextResponse.json({ success: true, order });
}
