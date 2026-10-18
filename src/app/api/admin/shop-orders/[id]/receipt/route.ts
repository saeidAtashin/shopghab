import { NextResponse } from "next/server";

import { isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { receiptContentType } from "@/lib/shop/activity";
import { readOrderReceipt } from "@/lib/shop/activity-store";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  const receipt = readOrderReceipt(id);
  if (!receipt) {
    return NextResponse.json({ error: "رسید پیدا نشد." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(receipt.bytes), {
    headers: {
      "Content-Type": receiptContentType(receipt.ext),
      "Cache-Control": "private, no-store",
    },
  });
}
