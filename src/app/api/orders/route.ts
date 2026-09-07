import { NextResponse } from "next/server";
import { createCaseOrder, serializeOrder, type DesignType } from "@/lib/orders";
import {
  IRAN_PHONE_INVALID_MESSAGE,
  normalizeIranPhone,
} from "@/lib/phone";
import { saveOrderImage } from "@/lib/uploads";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const phone = normalizeIranPhone(String(formData.get("phone") ?? ""));
    if (!phone) {
      return NextResponse.json(
        { success: false, message: IRAN_PHONE_INVALID_MESSAGE },
        { status: 400 },
      );
    }

    const designTypeRaw = String(formData.get("designType") ?? "custom").trim();
    const designType: DesignType =
      designTypeRaw === "predesigned" ? "predesigned" : "custom";

    let imageUrl = "";
    const imageFile = formData.get("image");

    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        imageUrl = await saveOrderImage(imageFile);
      } catch (error) {
        const message =
          error instanceof Error && error.message === "IMAGE_TOO_LARGE"
            ? "حجم تصویر بیش از حد مجاز است"
            : "فرمت تصویر پشتیبانی نمی‌شود";

        return NextResponse.json(
          { success: false, message },
          { status: 400 },
        );
      }
    }

    const order = await createCaseOrder({
      name: String(formData.get("name") ?? "").trim(),
      phone,
      phoneModel: String(formData.get("phoneModel") ?? "مدل نامشخص").trim(),
      designType,
      caseSlug: String(formData.get("caseSlug") ?? "").trim(),
      caseTitle: String(formData.get("caseTitle") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      imageUrl,
    });

    return NextResponse.json({
      success: true,
      trackingCode: order.trackingCode,
      order: serializeOrder(order),
    });
  } catch (error) {
    console.error("POST /api/orders failed:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت سفارش" },
      { status: 500 },
    );
  }
}
