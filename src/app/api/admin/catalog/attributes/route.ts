import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { createAttribute } from "@/lib/catalog/logic";
import { attributeCreateSchema } from "@/lib/catalog/schema";
import { mutateCatalog, readCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const catalog = readCatalog();
  return NextResponse.json({
    groups: [...catalog.attributeGroups].sort((a, b) => a.sortOrder - b.sortOrder),
    values: [...catalog.attributeValues].sort((a, b) => a.sortOrder - b.sortOrder),
  });
}

export async function POST(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  try {
    const input = attributeCreateSchema.parse(await request.json());
    await mutateCatalog((catalog) => ({
      catalog: createAttribute(catalog, input),
      result: null,
    }));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
