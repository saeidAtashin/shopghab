import { seedRecordId } from "./ids";
import type {
  AttributeGroupRecord,
  AttributeValueRecord,
  CategoryRecord,
  CollectionRecord,
  DesignCatalog,
} from "./schema";

type SeedChild = { name: string; slug: string };
type SeedCategory = { name: string; slug: string; children: SeedChild[] };
type SeedValue = { key: string; name: string };
type SeedGroup = { name: string; slug: string; values: SeedValue[] };
type SeedCollection = { name: string; slug: string; description: string };

const CATEGORIES: SeedCategory[] = [
  {
    name: "انتزاعی و مینیمال",
    slug: "abstract-minimal",
    children: [
      { name: "مینیمال", slug: "minimal" },
      { name: "هندسی و اشکال", slug: "geometric-shapes" },
      { name: "خطوط و Line Art", slug: "line-art" },
      { name: "آبستره و اکسپرسیو", slug: "expressive-abstract" },
      { name: "مونوکروم و سیاه‌وسفید", slug: "monochrome" },
      { name: "گرادیان و رنگ‌های محو", slug: "gradient" },
      { name: "بافت و تکسچر", slug: "texture" },
      { name: "سورئال", slug: "surreal" },
      { name: "مدرن و معاصر", slug: "modern-contemporary" },
      { name: "ساده و خلوت", slug: "simple-quiet" },
    ],
  },
  {
    name: "حیوانات و طبیعت زنده",
    slug: "animals",
    children: [
      { name: "گربه", slug: "cats" },
      { name: "سگ", slug: "dogs" },
      { name: "پرندگان و طوطی", slug: "birds" },
      { name: "خرگوش", slug: "rabbits" },
      { name: "حیوانات خانگی", slug: "pets" },
      { name: "شیر، ببر و گربه‌سانان", slug: "big-cats" },
      { name: "گرگ و روباه", slug: "wolves-foxes" },
      { name: "خرس و پاندا", slug: "bears-pandas" },
      { name: "حیوانات دریایی", slug: "sea-animals" },
      { name: "پروانه و حشرات", slug: "butterflies-insects" },
      { name: "حیوانات فانتزی", slug: "fantasy-animals" },
      { name: "حیات‌وحش", slug: "wildlife" },
      { name: "دایناسورها", slug: "dinosaurs" },
      { name: "حیوانات بامزه و کارتونی", slug: "cute-cartoon-animals" },
    ],
  },
  {
    name: "گل، گیاه و طبیعت",
    slug: "nature",
    children: [
      { name: "گل رز", slug: "roses" },
      { name: "گل‌های وحشی", slug: "wildflowers" },
      { name: "گل‌های مینیمال", slug: "minimal-flowers" },
      { name: "شکوفه و شکوفه‌ی گیلاس", slug: "blossoms" },
      { name: "برگ و گیاهان آپارتمانی", slug: "leaves-houseplants" },
      { name: "کاکتوس و ساکولنت", slug: "cactus-succulents" },
      { name: "جنگل و درخت", slug: "forest-trees" },
      { name: "کوهستان", slug: "mountains" },
      { name: "دریا و ساحل", slug: "sea-beach" },
      { name: "آسمان و ابر", slug: "sky-clouds" },
      { name: "ماه و ستاره", slug: "moon-stars" },
      { name: "غروب و طلوع", slug: "sunset-sunrise" },
      { name: "طبیعت فانتزی", slug: "fantasy-nature" },
      { name: "قارچ و باغ جادویی", slug: "mushrooms-magic-garden" },
    ],
  },
  {
    name: "فانتزی، کارتونی و کیوت",
    slug: "fantasy-cute",
    children: [
      { name: "کیوت و بامزه", slug: "cute" },
      { name: "Kawaii", slug: "kawaii" },
      { name: "شخصیت‌های خیالی", slug: "fictional-characters" },
      { name: "پری و جادو", slug: "fairies-magic" },
      { name: "فضایی و موجودات فضایی", slug: "space-creatures" },
      { name: "اژدها و موجودات افسانه‌ای", slug: "dragons-mythical" },
      { name: "فانتزی تاریک", slug: "dark-fantasy" },
      { name: "عروسکی و Plush", slug: "plush" },
      { name: "استیکری و Doodle", slug: "sticker-doodle" },
      { name: "کارتونی", slug: "cartoon" },
      { name: "کمیک", slug: "comic" },
      { name: "فانتزی رنگی", slug: "colorful-fantasy" },
      { name: "فانتزی گوتیک", slug: "gothic-fantasy" },
    ],
  },
  {
    name: "انیمه و مانگا",
    slug: "anime-manga",
    children: [
      { name: "انیمه‌ی اکشن", slug: "anime-action" },
      { name: "انیمه‌ی عاشقانه", slug: "anime-romance" },
      { name: "فانتزی و ایسکای", slug: "anime-isekai" },
      { name: "دارک و گوتیک", slug: "anime-dark" },
      { name: "شخصیت‌های دختر", slug: "anime-girls" },
      { name: "شخصیت‌های پسر", slug: "anime-boys" },
      { name: "چشم و پرتره‌ی انیمه", slug: "anime-portraits" },
      { name: "مانگا سیاه‌وسفید", slug: "manga-bw" },
      { name: "چیبی", slug: "chibi" },
      { name: "استایل پیکسلی و گیم", slug: "anime-pixel" },
      { name: "انیمه‌ی رترو", slug: "anime-retro" },
      { name: "فرهنگ اوتاکو", slug: "otaku" },
    ],
  },
  {
    name: "گیمینگ و سرگرمی",
    slug: "gaming",
    children: [
      { name: "گیمینگ عمومی", slug: "gaming-general" },
      { name: "کنترلر و کنسول", slug: "controllers-consoles" },
      { name: "پیکسل آرت", slug: "pixel-art" },
      { name: "رترو گیمینگ", slug: "retro-gaming" },
      { name: "سایبرپانک", slug: "cyberpunk" },
      { name: "فانتزی گیمینگ", slug: "gaming-fantasy" },
      { name: "بازی‌های ماجراجویی", slug: "adventure-games" },
      { name: "بازی‌های مسابقه‌ای", slug: "racing-games" },
      { name: "بازی‌های ورزشی", slug: "sports-games" },
      { name: "طراحی‌های الهام‌گرفته از بازی‌ها", slug: "game-inspired" },
    ],
  },
  {
    name: "هنر و فرهنگ ایرانی",
    slug: "iranian-art",
    children: [
      { name: "مینیاتور ایرانی", slug: "persian-miniature" },
      { name: "کاشی‌کاری", slug: "tilework" },
      { name: "اسلیمی و ختایی", slug: "eslimi" },
      { name: "نقوش سنتی", slug: "traditional-motifs" },
      { name: "فرش و گلیم", slug: "carpet-kilim" },
      { name: "خوشنویسی فارسی", slug: "persian-calligraphy" },
      { name: "اشعار فارسی", slug: "persian-poetry" },
      { name: "حافظ، سعدی، مولانا و خیام", slug: "classical-poets" },
      { name: "شاهنامه و اسطوره‌های ایرانی", slug: "shahnameh" },
      { name: "ایران باستان", slug: "ancient-iran" },
      { name: "معماری ایرانی", slug: "persian-architecture" },
      { name: "نمادهای ایرانی", slug: "iranian-symbols" },
      { name: "شهرهای ایران", slug: "iranian-cities" },
      { name: "هنر معاصر ایرانی", slug: "contemporary-iranian-art" },
    ],
  },
  {
    name: "مذهبی و معنوی",
    slug: "spiritual",
    children: [
      { name: "خوشنویسی مذهبی", slug: "religious-calligraphy" },
      { name: "خطاطی و نقوش اسلامی", slug: "islamic-patterns" },
      { name: "هندسه‌ی اسلامی", slug: "islamic-geometry" },
      { name: "معماری مذهبی", slug: "religious-architecture" },
      { name: "ذکر و عبارات معنوی", slug: "spiritual-phrases" },
      { name: "ماه رمضان", slug: "ramadan" },
      { name: "عید فطر", slug: "eid-fitr" },
      { name: "محرم و مناسبت‌های مذهبی", slug: "muharram" },
      { name: "طرح‌های معنوی مینیمال", slug: "minimal-spiritual" },
    ],
  },
  {
    name: "عشق و روابط",
    slug: "love",
    children: [
      { name: "عاشقانه", slug: "romantic" },
      { name: "قلب و گل", slug: "hearts-flowers" },
      { name: "زوج‌ها", slug: "couples" },
      { name: "عشق مینیمال", slug: "minimal-love" },
      { name: "دوستی", slug: "friendship" },
      { name: "عشق از راه دور", slug: "long-distance" },
      { name: "خواهر و برادر", slug: "siblings" },
      { name: "خانواده", slug: "family" },
      { name: "روابط بامزه", slug: "cute-relationships" },
      { name: "عشق دارک", slug: "dark-love" },
      { name: "هدیه‌ی زوج‌ها", slug: "couple-gifts" },
    ],
  },
  {
    name: "تایپوگرافی و نوشته",
    slug: "typography",
    children: [
      { name: "تایپوگرافی فارسی", slug: "persian-type" },
      { name: "تایپوگرافی انگلیسی", slug: "english-type" },
      { name: "نقل‌قول و جمله", slug: "quotes" },
      { name: "انگیزشی", slug: "motivational" },
      { name: "طنز و میم", slug: "humor-memes" },
      { name: "طعنه و کنایه", slug: "sarcasm" },
      { name: "کلمات تک‌واژه‌ای", slug: "single-words" },
      { name: "حروف و الفبا", slug: "letters-alphabet" },
      { name: "اعداد و تاریخ", slug: "numbers-dates" },
      { name: "دست‌نویس", slug: "handwritten" },
      { name: "فونت رترو", slug: "retro-fonts" },
      { name: "نام و حرف اول اسم", slug: "initials" },
    ],
  },
  {
    name: "لوکس و کلاسیک",
    slug: "luxury",
    children: [
      { name: "مشکی و طلایی", slug: "black-gold" },
      { name: "مرمر و سنگ", slug: "marble-stone" },
      { name: "چرم و بافت", slug: "leather-texture" },
      { name: "کلاسیک", slug: "classic" },
      { name: "آرت دکو", slug: "art-deco" },
      { name: "باروک", slug: "baroque" },
      { name: "وینتیج لوکس", slug: "vintage-luxury" },
      { name: "طرح‌های جواهرگونه", slug: "jewel-like" },
      { name: "نقوش تزئینی", slug: "ornamental" },
      { name: "مینیمال لوکس", slug: "minimal-luxury" },
    ],
  },
  {
    name: "رترو، وینتیج و نوستالژی",
    slug: "retro",
    children: [
      { name: "دهه‌ی ۷۰ میلادی", slug: "seventies" },
      { name: "دهه‌ی ۸۰ و ۹۰ میلادی", slug: "eighties-nineties" },
      { name: "رترو پاپ", slug: "retro-pop" },
      { name: "کلاژ", slug: "collage" },
      { name: "فیلم و عکاسی آنالوگ", slug: "analog-film" },
      { name: "گرانج", slug: "grunge" },
      { name: "پانک", slug: "punk" },
      { name: "دارک آکادمیا", slug: "dark-academia" },
      { name: "کوکی و نوستالژیک", slug: "cozy-nostalgia" },
      { name: "Y2K", slug: "y2k" },
      { name: "پاپ آرت", slug: "pop-art" },
    ],
  },
  {
    name: "خیابانی و آلترناتیو",
    slug: "street",
    children: [
      { name: "گرافیتی", slug: "graffiti" },
      { name: "اسکیت", slug: "skate" },
      { name: "هیپ‌هاپ", slug: "hip-hop" },
      { name: "پانک و راک", slug: "punk-rock" },
      { name: "آلترناتیو", slug: "alternative" },
      { name: "استریت‌ور", slug: "streetwear" },
      { name: "تایپوگرافی خیابانی", slug: "street-type" },
      { name: "طرح‌های تیره", slug: "dark-designs" },
      { name: "کلاژ شهری", slug: "urban-collage" },
      { name: "استایل صنعتی", slug: "industrial" },
    ],
  },
  {
    name: "ورزش و خودرو",
    slug: "sports-motors",
    children: [
      { name: "فوتبال", slug: "football" },
      { name: "بسکتبال", slug: "basketball" },
      { name: "ورزش‌های رزمی", slug: "martial-arts" },
      { name: "بدنسازی", slug: "fitness" },
      { name: "اسکیت و دوچرخه", slug: "skate-bike" },
      { name: "اتومبیل اسپرت", slug: "sports-cars" },
      { name: "خودروهای کلاسیک", slug: "classic-cars" },
      { name: "موتورسیکلت", slug: "motorcycles" },
      { name: "مسابقات اتومبیل‌رانی", slug: "auto-racing" },
      { name: "طرح‌های مسابقه‌ای", slug: "racing-designs" },
    ],
  },
  {
    name: "موسیقی، هنر و سبک زندگی",
    slug: "lifestyle",
    children: [
      { name: "موسیقی و ساز", slug: "music" },
      { name: "هدفون و صدا", slug: "headphones" },
      { name: "سینما و هنر تصویری", slug: "cinema" },
      { name: "کتاب و مطالعه", slug: "books" },
      { name: "قهوه و کافه", slug: "coffee" },
      { name: "سفر و گردشگری", slug: "travel" },
      { name: "عکاسی", slug: "photography" },
      { name: "مد و فشن", slug: "fashion" },
      { name: "غذا و نوشیدنی", slug: "food-drink" },
      { name: "کار و سرگرمی", slug: "work-fun" },
      { name: "تکنولوژی", slug: "technology" },
      { name: "نجوم و علم", slug: "astronomy-science" },
    ],
  },
  {
    name: "رنگ و الگو",
    slug: "color-pattern",
    children: [
      { name: "تک‌رنگ", slug: "single-color" },
      { name: "پاستلی", slug: "pastel" },
      { name: "رنگارنگ", slug: "colorful" },
      { name: "مشکی و سفید", slug: "black-white" },
      { name: "صورتی", slug: "pink" },
      { name: "آبی", slug: "blue" },
      { name: "سبز", slug: "green" },
      { name: "قرمز", slug: "red" },
      { name: "بنفش", slug: "purple" },
      { name: "نئون", slug: "neon" },
      { name: "راه‌راه", slug: "stripes" },
      { name: "چهارخانه", slug: "plaid" },
      { name: "خال‌خالی", slug: "polka-dots" },
      { name: "شطرنجی", slug: "checkerboard" },
      { name: "الگوهای تکرارشونده", slug: "repeating-patterns" },
    ],
  },
  {
    name: "شخصی‌سازی",
    slug: "personalization",
    children: [
      { name: "چاپ اسم", slug: "name-print" },
      { name: "چاپ عکس", slug: "photo-print" },
      { name: "چاپ متن اختصاصی", slug: "custom-text" },
      { name: "حروف اول اسم", slug: "monogram" },
      { name: "طراحی اختصاصی", slug: "custom-design" },
      { name: "هدیه‌ی شخصی‌سازی‌شده", slug: "personalized-gift" },
    ],
  },
];

