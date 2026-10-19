import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { moveDesign } from "@/lib/catalog/logic";
import { designMoveSchema } from "@/lib/catalog/schema";
import { mutateCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  try {
    const input = designMoveSchema.parse(await request.json());
    await mutateCatalog((catalog) => {
      const next = moveDesign(catalog, id, input.categoryId, input.direction);
      return { catalog: next, result: null };
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
