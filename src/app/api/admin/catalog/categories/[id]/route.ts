import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { updateCategory, updateCategoryStatus } from "@/lib/catalog/logic";
import { categoryStatusPatchSchema, categoryWriteSchema } from "@/lib/catalog/schema";
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
    const body: unknown = await request.json();
    const statusPatch = categoryStatusPatchSchema.safeParse(body);
    const category = await mutateCatalog((catalog) => {
      const updated = statusPatch.success
        ? updateCategoryStatus(catalog, id, statusPatch.data.status)
        : updateCategory(catalog, id, categoryWriteSchema.parse(body));
      return { catalog: updated.catalog, result: updated.category };
    });
    return NextResponse.json({ category });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
