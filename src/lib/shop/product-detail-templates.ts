import { PRODUCT_CATEGORY_LABELS } from "./categories";
import { SHOP_CONSOLE_META } from "./meta";
import type {
  ProductCategory,
  ProductFaq,
  ProductFeature,
  ProductSpec,
  ShopProduct,
  ShopProductDetail,
} from "./types";

function conditionLabel(condition: ShopProduct["condition"]): string {
  return condition === "new" ? "نو و پلمپ" : "دست‌دوم تست‌شده";
}

function stockLabel(inStock: boolean): string {
  return inStock ? "موجود و آماده ارسال" : "ناموجود — امکان پیش‌سفارش";
}

function highlightsText(product: ShopProduct): string {
  if (!product.highlights?.length) return "";
  return product.highlights.join("، ");
}

function buildConsoleOverview(product: ShopProduct): string[] {
  const meta = SHOP_CONSOLE_META[product.console];
  const condition = conditionLabel(product.condition);
  const storage = product.storage ? ` با ظرفیت ${product.storage}` : "";
  const edition = product.edition ? ` (نسخه ${product.edition})` : "";
  const highlights = highlightsText(product);

  return [
    `${product.title} یکی از محبوب‌ترین گزینه‌های خرید ${meta.label} در فروشگاه کنسول ریپیر است. این دستگاه در وضعیت ${condition} عرضه می‌شود و پیش از تحویل، فرآیند تست سلامت کامل روی آن انجام می‌گیرد تا خریدار با اطمینان خاطر سفارش خود را نهایی کند. تیم فنی ما هر کنسول را از نظر روشن شدن، خروجی تصویر، خواندن دیسک یا ذخیره‌سازی دیجیتال، اتصال آنلاین، دمای کارکرد و سلامت پورت‌های HDMI و USB بررسی می‌کند.`,
    `اگر به دنبال تجربه بازی پایدار روی ${meta.subtitle} هستید، ${product.title}${edition}${storage} انتخابی متعادل بین قیمت، کیفیت و پشتیبانی پس از خرید محسوب می‌شود. ما در فروشگاه خود تمرکز ویژه‌ای روی شفافیت وضعیت کالا داریم؛ بنابراین تمام جزئیات مربوط به سلامت ظاهری، سابقه استفاده و موارد تحویلی به‌صورت شفاف در همین صفحه و هنگام تماس پشتیبانی اعلام می‌شود. ${highlights ? `ویژگی‌های برجسته این مدل شامل ${highlights} است.` : ""}`,
    `فرآیند خرید از فروشگاه کنسول ریپیر ساده و قابل پیگیری طراحی شده است. پس از ثبت سفارش، همکاران ما برای هماهنگی زمان تحویل یا ارسال با شما تماس می‌گیرند. در صورت انتخاب کنسول دست‌دوم، گزارش تست سلامت و توضیحات مربوط به هر مورد قابل بررسی در اختیار شما قرار می‌گیرد. برای خریداران تهران امکان تحویل حضوری در محل فروشگاه نیز فراهم است و برای سایر شهرها ارسال با بسته‌بندی ایمن انجام می‌شود.`,
    `علاوه بر فروش، تیم تعمیرات تخصصی کنسول ریپیر آماده ارائه مشاوره فنی پیش از خرید و پشتیبانی پس از تحویل است. اگر سوالی درباره سازگاری بازی‌ها، نیاز به ارتقای حافظه، تنظیمات شبکه یا اتصال به تلویزیون/مانیتور دارید، می‌توانید پیش از خرید با پشتیبانی تماس بگیرید. این رویکرد باعث می‌شود ${product.title} نه فقط یک خرید یک‌باره، بلکه شروع یک تجربه مطمئن از بازی خانگی باشد.`,
    `وضعیت موجودی این محصول در حال حاضر ${stockLabel(product.inStock)} است. قیمت درج‌شده در صفحه به‌روز است و در صورت وجود تخفیف یا قیمت قبلی، هر دو مقدار برای مقایسه نمایش داده می‌شود. پیشنهاد می‌کنیم پیش از اتمام موجودی، جزئیات تب مشخصات فنی و سوالات متداول را مطالعه کنید تا با آگاهی کامل تصمیم بگیرید. فروشگاه ما تلاش می‌کند برای هر سلیقه و بودجه، گزینه‌ای مناسب در کنار ${meta.label} ارائه دهد.`,
  ];
}

