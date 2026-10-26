import { NextResponse } from "next/server";

import { parsePublicListingQuery, queryPublicDesigns } from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = parsePublicListingQuery({
    q: url.searchParams.get("q") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    attr: url.searchParams.get("attr") ?? undefined,
  });
  const result = queryPublicDesigns(readCatalog(), {
    q: query.q,
    sort: query.sort,
    page: query.page,
    pageSize: PAGE_SIZE,
    attributeValueIds: query.attrs,
  });
  return NextResponse.json({
    items: result.items,
    page: result.page,
    pageCount: result.pageCount,
    total: result.total,
  });
}
