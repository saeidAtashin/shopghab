import { NextResponse } from "next/server";

import { normalizeIranPhone } from "@/lib/phone";
import { touchPresence } from "@/lib/shop/activity-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const phone = typeof record.phone === "string" ? normalizeIranPhone(record.phone) : null;
  if (!phone) {
    return NextResponse.json({ error: "شماره موبایل معتبر نیست." }, { status: 400 });
  }

  const name = typeof record.name === "string" ? record.name.trim().slice(0, 80) : phone;
  await touchPresence(phone, name || phone);
  return NextResponse.json({ ok: true });
}
