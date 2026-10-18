import { NextResponse } from "next/server";

import { orderFieldsError, parseOrderFields } from "@/lib/shop/activity";
import { recordShopOrder } from "@/lib/shop/activity-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const parsed = parseOrderFields({
    name: record.name,
    phone: record.phone,
    address: record.address,
    note: record.note,
    items: record.items,
  });
  if (orderFieldsError(parsed)) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const orderId = typeof record.orderId === "string" ? record.orderId.trim() : "";
  const orderCode = typeof record.orderCode === "string" ? record.orderCode.trim() : "";

  try {
    const order = await recordShopOrder({
      ...parsed,
      id: orderId || undefined,
      orderCode: orderCode || undefined,
      paymentMethod: "zarinpal",
      status: "paid",
    });
    return NextResponse.json({
      orderId: order.id,
      orderCode: order.orderCode,
      amount: order.amount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ثبت سفارش انجام نشد." }, { status: 500 });
  }
}
