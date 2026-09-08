import { Cpu, Monitor, Gamepad2, Cable } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Brand } from "../../lib/brand-theme";
import {
  mergeServiceSeoContent,
  type ServiceSeoContent,
} from "./service-seo-content";

const SERVICE_PLACEHOLDER_IMAGE = "/cases/og-default.jpg";
const PS5_SERVICE_IMAGE = "/icons/ps5.svg";
const PS4_SERVICE_IMAGE = "/icons/ps4.svg";
const XBOX_SERVICE_IMAGE = "/icons/xbox.svg";

export interface Service extends ServiceSeoContent {
  slug: string;
  brand: Brand;

  problemtag: string;

  title: string;
  shortTitle: string;

  description: string;
  longDescription: string;

  icon: LucideIcon;

  image: string;
  cover: string;

  seoTitle: string;
  seoDescription: string;

  keywords: string[];

  estimatedTime: string;
  warranty: string;
  priceRange: string;

  features: string[];
  commonIssues: { slug: string; title: string }[];
  repairSteps: string[];

  layout: string;
}

const baseServices: Omit<Service, keyof ServiceSeoContent>[] = [
  {
    slug: "ps5-repair",
    layout: "A",

    brand: "playstation",

    problemtag: "PS5",

    title: "تعمیر PS5",

    shortTitle: "PS5 Repair",

    description:
      "تعمیر تخصصی پلی استیشن 5 با قطعات اصلی، تجهیزات حرفه‌ای و ضمانت خدمات.",

    longDescription:
      "انواع خدمات تعمیر پلی استیشن 5 شامل تعمیر HDMI، تعمیر مادربرد، رفع مشکل روشن نشدن، سرویس فن، تعمیر دسته DualSense و تعویض قطعات با استفاده از تجهیزات تخصصی انجام می‌شود. تمامی مراحل تعمیر توسط تکنسین‌های حرفه‌ای و با استفاده از قطعات اصلی انجام شده و دستگاه قبل از تحویل تست کامل می‌شود.",

    icon: Cpu,

    image: PS5_SERVICE_IMAGE,

    cover: PS5_SERVICE_IMAGE,

    seoTitle: "تعمیر PS5 | تعمیر تخصصی پلی استیشن 5 با ضمانت",

    keywords: [
      "تعمیر ps5",
      "تعمیر پلی استیشن 5",
      "تعمیر hdmi ps5",
      "تعمیر دسته ps5",
    ],

    estimatedTime: "1 تا 5 روز کاری",

    warranty: "30 روز ضمانت تست",

    priceRange: "از 800 هزار تومان",

    features: [
      "استفاده از قطعات اورجینال",
      "عیب‌یابی تخصصی",
      "تحویل سریع",
      "ضمانت خدمات",
      "تجهیزات حرفه‌ای BGA",
      "تست کامل قبل تحویل",
    ],

    commonIssues: [
      { title: "روشن نشدن PS5", slug: "ps5-not-turning-on" },
      { title: "خرابی HDMI", slug: "ps5-hdmi-port-damage" },
      { title: "داغ شدن بیش از حد", slug: "ps5-overheating" },
      { title: "خاموش شدن ناگهانی", slug: "ps5-random-shutdown" },
      { title: "صدای زیاد فن", slug: "ps5-loud-fan-noise" },
      {
        title: "خرابی دسته DualSense",
        slug: "ps5-dualsense-controller-problem",
      },
      { title: "اتصال نداشتن به اینترنت", slug: "ps5-wifi-connection-problem" },
      { title: "مشکل درایو دیسک", slug: "ps5-disc-drive-not-working" },
    ],
    repairSteps: [
      "بررسی اولیه دستگاه",
      "عیب‌یابی تخصصی",
      "اعلام هزینه تعمیر",
      "تعمیر و تعویض قطعات",
      "تست کامل دستگاه",
      "تحویل به مشتری",
    ],
  },

  {
    slug: "ps4-repair",
    brand: "playstation",
    layout: "A",

    problemtag: "PS4",
    title: "تعمیر PS4",

    shortTitle: "PS4 Repair",

    description:
      "تعمیر تخصصی پلی استیشن 4 شامل تعمیر پاور، HDMI، فن و مادربرد.",

    longDescription:
      "خدمات تعمیر PS4 Slim و PS4 Pro با تجهیزات حرفه‌ای و تعمیر تخصصی انواع خرابی‌های سخت‌افزاری و نرم‌افزاری انجام می‌شود. تمامی دستگاه‌ها قبل از تحویل تست کامل می‌شوند تا از عملکرد صحیح آن‌ها اطمینان حاصل شود.",

    icon: Gamepad2,

    image: PS4_SERVICE_IMAGE,

    cover: PS4_SERVICE_IMAGE,

    seoTitle: "تعمیر PS4 | تعمیر پلی استیشن 4 با ضمانت",

    keywords: [
      "تعمیر ps4",
      "تعمیر پلی استیشن 4",
      "تعمیر ps4 slim",
      "تعمیر ps4 pro",
    ],

    estimatedTime: "1 تا 4 روز کاری",

    warranty: "30 روز ضمانت تست",

    priceRange: "از 600 هزار تومان",

    features: [
      "تعمیر تخصصی PS4",
      "تحویل سریع",
      "ضمانت خدمات",
      "قطعات اصلی",
      "تست کامل دستگاه",
      "عیب‌یابی حرفه‌ای",
    ],

    commonIssues: [
      { title: "روشن نشدن PS4", slug: "ps4-not-turning-on" },
      { title: "خرابی HDMI", slug: "ps4-hdmi-port-damage" },
      { title: "صدای زیاد فن", slug: "ps4-loud-fan-noise" },
      { title: "داغ شدن دستگاه", slug: "ps4-overheating" },
      { title: "خرابی هارد", slug: "ps4-hard-drive-failure" },
      { title: "مشکل اتصال اینترنت", slug: "ps4-wifi-connection-problem" },
      { title: "خاموش شدن ناگهانی", slug: "ps4-random-shutdown" },
      { title: "ارور Safe Mode", slug: "ps4-safe-mode-error" },
    ],
    repairSteps: [
      "بررسی دستگاه",
      "عیب‌یابی",
      "اعلام هزینه",
      "تعمیر تخصصی",
      "تست نهایی",
      "تحویل دستگاه",
    ],
  },

  {
    slug: "xbox-repair",
    brand: "xbox",
    layout: "A",

    problemtag: "Xbox",

    title: "تعمیر Xbox",

    shortTitle: "Xbox Repair",

    description: "تعمیر تخصصی Xbox Series X/S و Xbox One با تجهیزات حرفه‌ای.",

    longDescription:
      "انواع خدمات تعمیر Xbox شامل تعمیر HDMI، پاور، فن و رفع مشکلات سخت‌افزاری و نرم‌افزاری انجام می‌شود. تعمیرات با استفاده از قطعات باکیفیت و تجهیزات حرفه‌ای انجام شده و دستگاه قبل از تحویل تست کامل می‌شود.",

    icon: Monitor,

    image: XBOX_SERVICE_IMAGE,

    cover: XBOX_SERVICE_IMAGE,

    seoTitle: "تعمیر Xbox | تعمیر تخصصی ایکس باکس",

    keywords: ["تعمیر xbox", "تعمیر xbox series x", "تعمیر xbox one"],

    estimatedTime: "1 تا 5 روز کاری",

    warranty: "30 روز ضمانت",

    priceRange: "از 700 هزار تومان",

    features: [
      "تعمیر تخصصی Xbox",
      "تجهیزات حرفه‌ای",
      "ضمانت تعمیر",
      "پشتیبانی کامل",
      "قطعات باکیفیت",
      "تست کامل",
    ],

    commonIssues: [
      { title: "روشن نشدن Xbox", slug: "xbox-not-turning-on" },
      { title: "خرابی HDMI", slug: "xbox-hdmi-port-damage" },
      { title: "مشکل پاور", slug: "xbox-power-supply-problem" },
      { title: "صدای زیاد فن", slug: "xbox-loud-fan-noise" },
      { title: "داغ شدن دستگاه", slug: "xbox-overheating" },
      { title: "خرابی هارد", slug: "xbox-hard-drive-failure" },
      { title: "مشکل اتصال اینترنت", slug: "xbox-wifi-connection-problem" },
      { title: "کرش بازی‌ها", slug: "xbox-game-crashing" },
    ],
    repairSteps: [
      "بررسی اولیه",
      "تشخیص خرابی",
      "اعلام هزینه",
      "تعمیر",
      "تست کامل",
      "تحویل دستگاه",
    ],
  },

  {
    slug: "hdmi-repair",
    brand: "gaming",
    layout: "A",

    problemtag: "انواع کنسول",

    title: "تعمیر HDMI کنسول",

    shortTitle: "HDMI Repair",

    description: "تعمیر و تعویض سوکت HDMI انواع کنسول بازی.",

    longDescription:
      "خرابی HDMI یکی از رایج‌ترین مشکلات کنسول‌ها است که با تجهیزات تخصصی BGA تعمیر می‌شود. در صورت شکستگی یا قطعی تصویر، پورت HDMI تعویض شده و تست کامل تصویر انجام می‌شود.",

    icon: Cable,

    image: SERVICE_PLACEHOLDER_IMAGE,

    cover: SERVICE_PLACEHOLDER_IMAGE,

    seoTitle: "تعمیر HDMI کنسول | تعمیر سوکت HDMI PS5 و Xbox",

    keywords: ["تعمیر hdmi ps5", "تعمیر hdmi xbox", "تعویض سوکت hdmi"],

    estimatedTime: "1 تا 2 روز کاری",

    warranty: "ضمانت تست",

    priceRange: "از 900 هزار تومان",

    features: [
      "تعویض سوکت HDMI",
      "تست تصویر",
      "تعمیر تخصصی برد",
      "استفاده از تجهیزات BGA",
    ],

    commonIssues: [
      { title: "قطع بودن تصویر", slug: "console-no-video-signal" },
      { title: "پرش تصویر", slug: "console-screen-flickering" },
      { title: "شکستگی HDMI", slug: "console-hdmi-port-broken" },
      { title: "عدم شناسایی مانیتور", slug: "console-monitor-not-detected" },
      { title: "تصویر سیاه", slug: "console-black-screen" },
      { title: "لق بودن سوکت", slug: "console-hdmi-loose-port" },
    ],
    repairSteps: [
      "بررسی پورت",
      "باز کردن دستگاه",
      "تعویض HDMI",
      "تست تصویر",
      "تحویل دستگاه",
    ],
  },

  {
    slug: "controller-repair",
    brand: "gaming",
    layout: "A",

    problemtag: "تعمیرات دسته",

    title: "تعمیرات دسته بازی",

    shortTitle: "controller-repair",

    description:
      "تعمیر تخصصی انواع دسته بازی PS5، PS4 و Xbox شامل رفع مشکل آنالوگ، دکمه‌ها و شارژ.",

    longDescription:
      "اگر دسته بازی شما دچار مشکل در آنالوگ، دکمه‌ها، شارژ نشدن یا قطع و وصل شدن شده است، تیم ما با تجهیزات تخصصی تمامی مشکلات دسته‌های PS5، PS4 و Xbox را برطرف می‌کند. تعمیرات شامل تعویض آنالوگ، تعمیر برد، رفع مشکل دکمه‌ها و تعمیر درگاه شارژ می‌باشد.",

    icon: Gamepad2,

    image: SERVICE_PLACEHOLDER_IMAGE,

    cover: SERVICE_PLACEHOLDER_IMAGE,

    seoTitle: "تعمیر دسته PS5، PS4 و Xbox",

    keywords: [
      "تعمیر دسته ps5",
      "تعمیر دسته ps4",
      "تعمیر دسته xbox",
      "تعمیر آنالوگ دسته",
      "تعمیر joystick دسته",
    ],

    estimatedTime: "چند ساعت تا 1 روز",

    warranty: "ضمانت تعمیر دسته",

    priceRange: "از 300 هزار تومان",

    features: [
      "تعویض آنالوگ (Joystick)",
      "تعمیر یا تعویض دکمه‌ها",
      "تعمیر درگاه شارژ",
      "رفع مشکل Drift آنالوگ",
      "تعمیر برد دسته",
    ],

    commonIssues: [
      { title: "حرکت خودکار آنالوگ (Drift)", slug: "controller-analog-drift" },
      { title: "کار نکردن دکمه‌ها", slug: "controller-buttons-not-working" },
      { title: "شارژ نشدن دسته", slug: "controller-not-charging" },
      { title: "قطع و وصل شدن اتصال", slug: "controller-connection-dropping" },
      { title: "خرابی آنالوگ", slug: "controller-analog-stick-broken" },
    ],
    repairSteps: [
      "بررسی و عیب‌یابی دسته",
      "باز کردن دسته",
      "تعویض یا تعمیر قطعات معیوب",
      "بستن دسته",
      "تست کامل عملکرد",
    ],
  },
];

export const services: Service[] = baseServices.map((service) =>
  mergeServiceSeoContent(service),
);