function buildToolsOverview(product: ShopProduct): string[] {
  const meta = SHOP_CONSOLE_META[product.console];
  const category = PRODUCT_CATEGORY_LABELS.tools;
  const highlights = highlightsText(product);

  return [
    `${product.title} از دسته ${category} مخصوص ${meta.label} است و برای تکمیل تجربه بازی یا نگهداری بهتر کنسول طراحی شده است. این محصول در وضعیت ${conditionLabel(product.condition)} عرضه می‌شود و پیش از ارسال از نظر سلامت ظاهری و عملکرد اولیه بررسی می‌گردد. اگر به دنبال تجهیزات باکیفیت و سازگار با اکوسیستم ${meta.subtitle} هستید، این گزینه می‌تواند انتخابی هوشمندانه باشد.`,
    `در فروشگاه کنسول ریپیر، انتخاب لوازم جانبی و ابزار بازی با همان دقت انتخاب خود کنسول انجام می‌شود. ${product.title} برای کاربرانی مناسب است که می‌خواهند تجربه روزمره بازی را بهبود دهند، از فرسودگی تجهیزات پیشگیری کنند یا تجهیزات اصلی خود را تکمیل نمایند. ${highlights ? `نکات کلیدی این محصول: ${highlights}.` : ""} ما تلاش می‌کنیم محصولاتی عرضه کنیم که هم از نظر سازگاری و هم از نظر دوام در استفاده طولانی‌مدت قابل اتکا باشند.`,
  `خرید ${product.title} از فروشگاه ما مزایای مشخصی دارد: مشاوره پیش از خرید برای اطمینان از سازگاری با مدل کنسول شما، بسته‌بندی مناسب برای جلوگیری از آسیب در حمل‌ونقل، و پشتیبانی پس از خرید در صورت نیاز به راهنمایی نصب یا استفاده. اگر تازه کنسول ${meta.label} خریده‌اید یا قصد ارتقای ست بازی خود را دارید، این محصول می‌تواند بخشی از یک بسته کامل و حرفه‌ای باشد.`,
    `قبل از نهایی کردن سفارش، توصیه می‌کنیم تب مشخصات فنی و سوالات متداول را بررسی کنید. در این بخش‌ها اطلاعات دقیق‌تری درباره ابعاد، نوع اتصال، موارد استفاده پیشنهادی و نکات نگهداری ارائه شده است. وضعیت موجودی: ${stockLabel(product.inStock)}. تیم ما آماده است تا در صورت نیاز، محصولات مکمل دیگری از همان پلتفرم ${meta.label} را به شما پیشنهاد دهد.`,
    `کنسول ریپیر علاوه بر فروش، خدمات تعمیر تخصصی ${meta.label} را نیز ارائه می‌دهد. بنابراین اگر در آینده به سرویس دسته، بررسی پورت‌ها یا تعویض قطعات نیاز داشتید، می‌توانید با همان تیمی که محصول را تهیه کرده‌اید در ارتباط باشید. این یکپارچگی خدمات باعث می‌شود ${product.title} بخشی از یک راهکار کامل برای گیمرهای حرفه‌ای و تازه‌کار باشد.`,
  ];
}

