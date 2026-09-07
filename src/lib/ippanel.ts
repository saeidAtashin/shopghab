import { normalizeIranPhone } from "@/lib/phone";

const DEFAULT_IPPANEL_BASE_URL = "https://edge.ippanel.com/v1";

type IppanelSendResponse = {
  data?: { message_outbox_ids?: number[] };
  meta?: {
    status?: boolean;
    message?: string;
    message_code?: string;
  };
};

export function getIppanelBaseUrl(): string {
  const fromEnv = process.env.IPPANEL_BASE_URL?.trim();
  return (fromEnv || DEFAULT_IPPANEL_BASE_URL).replace(/\/$/, "");
}

export function getIppanelSendUrl(): string {
  return `${getIppanelBaseUrl()}/api/send`;
}

/** 09123456789 (or +98/98/9…) → +989123456789 */
export function toE164Iran(phone: string): string {
  const normalized = normalizeIranPhone(phone);
  if (normalized) return `+98${normalized.slice(1)}`;
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed;
  return trimmed;
}

export function isIppanelConfigured(): boolean {
  return getIppanelConfigError() === null;
}

export function getIppanelConfigError(): string | null {
  const missing: string[] = [];

  if (!process.env.IPPANEL_API_KEY?.trim()) missing.push("IPPANEL_API_KEY");
  if (!process.env.IPPANEL_SENDER?.trim()) missing.push("IPPANEL_SENDER");
  if (!process.env.IPPANEL_OTP_PATTERN_CODE?.trim()) {
    missing.push("IPPANEL_OTP_PATTERN_CODE");
  }

  if (missing.length === 0) return null;

  return `تنظیمات IPPanel ناقص است: ${missing.join(", ")}`;
}

function getAuthorizationHeader(): string {
  const apiKey = process.env.IPPANEL_API_KEY?.trim() ?? "";
  if (apiKey.toLowerCase().startsWith("bearer ")) {
    return apiKey;
  }
  return apiKey;
}

/**
 * Sends OTP via IPPanel Edge API:
 * POST https://edge.ippanel.com/v1/api/send
 * Pattern: «کد ورود شما: %otp% تست @shopghab.ir #%otpconfirm%»
 */
export async function sendLoginOtpPattern(
  phone: string,
  otpCode: string,
): Promise<void> {
  const fromNumber = process.env.IPPANEL_SENDER?.trim();
  const patternCode = process.env.IPPANEL_OTP_PATTERN_CODE?.trim();
  const sendUrl = getIppanelSendUrl();

  if (!isIppanelConfigured() || !fromNumber || !patternCode) {
    throw new Error("IPPANEL_NOT_CONFIGURED");
  }

  const payload = {
    sending_type: "pattern",
    from_number: fromNumber,
    code: patternCode,
    recipients: [toE164Iran(phone)],
    params: {
      otp: otpCode,
      otpconfirm: otpCode,
    },
  };

  const response = await fetch(sendUrl, {
    method: "POST",
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data: IppanelSendResponse;
  try {
    data = (await response.json()) as IppanelSendResponse;
  } catch {
    throw new Error(`IPPANEL_INVALID_RESPONSE (${response.status}) @ ${sendUrl}`);
  }

  if (!response.ok || !data.meta?.status) {
    const detail = data.meta?.message ?? `HTTP ${response.status}`;
    throw new Error(`IPPANEL_SEND_FAILED @ ${sendUrl}: ${detail}`);
  }
}