const ATTRIBUTE_GROUPS: SeedGroup[] = [
  {
    name: "رنگ",
    slug: "colors",
    values: [
      { key: "black", name: "مشکی" },
      { key: "white", name: "سفید" },
      { key: "red", name: "قرمز" },
      { key: "pink", name: "صورتی" },
      { key: "blue", name: "آبی" },
      { key: "green", name: "سبز" },
      { key: "yellow", name: "زرد" },
      { key: "orange", name: "نارنجی" },
      { key: "purple", name: "بنفش" },
      { key: "brown", name: "قهوه‌ای" },
      { key: "gray", name: "خاکستری" },
      { key: "gold", name: "طلایی" },
      { key: "silver", name: "نقره‌ای" },
      { key: "multicolor", name: "چندرنگ" },
    ],
  },
  {
    name: "سبک بصری",
    slug: "visual-styles",
    values: [
      { key: "minimal", name: "مینیمال" },
      { key: "abstract", name: "انتزاعی" },
      { key: "geometric", name: "هندسی" },
      { key: "cute", name: "کیوت" },
      { key: "kawaii", name: "Kawaii" },
      { key: "retro", name: "رترو" },
      { key: "vintage", name: "وینتیج" },
      { key: "luxury", name: "لوکس" },
      { key: "dark", name: "دارک" },
      { key: "gothic", name: "گوتیک" },
      { key: "modern", name: "مدرن" },
      { key: "classic", name: "کلاسیک" },
      { key: "artistic", name: "هنری" },
      { key: "line-art", name: "Line Art" },
      { key: "watercolor", name: "آبرنگ" },
      { key: "pixel", name: "پیکسل آرت" },
      { key: "collage", name: "کلاژ" },
      { key: "typography", name: "تایپوگرافی" },
    ],
  },
  {
    name: "نوع تصویر",
    slug: "image-types",
    values: [
      { key: "photo", name: "عکاسی" },
      { key: "illustration", name: "تصویرسازی" },
      { key: "painting", name: "نقاشی" },
      { key: "typography", name: "تایپوگرافی" },
      { key: "collage", name: "کلاژ" },
      { key: "line-art", name: "Line Art" },
      { key: "pattern", name: "الگوی تکرارشونده" },
      { key: "mixed", name: "ترکیبی" },
    ],
  },
  {
    name: "حال‌وهوا",
    slug: "mood",
    values: [
      { key: "happy", name: "شاد" },
      { key: "calm", name: "آرام" },
      { key: "romantic", name: "عاشقانه" },
      { key: "nostalgic", name: "نوستالژیک" },
      { key: "mysterious", name: "مرموز" },
      { key: "funny", name: "خنده‌دار" },
      { key: "bold", name: "جسور" },
      { key: "soft", name: "لطیف" },
    ],
  },
  {
    name: "زبان",
    slug: "language",
    values: [
      { key: "fa", name: "فارسی" },
      { key: "en", name: "انگلیسی" },
      { key: "none", name: "بدون متن" },
      { key: "multi", name: "چندزبانه" },
    ],
  },
  {
    name: "ویژگی طرح",
    slug: "characteristics",
    values: [
      { key: "simple", name: "ساده" },
      { key: "detailed", name: "پرجزئیات" },
      { key: "busy", name: "شلوغ" },
      { key: "repeating", name: "تکرارشونده" },
      { key: "single", name: "تک‌تصویر" },
      { key: "text", name: "دارای متن" },
      { key: "mono", name: "تک‌رنگ" },
    ],
  },
];