function buildAccessoriesOverview(product: ShopProduct): string[] {
  const meta = SHOP_CONSOLE_META[product.console];
  const highlights = highlightsText(product);

  return [
    `${product.title} یکی از لوازم جانبی کاربردی برای کاربران ${meta.label} است که می‌تواند کیفیت تجربه بازی، نگهداری کنسول یا کیفیت صدا و تصویر را بهبود دهد. این محصول در وضعیت ${conditionLabel(product.condition)} عرضه می‌شود و برای استفاده روزمره در کنار ${meta.subtitle} طراحی شده است. ${highlights ? `مزایای اصلی: ${highlights}.` : ""}`,
    `انتخاب لوازم جانبی مناسب اغلب تفاوت محسوسی در رضایت بلندمدت از کنسول ایجاد می‌کند. ${product.title} می‌تواند نیاز مشخصی را پوشش دهد؛ از بهبود کیفیت اتصال و تصویر گرفته تا راحتی بیشتر در جلسات بازی طولانی. در فروشگاه کنسول ریپیر، لوازم جانبی با تمرکز بر سازگاری با پلتفرم ${meta.label} و کیفیت ساخت معرفی می‌شوند تا خریدار دچار ناسازگاری یا افت کیفیت ناخواسته نشود.`,
    `فرآیند سفارش ${product.title} ساده است: افزودن به سبد خرید، ثبت اطلاعات تماس و هماهنگی تحویل. برای مشتریان تهران امکان تحویل حضوری وجود دارد و برای سایر شهرها ارسال با بسته‌بندی ایمن انجام می‌شود. پیش از ارسال، سلامت ظاهری محصول کنترل می‌گردد. اگر سوالی درباره نحوه استفاده، طول عمر مفید یا ترکیب با سایر تجهیزات دارید، پشتیبانی فروشگاه پاسخگو خواهد بود.`,
    `در تب مشخصات فنی می‌توانید جزئیات دقیق‌تری مانند نوع رابط، ابعاد تقریبی، موارد استفاده و نکات نگهداری را مطالعه کنید. همچنین در بخش سوالات متداول، پاسخ رایج‌ترین پرسش‌های خریداران درباره این دسته محصولات آمده است. وضعیت فعلی: ${stockLabel(product.inStock)}.`,
    `اگر به تازگی کنسول ${meta.label} خریده‌اید یا قصد ارتقای ست بازی خود را دارید، پیشنهاد می‌کنیم محصولات مرتبط همین صفحه را نیز بررسی کنید. ترکیب لوازم جانبی باکیفیت با کنسول سالم و تست‌شده، تجربه‌ای روان‌تر و حرفه‌ای‌تر ایجاد می‌کند. کنسول ریپیر در کنار فروش، خدمات تعمیر و پشتیبانی فنی ${meta.label} را نیز ارائه می‌دهد تا در تمام مسیر همراه شما باشد.`,
  ];
}

function buildOverview(product: ShopProduct): string[] {
  switch (product.category) {
    case "console":
      return buildConsoleOverview(product);
    case "tools":
      return buildToolsOverview(product);
    case "accessories":
      return buildAccessoriesOverview(product);
  }
}

function buildConsoleFeatures(product: ShopProduct): ProductFeature[] {
  const meta = SHOP_CONSOLE_META[product.console];
  return [
    {
      title: "تست سلامت کامل",
      description: `هر دستگاه ${meta.label} پیش از تحویل از نظر تصویر، صدا، خواندن رسانه، دما و اتصال شبکه بررسی می‌شود تا خریدار با اطمینان سفارش را دریافت کند.`,
    },
    {
      title: "شفافیت وضعیت کالا",
      description: `وضعیت ${conditionLabel(product.condition)} به‌صورت شفاف اعلام می‌شود و برای مدل‌های دست‌دوم، جزئیات ظاهری و عملکردی قابل بررسی است.`,
    },
    {
      title: "پشتیبانی پس از خرید",
      description: `تیم فنی کنسول ریپیر پس از تحویل ${product.title} برای راه‌اندازی اولیه، تنظیمات شبکه و پاسخ به سوالات فنی در دسترس است.`,
    },
    {
      title: "بسته‌بندی ایمن",
      description: `ارسال کنسول با بسته‌بندی ضدضربه انجام می‌شود تا دستگاه در مسیر حمل‌ونقل آسیب نبیند و آماده استفاده به دست شما برسد.`,
    },
    {
      title: "مشاوره تخصصی",
      description: `پیش از خرید می‌توانید درباره سازگاری بازی‌ها، نیازهای ذخیره‌سازی و تفاوت نسخه‌های ${meta.label} مشاوره رایگان دریافت کنید.`,
    },
  ];
}

function buildToolsFeatures(product: ShopProduct): ProductFeature[] {
  const meta = SHOP_CONSOLE_META[product.console];
  return [
    {
      title: "سازگاری با پلتفرم",
      description: `${product.title} برای استفاده با ${meta.label} انتخاب شده و از نظر اتصال و عملکرد با اکوسیستم ${meta.subtitle} سازگار است.`,
    },
    {
      title: "کیفیت ساخت",
      description: `تمرکز بر دوام در استفاده مکرر و ergonomics مناسب برای جلسات بازی طولانی، مزیت مشخص این محصول نسبت به گزینه‌های بی‌نام بازار است.`,
    },
    {
      title: "راهنمای استفاده",
      description: `پس از خرید، در صورت نیاز راهنمای نصب یا تنظیم اولیه از طریق پشتیبانی فروشگاه در اختیار شما قرار می‌گیرد.`,
    },
    {
      title: "ترکیب با سایر محصولات",
      description: `می‌توانید این محصول را همراه با کنسول، لوازم جانبی یا خدمات تعمیر ${meta.label} از فروشگاه کنسول ریپیر تهیه کنید.`,
    },
    {
      title: "ارسال سریع",
      description: `برای سفارش‌های تاییدشده در تهران، امکان تحویل سریع وجود دارد و برای سایر شهرها ارسال با بسته‌بندی استاندارد انجام می‌شود.`,
    },
  ];
}

