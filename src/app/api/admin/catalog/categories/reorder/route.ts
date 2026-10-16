import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { reorderCategories } from "@/lib/catalog/logic";
import { categoryReorderSchema } from "@/lib/catalog/schema";
import { mutateCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  try {
    const input = categoryReorderSchema.parse(await request.json());
    await mutateCatalog((catalog) => {
      const next = reorderCategories(catalog, input.items);
      return { catalog: next, result: null };
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
