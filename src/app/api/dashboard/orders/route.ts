import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listRepairOrdersByPhone, serializeOrder } from "@/lib/orders";

export async function GET() {
  const user = await requireUser();
  if (!user?.phone) {
    return NextResponse.json(
      { success: false, message: "دسترسی غیرمجاز" },
      { status: 401 },
    );
  }

  const orders = await listRepairOrdersByPhone(user.phone);

  return NextResponse.json({
    success: true,
    orders: orders.map(serializeOrder),
  });
}
