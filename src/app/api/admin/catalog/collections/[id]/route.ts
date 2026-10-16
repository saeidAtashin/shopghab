import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { updateCollection } from "@/lib/catalog/logic";
import { collectionWriteSchema } from "@/lib/catalog/schema";
import { mutateCatalog, readCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  const collection = readCatalog().collections.find((item) => item.id === id);
  if (!collection) {
    return NextResponse.json({ error: "کالکشن پیدا نشد" }, { status: 404 });
  }
  return NextResponse.json({ collection });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  try {
    const input = collectionWriteSchema.parse(await request.json());
    const collection = await mutateCatalog((catalog) => {
      const updated = updateCollection(catalog, id, input);
      return { catalog: updated.catalog, result: updated.collection };
    });
    return NextResponse.json({ collection });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
