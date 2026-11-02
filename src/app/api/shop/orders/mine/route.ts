import { NextResponse } from "next/server";

import { normalizeIranPhone } from "@/lib/phone";
import { listShopOrdersForPhone } from "@/lib/shop/activity-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const phone = normalizeIranPhone(new URL(request.url).searchParams.get("phone") ?? "");
  if (!phone) {
    return NextResponse.json({ error: "شماره موبایل معتبر نیست." }, { status: 400 });
  }
  return NextResponse.json({ orders: listShopOrdersForPhone(phone) });
}
