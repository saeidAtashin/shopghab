export const OTP_LENGTH = 4;

export function emptyOtpDigits(): string[] {
  return Array.from({ length: OTP_LENGTH }, () => "");
}

export function applyOtpInput(
  current: readonly string[],
  index: number,
  raw: string,
): { digits: string[]; focusIndex: number | null } {
  const incoming = raw.replace(/\D/g, "");
  const digits = current.slice(0, OTP_LENGTH);
  while (digits.length < OTP_LENGTH) digits.push("");

  if (!incoming) {
    digits[index] = "";
    return { digits, focusIndex: null };
  }

  const chunk = incoming.slice(0, OTP_LENGTH - index);
  for (let offset = 0; offset < chunk.length; offset += 1) {
    digits[index + offset] = chunk[offset] ?? "";
  }

  if (chunk.length > 1) {
    const emptyAt = digits.findIndex((digit) => digit === "");
    return { digits, focusIndex: emptyAt === -1 ? null : emptyAt };
  }

  return {
    digits,
    focusIndex: index < OTP_LENGTH - 1 ? index + 1 : null,
  };
}
