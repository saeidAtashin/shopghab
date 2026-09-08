const PERSIAN_CHAR_MAP: Record<string, string> = {
  ي: "ی",
  ك: "ک",
  ة: "ه",
  أ: "ا",
  إ: "ا",
  آ: "ا",
};

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));
}

export function normalizeSearchQuery(query: string): string {
  let normalized = query.trim().toLowerCase();

  for (const [from, to] of Object.entries(PERSIAN_CHAR_MAP)) {
    normalized = normalized.replaceAll(from, to);
  }

  normalized = normalizeDigits(normalized);

  return normalized.replace(/\s+/g, " ");
}

export function tokenizeSearchQuery(value: string): string[] {
  return normalizeSearchQuery(value)
    .split(/[\s,/|+]+/)
    .filter(Boolean);
}
