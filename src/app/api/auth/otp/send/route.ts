import { NextResponse } from "next/server";
import { generateOtpCode } from "@/lib/auth";
import {
  getAuthSecretConfigError,
  isAuthSecretMissingError,
} from "@/lib/auth-secret";
import {
  IRAN_PHONE_INVALID_MESSAGE,
  normalizeIranPhone,
} from "@/lib/phone";
import {
  getIppanelConfigError,
  sendLoginOtpPattern,
  getIppanelSendUrl,
} from "@/lib/ippanel";
import {
  buildOtpCookieToken,
  getOtpCookieOptions,
  OTP_COOKIE_NAME,
} from "@/lib/otp-cookie";

export async function POST(req: Request) {
  try {
    const authError = getAuthSecretConfigError();
    if (authError) {
      return NextResponse.json(
        { success: false, message: authError },
        { status: 503 },
      );
    }

    const body = await req.json();
    const phone = normalizeIranPhone(String(body.phone ?? ""));

    if (!phone) {
      return NextResponse.json(
        { success: false, message: IRAN_PHONE_INVALID_MESSAGE },
        { status: 400 },
      );
    }

    const code = generateOtpCode();
    const skipSms = process.env.OTP_SKIP_SMS === "true";
    const ippanelError = getIppanelConfigError();
    let smsSent = false;

    if (skipSms) {
      console.log(`[OTP skip] ${phone} => ${code}`);
    } else if (ippanelError) {
      return NextResponse.json(
        { success: false, message: ippanelError },
        { status: 503 },
      );
    } else {
      try {
        await sendLoginOtpPattern(phone, code);
        smsSent = true;
        console.log(`[IPPanel] POST ${getIppanelSendUrl()} → ${phone}`);
      } catch (error) {
        console.error("IPPanel OTP send failed:", error);
        return NextResponse.json(
          { success: false, message: "خطا در ارسال پیامک" },
          { status: 502 },
        );
      }
    }

    const response = NextResponse.json({
      success: true,
      message: smsSent ? "کد تایید پیامک شد" : "کد تایید (بدون پیامک)",
      smsSent,
      ...(!smsSent ? { devCode: code } : {}),
    });

    response.cookies.set(
      OTP_COOKIE_NAME,
      buildOtpCookieToken(phone, code),
      getOtpCookieOptions(),
    );

    return response;
  } catch (error) {
    console.error("POST /api/auth/otp/send failed:", error);

    const message = isAuthSecretMissingError(error)
      ? "AUTH_SECRET تنظیم نشده است"
      : "خطا در ارسال کد";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
