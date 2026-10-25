import type { EditorTab } from "@/app/components/case-editor/EditorPageClient";

export type EditorGuideStep =
  | { kind: "modal"; title: string; body: string }
  | {
      kind: "spotlight";
      target: string;
      title: string;
      body: string;
      tab?: EditorTab;
    };

export const EDITOR_GUIDE_STEPS: EditorGuideStep[] = [
  {
    kind: "modal",
    title: "به ویرایشگر قاب خوش آمدید",
    body: "این راهنما ابزارهای طراحی را معرفی می‌کند. با «بعدی» پیش بروید یا هر وقت خواستید «رد کردن» بزنید.",
  },
  {
    kind: "spotlight",
    target: "canvas",
    title: "پیش‌نمایش قاب",
    body: "اینجا طرح روی قاب را می‌بینید. لایه‌ها را لمس یا کلیک کنید تا انتخاب شوند.",
  },
  {
    kind: "spotlight",
    target: "tab-layers",
    tab: "layers",
    title: "لایه‌ها",
    body: "ترتیب، مخفی‌کردن، کپی و حذف لایه‌های طراحی.",
  },
  {
    kind: "spotlight",
    target: "tab-text",
    tab: "text",
    title: "متن",
    body: "افزودن و ویرایش متن روی قاب — فونت، رنگ و اندازه.",
  },
  {
    kind: "spotlight",
    target: "tab-stickers",
    tab: "stickers",
    title: "طرح",
    body: "اولین طرح تمام قاب را می‌پوشاند و طرح‌های بعدی کوچک روی آن می‌نشینند.",
  },
  {
    kind: "spotlight",
    target: "tab-upload",
    tab: "upload",
    title: "تصویر",
    body: "آپلود عکس و استفاده از ابزار ویرایش تصویر.",
  },
  {
    kind: "spotlight",
    target: "tab-design-for-you",
    tab: "design-for-you",
    title: "طراحی برای شما",
    body: "درخواست طراحی اختصاصی از تیم ما.",
  },
  {
    kind: "spotlight",
    target: "tab-description",
    tab: "description",
    title: "توضیحات",
    body: "یادداشت برای سفارش — توضیحات اضافه برای تیم تولید.",
  },
  {
    kind: "spotlight",
    target: "toolbar",
    title: "ابزارهای بالا",
    body: "خروج، بازگشت، پیش‌نمایش و ذخیره طراحی.",
  },
  {
    kind: "spotlight",
    target: "buy",
    title: "خرید",
    body: "افزودن به سبد خرید و ثبت سفارش قاب.",
  },
  {
    kind: "modal",
    title: "آماده‌اید!",
    body: "هر وقت خواستید از دکمه «راهنما» در نوار ابزار دوباره این راهنما را ببینید.",
  },
];
