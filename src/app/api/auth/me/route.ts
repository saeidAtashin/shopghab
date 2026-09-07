import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ success: true, user: null });
  }

  return NextResponse.json({ success: true, user });
}
