import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { createCategory } from "@/lib/catalog/logic";
import { categoryWriteSchema } from "@/lib/catalog/schema";
import { mutateCatalog, readCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const categories = [...readCatalog().categories].sort((a, b) =>
    a.name.localeCompare(b.name, "fa"),
  );
  return NextResponse.json({ categories });
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
