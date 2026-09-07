import { NextResponse } from "next/server";
import { setSession, verifyAdminCredentials } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "نام کاربری و رمز عبور الزامی است" },
        { status: 400 },
      );
    }

    if (verifyAdminCredentials(username, password)) {
      await setSession({ name: "Admin", role: "admin" });
      return NextResponse.json({
        success: true,
        user: { name: "Admin", role: "admin" },
      });
    }

    await setSession({ name: username, role: "user" });
    return NextResponse.json({
      success: true,
      user: { name: username, role: "user" },
    });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ورود" },
      { status: 500 },
    );
  }
}
