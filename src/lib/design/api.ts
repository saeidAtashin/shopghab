import { apiRequest } from "@/lib/api-client";

import { generateShareToken, type DesignDocument, type SavedDesign } from "./types";

const LOCAL_DESIGNS_KEY = "case-designs";

function readLocalDesigns(): SavedDesign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_DESIGNS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedDesign[];
  } catch {
    return [];
  }
}

function writeLocalDesigns(designs: SavedDesign[]) {
  localStorage.setItem(LOCAL_DESIGNS_KEY, JSON.stringify(designs));
}

export async function saveDesign(doc: DesignDocument): Promise<SavedDesign> {
  const now = new Date().toISOString();
  const payload = {
    ...doc,
    name: doc.name || "طراحی بدون نام",
    shareToken: doc.shareToken || generateShareToken(),
  };

  try {
    return await apiRequest<SavedDesign>("/designs", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    const saved: SavedDesign = {
      ...payload,
      id: doc.id || `local-${Date.now()}`,
      shareToken: payload.shareToken,
      name: payload.name,
      createdAt: doc.createdAt || now,
      updatedAt: now,
    };
    const designs = readLocalDesigns();
    const idx = designs.findIndex((d) => d.id === saved.id);
    if (idx >= 0) designs[idx] = saved;
    else designs.unshift(saved);
    writeLocalDesigns(designs);
    return saved;
  }
}

export async function getDesign(id: string): Promise<SavedDesign | null> {
  try {
    return await apiRequest<SavedDesign>(`/designs/${id}`);
  } catch {
    return readLocalDesigns().find((d) => d.id === id) ?? null;
  }
}

export async function getDesignByShareToken(token: string): Promise<SavedDesign | null> {
  try {
    return await apiRequest<SavedDesign>(`/designs/share/${token}`, { auth: false });
  } catch {
    return readLocalDesigns().find((d) => d.shareToken === token) ?? null;
  }
}

export async function listUserDesigns(): Promise<SavedDesign[]> {
  try {
    return await apiRequest<SavedDesign[]>("/designs");
  } catch {
    return readLocalDesigns();
  }
}

export function getLocalDesigns(): SavedDesign[] {
  return readLocalDesigns();
}
