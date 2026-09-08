export const GAME_IMAGE_BASE = "/gameimages";

/** Local game art lives on another branch — use RAWG / caller fallback only. */
const GAME_IMAGE_MAP: Record<string, readonly string[]> = {};

const SLUG_ALIASES: Record<string, string> = {};
const NAME_ALIASES: Record<string, string> = {};

function resolveCanonicalKey(slug?: string, name?: string): string | undefined {
  if (slug) {
    const fromSlug = slug.toLowerCase();
    if (SLUG_ALIASES[fromSlug]) return SLUG_ALIASES[fromSlug];
    if (GAME_IMAGE_MAP[fromSlug]) return fromSlug;
  }

  if (name) {
    const fromName = NAME_ALIASES[name.toLowerCase()];
    if (fromName) return fromName;

    const fromSlug = name
      .toLowerCase()
      .replace(/[''`]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (SLUG_ALIASES[fromSlug]) return SLUG_ALIASES[fromSlug];
    if (GAME_IMAGE_MAP[fromSlug]) return fromSlug;
  }

  return undefined;
}

export type ResolveGameImagesInput = {
  slug?: string;
  name?: string;
  fallback?: string | null;
};

export type ResolvedGameImages = {
  images: string[];
  coverImage: string | null;
};

export function resolveGameImages({
  slug,
  name,
  fallback = null,
}: ResolveGameImagesInput): ResolvedGameImages {
  const key = resolveCanonicalKey(slug, name);
  const localImages = key ? [...(GAME_IMAGE_MAP[key] ?? [])] : [];

  if (localImages.length > 0) {
    return { images: localImages, coverImage: localImages[0] };
  }

  if (fallback) {
    return { images: [fallback], coverImage: fallback };
  }

  return { images: [], coverImage: null };
}

export function getGameCoverImage(input: ResolveGameImagesInput): string | null {
  return resolveGameImages(input).coverImage;
}
