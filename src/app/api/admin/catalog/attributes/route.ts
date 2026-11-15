import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { createAttributeWithResult, deleteAttribute, updateAttribute } from "@/lib/catalog/logic";
import { attributeCreateSchema, attributeDeleteSchema, attributeUpdateSchema } from "@/lib/catalog/schema";
import { ensureCatalogTaxonomy, mutateCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const catalog = ensureCatalogTaxonomy();
  return NextResponse.json({
    groups: [...catalog.attributeGroups].sort((a, b) => a.sortOrder - b.sortOrder),
    values: [...catalog.attributeValues].sort((a, b) => a.sortOrder - b.sortOrder),
  });
}

export async function POST(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  try {
    const input = attributeCreateSchema.parse(await request.json());
    const created = await mutateCatalog((catalog) => {
      const result = createAttributeWithResult(catalog, input);
      return { catalog: result.catalog, result };
    });
    return NextResponse.json(
      { ok: true, group: created.group ?? null, value: created.value ?? null },
      { status: 201 },
    );
  } catch (error) {
    return catalogErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  try {
    const input = attributeUpdateSchema.parse(await request.json());
    await mutateCatalog((catalog) => ({
      catalog: updateAttribute(catalog, input),
      result: null,
    }));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  try {
    const input = attributeDeleteSchema.parse(await request.json());
    await mutateCatalog((catalog) => ({
      catalog: deleteAttribute(catalog, input),
      result: null,
    }));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
