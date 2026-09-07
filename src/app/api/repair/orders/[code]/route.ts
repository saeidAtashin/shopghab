import { NextResponse } from "next/server";
import {
  getCaseOrderByCode,
  serializeOrder,
  updateCaseOrderStatus,
} from "@/lib/orders";
import { isOrderStatus } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

type Props = {
  params: Promise<{
    code: string;
  }>;
};

/** Legacy alias for /api/orders/[code] */
export async function GET(_req: Request, { params }: Props) {
  const { code } = await params;
  const order = await getCaseOrderByCode(code);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "سفارش پیدا نشد" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    order: serializeOrder(order),
  });
}

export async function PATCH(req: Request, { params }: Props) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "دسترسی غیرمجاز" },
      { status: 401 },
    );
  }

  const { code } = await params;
  const body = await req.json();
  const status = String(body.status ?? "");

  if (!isOrderStatus(status)) {
    return NextResponse.json(
      { success: false, message: "وضعیت نامعتبر است" },
      { status: 400 },
    );
  }

  try {
    const order = await updateCaseOrderStatus(code, status);
    return NextResponse.json({
      success: true,
      order: serializeOrder(order),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "سفارش پیدا نشد" },
      { status: 404 },
    );
  }
}
