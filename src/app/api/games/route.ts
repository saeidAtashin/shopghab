import { NextResponse } from "next/server";

import { isGameFilter } from "@/lib/game-filters";
import {
  fetchGamesByConsole,
  isGameInstallConsole,
} from "@/lib/rawg";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const consoleSlug = searchParams.get("console")?.trim() ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "24");
  const filterParam = searchParams.get("filter")?.trim() ?? "best";

  if (!isGameInstallConsole(consoleSlug)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "پارامتر console نامعتبر است. مقادیر مجاز: ps4, ps5, xbox-one, xbox-series",
      },
      { status: 400 },
    );
  }

  if (!isGameFilter(filterParam)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "پارامتر filter نامعتبر است. مقادیر مجاز: popular, newest, best, metacritic",
      },
      { status: 400 },
    );
  }

  try {
    const result = await fetchGamesByConsole(consoleSlug, {
      page,
      pageSize,
      filter: filterParam,
    });

    return NextResponse.json({
      success: true,
      console: consoleSlug,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "RAWG_API_KEY is not configured"
        ? "سرویس بازی‌ها پیکربندی نشده است"
        : "دریافت لیست بازی‌ها با خطا مواجه شد";

    const status =
      error instanceof Error && error.message === "RAWG_API_KEY is not configured"
        ? 503
        : 502;

    return NextResponse.json({ success: false, message }, { status });
  }
}
