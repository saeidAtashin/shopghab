import { NextResponse } from "next/server";
import { serializeOrder, updateRepairOrderStatus } from "@/lib/orders";
import { isRepairStatus } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

type Props = {
  params: Promise<{
    code: string;
  }>;
};

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

  if (!isRepairStatus(status)) {
    return NextResponse.json(
      { success: false, message: "وضعیت نامعتبر است" },
      { status: 400 },
    );
  }

  try {
    const order = await updateRepairOrderStatus(code, status);
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
