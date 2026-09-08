import type { StickerPack } from "./types";

import { DESIGNED_STICKER_PACK } from "./designed.stickers.generated";

export const STICKER_PACKS: StickerPack[] =
  DESIGNED_STICKER_PACK.stickers.length > 0
    ? [{ ...DESIGNED_STICKER_PACK, name: "طراحی‌های آماده" }]
    : [];

export function getStickerPacks(): StickerPack[] {
  return STICKER_PACKS;
}
