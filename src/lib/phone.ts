/** Canonical Iranian mobile: 09XXXXXXXXX (11 digits). */
export const IRAN_MOBILE_CANONICAL = /^09\d{9}$/;

/**
 * Keeps digits, an optional leading +, and spaces/dashes between digits while typing.
 */
export function sanitizePhoneInput(value: string): string {
  let result = "";

  for (const ch of value) {
    if (ch >= "0" && ch <= "9") {
      result += ch;
      continue;
    }
    if (ch === "+" && result.length === 0) {
      result += ch;
      continue;
    }
    if ((ch === " " || ch === "-") && result.length > 0) {
      result += ch;
    }
  }

  return result.slice(0, 18);
}

/**
 * Normalizes flexible input to 09XXXXXXXXX.
 * Accepts: +98..., 98..., 0..., 9... (10 digits).
 */
export function normalizeIranPhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/\D/g, "");

  if (digits.startsWith("0098")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("98")) {
    const national = digits.slice(2);
    if (national.length === 10 && national.startsWith("9")) {
      digits = `0${national}`;
    }
  } else if (digits.length === 10 && digits.startsWith("9")) {
    digits = `0${digits}`;
  }

  if (IRAN_MOBILE_CANONICAL.test(digits)) {
    return digits;
  }

  return null;
}

export function isValidIranPhone(input: string): boolean {
  return normalizeIranPhone(input) !== null;
}

export const IRAN_PHONE_INVALID_MESSAGE =
  "شماره موبایل معتبر نیست (مثال: 09123456789، +989123456789، 989123456789، 9123456789)";

/** OpenAPI: flexible input; server stores 09XXXXXXXXX. */
export const IRAN_PHONE_OPENAPI_PATTERN =
  "^(?:\\+?98|0)?9\\d{9}$";

export const IRAN_PHONE_OPENAPI_DESCRIPTION =
  "Iranian mobile. Accepts +98..., 98..., 09..., or 9... (10 digits). Normalized to 09XXXXXXXXX.";
