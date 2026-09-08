import { getAuthToken } from "@/lib/auth-storage";

const DEFAULT_SERVER_API_BASE_URL = "https://api.k3isonfire.ir/api/v1";
const BROWSER_API_BASE_URL = "/api/v1";
const DEFAULT_TENANT_ID = "shop-ghab";

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) {
    return normalizeBaseUrl(configured);
  }

  if (typeof window !== "undefined") {
    return BROWSER_API_BASE_URL;
  }

  return normalizeBaseUrl(
    process.env.API_BASE_URL?.trim() || DEFAULT_SERVER_API_BASE_URL,
  );
}

export function getTenantId(): string {
  return process.env.NEXT_PUBLIC_API_TENANT_ID?.trim() || DEFAULT_TENANT_ID;
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const cleanedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${cleanedPath}`;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ApiRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  auth?: boolean;
  next?: { revalidate?: number | false; tags?: string[] };
};

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { auth = true, signal: userSignal, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers ?? {});
  headers.set("X-Tenant-ID", getTenantId());
  const token = auth ? getAuthToken() : null;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const timeoutSignal = AbortSignal.timeout(10_000);
  const signal =
    userSignal && typeof AbortSignal.any === "function"
      ? AbortSignal.any([userSignal, timeoutSignal])
      : (userSignal ?? timeoutSignal);

  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    headers,
    signal,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof (payload as { message?: unknown }).message === "string"
        ? (payload as { message: string }).message
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
