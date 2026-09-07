import { NextResponse } from "next/server";
import { getAuthSecretConfigError } from "@/lib/auth-secret";
import { prisma } from "@/lib/db";
import { resolveRoleForPhone, setSession } from "@/lib/auth";
import {
  IRAN_PHONE_INVALID_MESSAGE,
  normalizeIranPhone,
} from "@/lib/phone";
import { verifyOtpCookie } from "@/lib/otp-cookie";

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
    const code = String(body.code ?? "").trim();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: IRAN_PHONE_INVALID_MESSAGE },
        { status: 400 },
      );
    }

    if (!code) {
      return NextResponse.json(
        { success: false, message: "کد تایید الزامی است" },
        { status: 400 },
      );
    }

    const verification = await verifyOtpCookie(phone, code);

    if (!verification.ok) {
      if (verification.reason === "missing") {
        return NextResponse.json(
          { success: false, message: "کد تایید یافت نشد. دوباره درخواست ارسال کد دهید." },
          { status: 400 },
        );
      }

      if (verification.reason === "expired") {
        return NextResponse.json(
          { success: false, message: "کد تایید منقضی شده است" },
          { status: 400 },
        );
      }

      if (verification.reason === "phone_mismatch") {
        return NextResponse.json(
          { success: false, message: "شماره موبایل با کد ارسال‌شده مطابقت ندارد" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { success: false, message: "کد تایید اشتباه است" },
        { status: 401 },
      );
    }

    const role = resolveRoleForPhone(phone);

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: role === "admin" ? "مدیر" : "کاربر", phone, role },
      });
    } else if (user.role !== role) {
      user = await prisma.user.update({
        where: { phone },
        data: { role },
      });
    }

    await setSession({ name: user.name, role, phone });

    return NextResponse.json({
      success: true,
      user: { name: user.name, role, phone },
    });
  } catch (error) {
    console.error("POST /api/auth/otp/verify failed:", error);
    return NextResponse.json(
      { success: false, message: "خطا در تایید کد" },
      { status: 500 },
    );
  }
}
