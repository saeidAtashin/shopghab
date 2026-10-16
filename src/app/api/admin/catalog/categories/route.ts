import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { compareCategories, createCategory, directDesignCount } from "@/lib/catalog/logic";
import { categoryWriteSchema } from "@/lib/catalog/schema";
import { mutateCatalog, readCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const catalog = readCatalog();
  const categories = [...catalog.categories].sort(compareCategories);
  const designCounts = Object.fromEntries(
    categories.map((category) => [category.id, directDesignCount(catalog, category.id)]),
  );
  return NextResponse.json({ categories, designCounts });
}

export async function POST(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  try {
    const input = categoryWriteSchema.parse(await request.json());
    const category = await mutateCatalog((catalog) => {
      const created = createCategory(catalog, input);
      return { catalog: created.catalog, result: created.category };
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
