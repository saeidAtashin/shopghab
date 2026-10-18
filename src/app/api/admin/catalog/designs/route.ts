import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { createDesign, queryDesigns } from "@/lib/catalog/logic";
import { designWriteSchema } from "@/lib/catalog/schema";
import { mutateCatalog, readCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const result = queryDesigns(readCatalog(), {
    q: url.searchParams.get("q") ?? undefined,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    status:
      status === "draft" || status === "published" || status === "archived" || status === "all"
        ? status
        : "all",
    missingSeo: url.searchParams.get("missingSeo") === "1",
    missingImage: url.searchParams.get("missingImage") === "1",
    unedited: url.searchParams.get("unedited") === "1",
    page: Number(url.searchParams.get("page") ?? "1"),
    pageSize: 20,
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  try {
    const input = designWriteSchema.parse(await request.json());
    const design = await mutateCatalog((catalog) => {
      const created = createDesign(catalog, input);
      return { catalog: created.catalog, result: created.design };
    });
    return NextResponse.json({ design }, { status: 201 });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
