import { NextResponse } from "next/server";
import { buildOpenApiDocument, resolveApiBaseUrl } from "@/lib/openapi";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const baseUrl = resolveApiBaseUrl(origin);
  return NextResponse.json(buildOpenApiDocument(baseUrl));
}