function buildAccessoriesFeatures(product: ShopProduct): ProductFeature[] {
  const meta = SHOP_CONSOLE_META[product.console];
  return [
    {
      title: "بهبود تجربه بازی",
      description: `${product.title} برای ارتقای کیفیت استفاده روزمره از ${meta.label} طراحی شده و می‌تواند نقاط ضعف ست فعلی شما را پوشش دهد.`,
    },
    {
      title: "نصب آسان",
      description: `اکثر لوازم جانبی این دسته بدون نیاز به ابزار تخصصی نصب می‌شوند و راهنمای ساده برای شروع سریع ارائه می‌شود.`,
    },
    {
      title: "گزینه اقتصادی هوشمند",
      description: `به‌جای تعویض کامل تجهیزات، انتخاب لوازم جانبی باکیفیت راهکاری مقرون‌به‌صرفه برای ارتقای تجربه بازی است.`,
    },
    {
      title: "سازگاری تضمین‌شده",
      description: `محصولات فروشگاه از نظر سازگاری با ${meta.subtitle} بررسی می‌شوند تا از ناسازگاری یا افت کیفیت ناخواسته جلوگیری شود.`,
    },
    {
      title: "پشتیبانی فروشگاه",
      description: `در صورت بروز سوال درباره نحوه استفاده یا ترکیب با سایر تجهیزات، تیم پشتیبانی کنسول ریپیر پاسخگو است.`,
    },
  ];
}

function buildFeatures(product: ShopProduct): ProductFeature[] {
  switch (product.category) {
    case "console":
      return buildConsoleFeatures(product);
    case "tools":
      return buildToolsFeatures(product);
    case "accessories":
      return buildAccessoriesFeatures(product);
  }
}

function buildConsoleSpecs(product: ShopProduct): ProductSpec[] {
  const meta = SHOP_CONSOLE_META[product.console];
  const specs: ProductSpec[] = [
    { label: "نام محصول", value: product.title },
    { label: "پلتفرم", value: meta.label },
    { label: "دسته‌بندی", value: PRODUCT_CATEGORY_LABELS.console },
    { label: "وضعیت", value: conditionLabel(product.condition) },
    { label: "موجودی", value: product.inStock ? "موجود" : "ناموجود" },
  ];
  if (product.storage) specs.push({ label: "ظرفیت ذخیره‌سازی", value: product.storage });
  if (product.edition) specs.push({ label: "نسخه", value: product.edition });
  specs.push(
    { label: "خروجی تصویر", value: product.console === "ps5" || product.console === "xbox-series" ? "تا 4K 120Hz" : "تا 4K/1080p بسته به مدل" },
    { label: "اتصال آنلاین", value: "پشتیبانی از شبکه و بازی آنلاین" },
    { label: "پورت‌ها", value: "HDMI، USB، برق (بسته به مدل)" },
    { label: "ریجن", value: product.highlights?.some((h) => h.includes("ریجن")) ? "آزاد" : "طبق موجودی انبار" },
    { label: "گارانتی فروشگاه", value: "تست سلامت و پشتیبانی پس از خرید" },
  );
  return specs;
}

function buildToolsSpecs(product: ShopProduct): ProductSpec[] {
  const meta = SHOP_CONSOLE_META[product.console];
  return [
    { label: "نام محصول", value: product.title },
    { label: "پلتفرم سازگار", value: meta.label },
    { label: "دسته‌بندی", value: PRODUCT_CATEGORY_LABELS.tools },
    { label: "وضعیت", value: conditionLabel(product.condition) },
    { label: "موجودی", value: product.inStock ? "موجود" : "ناموجود" },
    { label: "نوع اتصال", value: product.title.includes("شارژ") || product.title.includes("پایه") ? "برق / USB" : "بی‌سیم یا سیمی بسته به مدل" },
    { label: "کاربرد", value: "تکمیل ست بازی و نگهداری کنسول" },
    { label: "بسته‌بندی", value: "اورجینال یا استاندارد فروشگاه" },
    { label: "گارانتی فروشگاه", value: "تست اولیه و پشتیبانی" },
    { label: "زمان ارسال", value: "۱ تا ۳ روز کاری بسته به شهر" },
  ];
}