const CURATED =
  "فهرست منتخب فروشگاه. عضویت طرح‌ها دستی است و آمار فروش ساخته نمی‌شود.";

const COLLECTIONS: SeedCollection[] = [
  { name: "جدیدترین طرح‌ها", slug: "newest", description: CURATED },
  { name: "پرفروش‌ترین طرح‌ها", slug: "bestsellers", description: "طرح‌هایی که تیم فروشگاه برای این فهرست انتخاب کرده است. این فهرست رتبه‌بندی فروش خودکار ندارد." },
  { name: "محبوب‌ترین‌ها", slug: "popular", description: CURATED },
  { name: "پیشنهادهای تیم فروشگاه", slug: "staff-picks", description: CURATED },
  { name: "طرح‌های خاص و کمیاب", slug: "rare", description: CURATED },
  { name: "هدیه برای دختر", slug: "gift-girl", description: CURATED },
  { name: "هدیه برای پسر", slug: "gift-boy", description: CURATED },
  { name: "هدیه برای همسر و پارتنر", slug: "gift-partner", description: CURATED },
  { name: "هدیه برای دوست", slug: "gift-friend", description: CURATED },
  { name: "مناسبت خاص", slug: "occasion", description: "طرح‌های مناسبتی مثل تولد، روز مادر، روز پدر، نوروز و یلدا. عضویت طرح‌ها دستی است." },
  { name: "کالکشن‌های فصلی", slug: "seasonal", description: CURATED },
  { name: "کالکشن هنرمندان", slug: "artists", description: CURATED },
  { name: "کالکشن‌های محدود", slug: "limited", description: CURATED },
  { name: "طرح‌های اختصاصی ShopGhab", slug: "shopghab-exclusive", description: CURATED },
];

