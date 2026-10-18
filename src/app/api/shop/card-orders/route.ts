import { NextResponse } from "next/server";

import { orderFieldsError, parseOrderFields, receiptExtension } from "@/lib/shop/activity";
import { createCardOrder } from "@/lib/shop/activity-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const parsed = parseOrderFields({
    name: form.get("name"),
    phone: form.get("phone"),
    address: form.get("address"),
    note: form.get("note"),
    items: form.get("items"),
  });
  if (orderFieldsError(parsed)) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const file = form.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "تصویر رسید پرداخت الزامی است." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = receiptExtension(bytes);
  if (!ext) {
    return NextResponse.json(
      { error: "رسید باید تصویر JPG، PNG یا WebP و کمتر از ۵ مگابایت باشد." },
      { status: 400 },
    );
  }

  try {
    const order = await createCardOrder(parsed, bytes, ext);
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