function buildAccessoriesSpecs(product: ShopProduct): ProductSpec[] {
  const meta = SHOP_CONSOLE_META[product.console];
  const specs: ProductSpec[] = [
    { label: "نام محصول", value: product.title },
    { label: "پلتفرم سازگار", value: meta.label },
    { label: "دسته‌بندی", value: PRODUCT_CATEGORY_LABELS.accessories },
    { label: "وضعیت", value: conditionLabel(product.condition) },
    { label: "موجودی", value: product.inStock ? "موجود" : "ناموجود" },
  ];
  if (product.title.includes("HDMI")) {
    specs.push(
      { label: "نوع کابل", value: product.title.includes("2.1") ? "HDMI 2.1" : "HDMI استاندارد" },
      { label: "رزولوشن پشتیبانی", value: product.title.includes("2.1") ? "تا 4K 120Hz" : "تا 4K/1080p" },
    );
  }
  if (product.title.includes("هدست")) {
    specs.push(
      { label: "نوع", value: "هدست گیمینگ" },
      { label: "میکروفون", value: "بله" },
    );
  }
  specs.push(
    { label: "کاربرد", value: "ارتقای تجربه بازی و نگهداری" },
    { label: "گارانتی فروشگاه", value: "تست سلامت و پشتیبانی" },
    { label: "زمان ارسال", value: "۱ تا ۳ روز کاری" },
  );
  return specs;
}

function buildSpecifications(product: ShopProduct): ProductSpec[] {
  switch (product.category) {
    case "console":
      return buildConsoleSpecs(product);
    case "tools":
      return buildToolsSpecs(product);
    case "accessories":
      return buildAccessoriesSpecs(product);
  }
}

function buildWhatsInBox(product: ShopProduct): string[] | undefined {
  const meta = SHOP_CONSOLE_META[product.console];
  if (product.category === "console") {
    const items = [
      `دستگاه ${product.title}`,
      "کابل برق",
      "کابل HDMI",
      "دسته بازی (در صورت ذکر در مشخصات مدل)",
    ];
    if (product.condition === "new") items.push("بسته‌بندی اورجینال");
    if (product.highlights?.includes("کابل کامل")) items.push("مجموعه کامل کابل‌ها");
    return items;
  }
  if (product.category === "tools" && product.title.includes("دسته")) {
    return [`${product.title}`, "کابل USB (در صورت نیاز)", "راهنمای استفاده"];
  }
  if (product.category === "tools") {
    return [`${product.title}`, "آداپتور/کابل (در صورت نیاز)", "بسته‌بندی فروشگاه"];
  }
  return [`${product.title}`, `مناسب برای ${meta.label}`, "بسته‌بندی ایمن"];
}

function buildCompatibility(product: ShopProduct): string[] {
  const meta = SHOP_CONSOLE_META[product.console];
  const items = [meta.label, meta.subtitle];
  if (product.category !== "console") {
    items.push(`تمام مدل‌های متداول ${meta.label}`);
  }
  return items;
}

