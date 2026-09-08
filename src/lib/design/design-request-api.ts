import { apiRequest } from "@/lib/api-client";

const LOCAL_REQUESTS_KEY = "case-design-requests";

export type DesignRequestStatus = "pending" | "in_progress" | "ready_for_review" | "completed";

export type DesignRequest = {
  id: string;
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  description: string;
  imageUrls: string[];
  contactName?: string;
  contactPhone?: string;
  status: DesignRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type DesignRequestInput = {
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  description: string;
  imageUrls: string[];
  contactName?: string;
  contactPhone?: string;
};

function readLocalRequests(): DesignRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_REQUESTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DesignRequest[];
  } catch {
    return [];
  }
}

function writeLocalRequests(requests: DesignRequest[]) {
  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(requests));
}

export async function submitDesignRequest(input: DesignRequestInput): Promise<DesignRequest> {
  const now = new Date().toISOString();
  const payload = { ...input };

  try {
    return await apiRequest<DesignRequest>("/design-requests", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    const saved: DesignRequest = {
      id: `local-req-${Date.now()}`,
      ...input,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    const requests = readLocalRequests();
    requests.unshift(saved);
    writeLocalRequests(requests);
    return saved;
  }
}

export async function listDesignRequests(): Promise<DesignRequest[]> {
  try {
    return await apiRequest<DesignRequest[]>("/design-requests");
  } catch {
    return readLocalRequests();
  }
}

export function getLocalDesignRequests(): DesignRequest[] {
  return readLocalRequests();
}
