import { type NextRequest, NextResponse } from "next/server";

const DEFAULT_UPSTREAM = "https://api.k3isonfire.ir/api/v1";

function getUpstreamBaseUrl(): string {
  const configured = process.env.API_BASE_URL?.trim() || DEFAULT_UPSTREAM;
  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}

function buildUpstreamUrl(path: string[] | undefined, search: string): string {
  const segments = path ?? [];
  const pathname = segments.length > 0 ? `/${segments.join("/")}/` : "/";
  return `${getUpstreamBaseUrl()}${pathname}${search}`;
}

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
]);

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;
  const upstreamUrl = buildUpstreamUrl(path, request.nextUrl.search);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(upstreamUrl, init);
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