function buildFaqs(product: ShopProduct): ProductFaq[] {
  const meta = SHOP_CONSOLE_META[product.console];
  const category = PRODUCT_CATEGORY_LABELS[product.category];

  const base: ProductFaq[] = [
    {
      question: `آیا ${product.title} تست شده است؟`,
      answer: `بله، تمام محصولات ${category} در فروشگاه کنسول ریپیر پیش از تحویل از نظر سلامت اولیه بررسی می‌شوند. برای کنسول‌های دست‌دوم، گزارش تست سلامت در اختیار خریدار قرار می‌گیرد و موارد قابل مشاهده به‌صورت شفاف اعلام می‌شود.`,
    },
    {
      question: "روش تحویل و ارسال چگونه است؟",
      answer: `برای تهران امکان تحویل حضوری و ارسال سریع وجود دارد. برای سایر شهرها ارسال با بسته‌بندی ایمن انجام می‌شود. پس از ثبت سفارش، همکاران ما برای هماهنگی زمان تحویل با شما تماس می‌گیرند.`,
    },
    {
      question: `آیا ${product.title} با ${meta.label} من سازگار است؟`,
      answer: `این محصول برای پلتفرم ${meta.label} (${meta.subtitle}) انتخاب شده است. اگر مدل دقیق کنسول خود را می‌دانید، پیش از خرید می‌توانید با پشتیبانی تماس بگیرید تا از سازگاری کامل اطمینان حاصل کنید.`,
    },
    {
      question: "آیا امکان بازگشت یا تعویض وجود دارد؟",
      answer: `در صورت مغایرت با توضیحات درج‌شده در صفحه محصول، طبق قوانین فروشگاه امکان بررسی و هماهنگی تعویض وجود دارد. لطفاً هنگام دریافت، سلامت ظاهری و موارد تحویلی را کنترل کنید و در صورت هرگونه مورد، سریعاً اطلاع دهید.`,
    },
    {
      question: "پشتیبانی پس از خرید چگونه است؟",
      answer: `تیم فنی کنسول ریپیر پس از خرید ${product.title} برای راهنمایی نصب، راه‌اندازی اولیه و پاسخ به سوالات فنی در دسترس است. همچنین خدمات تعمیر تخصصی ${meta.label} در همان مجموعه ارائه می‌شود.`,
    },
  ];

  if (product.category === "console") {
    base.push({
      question: "تفاوت نسخه نو و دست‌دوم چیست؟",
      answer: `نسخه نو در بسته‌بندی اورجینال و بدون سابقه استفاده عرضه می‌شود. نسخه دست‌دوم پس از تست کامل سلامت، با قیمت مناسب‌تر و توضیحات شفاف درباره وضعیت ظاهری ارائه می‌شود. انتخاب بین این دو بسته به بودجه و نیاز شماست.`,
    });
  }

  return base;
}

function buildSummary(product: ShopProduct): string {
  const meta = SHOP_CONSOLE_META[product.console];
  const category = PRODUCT_CATEGORY_LABELS[product.category];
  const highlights = highlightsText(product);
  return `${product.title} — ${category} ${meta.label} در وضعیت ${conditionLabel(product.condition)}. ${highlights ? `${highlights}. ` : ""}${stockLabel(product.inStock)}. خرید مطمئن با تست سلامت و پشتیبانی کنسول ریپیر.`;
}

export function buildProductDetailFromTemplate(product: ShopProduct): ShopProductDetail {
  return {
    summary: buildSummary(product),
    overview: buildOverview(product),
    features: buildFeatures(product),
    specifications: buildSpecifications(product),
    whatsInBox: buildWhatsInBox(product),
    warranty: {
      title: "گارانتی و خدمات پس از فروش",
      items: [
        "تست سلامت پیش از تحویل برای تمام محصولات",
        "پشتیبانی تلفنی برای راه‌اندازی و سوالات فنی",
        "امکان مراجعه به مرکز تعمیرات کنسول ریپیر",
        "شفافیت کامل در اعلام وضعیت کالاهای دست‌دوم",
        "هماهنگی تعویض در صورت مغایرت با توضیحات محصول",
      ],
    },
    delivery: {
      title: "شرایط ارسال و تحویل",
      items: [
        "تحویل حضوری در تهران (پس از هماهنگی)",
        "ارسال به سراسر کشور با بسته‌بندی ضدضربه",
        "هماهنگی زمان تحویل پس از ثبت سفارش",
        "بیمه یا بسته‌بندی تقویت‌شده برای کنسول‌ها",
        "ارسال ۱ تا ۳ روز کاری بسته به شهر مقصد",
      ],
    },
    faqs: buildFaqs(product),
    compatibility: buildCompatibility(product),
  };
}

export function countPersianWords(text: string): number {
  return text
    .replace(/[^\u0600-\u06FF\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function countProductDetailWords(detail: ShopProductDetail): number {
  const parts = [
    detail.summary,
    ...detail.overview,
    ...detail.features.map((f) => `${f.title} ${f.description}`),
    ...detail.specifications.map((s) => `${s.label} ${s.value}`),
    ...(detail.whatsInBox ?? []),
    detail.warranty.title,
    ...detail.warranty.items,
    detail.delivery.title,
    ...detail.delivery.items,
    ...detail.faqs.map((f) => `${f.question} ${f.answer}`),
    ...(detail.compatibility ?? []),
  ];
  return countPersianWords(parts.join(" "));
}
