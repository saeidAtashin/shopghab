import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { buildAdminCustomers } from "@/lib/shop/activity";
import { readShopActivity } from "@/lib/shop/activity-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  try {
    const customers = buildAdminCustomers(readShopActivity());
    return NextResponse.json({ customers });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
