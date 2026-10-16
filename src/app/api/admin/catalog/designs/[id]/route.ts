import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { updateDesign, updateDesignStatus } from "@/lib/catalog/logic";
import { designStatusPatchSchema, designWriteSchema } from "@/lib/catalog/schema";
import { mutateCatalog, readCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  const design = readCatalog().designs.find((item) => item.id === id);
  if (!design) {
    return NextResponse.json({ error: "طرح پیدا نشد" }, { status: 404 });
  }
  return NextResponse.json({ design });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  try {
    const body: unknown = await request.json();
    const statusPatch = designStatusPatchSchema.safeParse(body);
    const design = await mutateCatalog((catalog) => {
      const updated = statusPatch.success
        ? updateDesignStatus(catalog, id, statusPatch.data.status)
        : updateDesign(catalog, id, designWriteSchema.parse(body));
      return { catalog: updated.catalog, result: updated.design };
    });
    return NextResponse.json({ design });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
