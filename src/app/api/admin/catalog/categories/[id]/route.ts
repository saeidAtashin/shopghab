import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { updateCategory } from "@/lib/catalog/logic";
import { categoryWriteSchema } from "@/lib/catalog/schema";
import { mutateCatalog, readCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  const category = readCatalog().categories.find((item) => item.id === id);
  if (!category) {
    return NextResponse.json({ error: "دسته پیدا نشد" }, { status: 404 });
  }
  return NextResponse.json({ category });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  try {
    const input = categoryWriteSchema.parse(await request.json());
    const category = await mutateCatalog((catalog) => {
      const updated = updateCategory(catalog, id, input);
      return { catalog: updated.catalog, result: updated.category };
    });
    return NextResponse.json({ category });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
