import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { readCatalog } from "@/lib/catalog/store";
import { landingSectionsSchema } from "@/lib/landing/sections";
import { readLandingSections, writeLandingSections } from "@/lib/landing/store";
import { sanitizeLandingBanners } from "@/lib/landing/taxonomy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;
  return NextResponse.json(readLandingSections());
}

export async function PUT(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  try {
    const input = landingSectionsSchema.parse(await request.json());
    return NextResponse.json(writeLandingSections(sanitizeLandingBanners(readCatalog(), input)));
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