export const OCCASION_COLLECTION_SLUG = "occasion";

export const FOLDED_OCCASION_SLUGS = [
  "birthday",
  "valentine",
  "mothers-day",
  "fathers-day",
  "girls-day",
  "teachers-day",
  "nowruz",
  "yalda",
  "ramadan-eid",
  "back-to-school",
  "summer-travel",
] as const;

export const SEEDED_CATEGORY_COUNT = CATEGORIES.reduce(
  (total, category) => total + 1 + category.children.length,
  0,
);

function placeCategory(
  catalog: DesignCatalog,
  spec: { name: string; slug: string },
  parentId: string | null,
  sortOrder: number,
  now: string,
): boolean {
  const id = seedRecordId("cat", spec.slug);
  if (catalog.categories.some((category) => category.id === id)) return false;
  if (catalog.categories.some((category) => category.slug === spec.slug)) return false;
  const category: CategoryRecord = {
    id,
    name: spec.name,
    slug: spec.slug,
    parentId,
    description: `طرح‌های ${spec.name} برای چاپ روی قاب موبایل.`,
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    status: "active",
    sortOrder,
    createdAt: now,
    updatedAt: now,
  };
  catalog.categories.push(category);
  return true;
}

export function seedCatalogTaxonomy(
  catalog: DesignCatalog,
  now = new Date().toISOString(),
): { catalog: DesignCatalog; created: number } {
  const next = structuredClone(catalog);
  let created = 0;

  CATEGORIES.forEach((parent, parentIndex) => {
    if (placeCategory(next, parent, null, (parentIndex + 1) * 100, now)) created += 1;
    const parentId = seedRecordId("cat", parent.slug);
    const resolvedParent =
      next.categories.find((category) => category.id === parentId)?.id ??
      next.categories.find((category) => category.slug === parent.slug)?.id ??
      null;
    parent.children.forEach((child, childIndex) => {
      if (placeCategory(next, child, resolvedParent, childIndex + 1, now)) created += 1;
    });
  });

  ATTRIBUTE_GROUPS.forEach((group, groupIndex) => {
    const groupId = seedRecordId("grp", group.slug);
    const existingGroup =
      next.attributeGroups.find((item) => item.id === groupId) ??
      next.attributeGroups.find((item) => item.slug === group.slug);
    const resolvedGroupId = existingGroup?.id ?? groupId;
    if (!existingGroup) {
      const record: AttributeGroupRecord = {
        id: groupId,
        name: group.name,
        slug: group.slug,
        sortOrder: (groupIndex + 1) * 10,
        createdAt: now,
        updatedAt: now,
      };
      next.attributeGroups.push(record);
      created += 1;
    }
    group.values.forEach((value, valueIndex) => {
      const valueId = seedRecordId("val", `${group.slug}:${value.key}`);
      if (next.attributeValues.some((item) => item.id === valueId)) return;
      const record: AttributeValueRecord = {
        id: valueId,
        groupId: resolvedGroupId,
        name: value.name,
        sortOrder: valueIndex + 1,
        createdAt: now,
        updatedAt: now,
      };
      next.attributeValues.push(record);
      created += 1;
    });
  });

  COLLECTIONS.forEach((collection, index) => {
    const id = seedRecordId("col", collection.slug);
    if (next.collections.some((item) => item.id === id)) return;
    if (next.collections.some((item) => item.slug === collection.slug)) return;
    const record: CollectionRecord = {
      id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
      sortOrder: (index + 1) * 10,
      createdAt: now,
      updatedAt: now,
    };
    next.collections.push(record);
    created += 1;
  });

  foldOccasionCollections(next, now);

  return { catalog: next, created };
}

function foldOccasionCollections(catalog: DesignCatalog, now: string): void {
  const occasion = catalog.collections.find((item) => item.slug === OCCASION_COLLECTION_SLUG);
  if (!occasion) return;
  const foldedIds = new Set(
    catalog.collections
      .filter((item) => (FOLDED_OCCASION_SLUGS as readonly string[]).includes(item.slug))
      .map((item) => item.id),
  );
  if (foldedIds.size === 0) return;
  for (const design of catalog.designs) {
    if (!design.collectionIds.some((id) => foldedIds.has(id))) continue;
    const kept = design.collectionIds.filter((id) => !foldedIds.has(id));
    if (!kept.includes(occasion.id)) kept.push(occasion.id);
    design.collectionIds = kept;
    design.updatedAt = now;
  }
  for (const collection of catalog.collections) {
    if (!foldedIds.has(collection.id) || collection.status === "archived") continue;
    collection.status = "archived";
    collection.updatedAt = now;
  }
}
