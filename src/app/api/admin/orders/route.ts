import { NextResponse } from "next/server";
import { listRepairOrders, serializeOrder } from "@/lib/orders";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "دسترسی غیرمجاز" },
      { status: 401 },
    );
  }

  const orders = await listRepairOrders();

  return NextResponse.json({
    success: true,
    orders: orders.map(serializeOrder),
  });
}
