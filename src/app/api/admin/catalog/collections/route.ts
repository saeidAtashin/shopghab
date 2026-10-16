import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { createCollection } from "@/lib/catalog/logic";
import { collectionWriteSchema } from "@/lib/catalog/schema";
import { mutateCatalog, readCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const collections = [...readCatalog().collections].sort((a, b) => a.sortOrder - b.sortOrder);
  return NextResponse.json({ collections });
}

export async function POST(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  try {
    const input = collectionWriteSchema.parse(await request.json());
    const collection = await mutateCatalog((catalog) => {
      const created = createCollection(catalog, input);
      return { catalog: created.catalog, result: created.collection };
    });
    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
