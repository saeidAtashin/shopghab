import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { projectMockupStatus } from "@/lib/mockups/status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  try {
    const report = await projectMockupStatus();
    return NextResponse.json(report);
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
