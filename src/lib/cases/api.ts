import { apiRequest } from "@/lib/api-client";

import {
  CASE_TYPES,
  getBrandBySlug,
  getCaseTypeBySlug,
  getModelBySlug,
  getModelsByBrand,
  PHONE_BRANDS,
} from "./brands.static";
import {
  hasStrongModelMatch,
  searchPhoneModels,
} from "./model-search";
import { getReadyCaseBySlug, getReadyCases } from "./ready.static";
import { getStickerPacks } from "./stickers.static";
import type { PhoneBrand, PhoneModel, ReadyCase, StickerPack } from "./types";

export async function fetchBrands(): Promise<PhoneBrand[]> {
  try {
    return await apiRequest<PhoneBrand[]>("/devices/brands", { auth: false });
  } catch {
    return PHONE_BRANDS;
  }
}

export async function fetchModels(brandSlug: string): Promise<PhoneModel[]> {
  try {
    return await apiRequest<PhoneModel[]>(`/devices/brands/${brandSlug}/models`, {
      auth: false,
    });
  } catch {
    return getModelsByBrand(brandSlug);
  }
}

export async function fetchCaseTypes(_modelSlug: string) {
  try {
    return await apiRequest(`/cases/types?model=${_modelSlug}`, { auth: false });
  } catch {
    return CASE_TYPES;
  }
}

export async function fetchReadyCases(): Promise<ReadyCase[]> {
  try {
    return await apiRequest<ReadyCase[]>("/cases/ready", { auth: false });
  } catch {
    return getReadyCases();
  }
}

export async function fetchReadyCase(slug: string): Promise<ReadyCase | undefined> {
  try {
    return await apiRequest<ReadyCase>(`/cases/ready/${slug}`, { auth: false });
  } catch {
    return getReadyCaseBySlug(slug);
  }
}

export async function fetchStickers(): Promise<StickerPack[]> {
  try {
    return await apiRequest<StickerPack[]>("/stickers", { auth: false });
  } catch {
    return getStickerPacks();
  }
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const result = await apiRequest<{ url: string }>("/uploads/images", {
      method: "POST",
      body: formData,
    });
    return result.url;
  } catch {
    return URL.createObjectURL(file);
  }
}

export {
  getBrandBySlug,
  getCaseTypeBySlug,
  getModelBySlug,
  getModelsByBrand,
  getReadyCaseBySlug,
  getReadyCases,
  getStickerPacks,
  hasStrongModelMatch,
  searchPhoneModels,
  PHONE_BRANDS,
  CASE_TYPES,
};
