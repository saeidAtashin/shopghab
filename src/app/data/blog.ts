import { gameCheatsPost } from "./blog-cheats-data";

export type BlogCheatEntry = {
  title: string;
  code: string;
  effect: string;
  platform?: "ps5" | "ps4" | "xbox" | "all";
};

export type BlogGame = {
  name: string;
  console: "ps5" | "ps4" | "xbox";
  genre: string;
  rating: number;
  metacritic?: number;
  released: string;
  coverImage: string;
  highlight: string;
  slug?: string;
  cheats?: BlogCheatEntry[];
  secrets?: string[];
  cheatActivation?: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
};

export type BlogGameSection = {
  id: string;
  title: string;
  description: string;
  games: BlogGame[];
};

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTimeMinutes: number;
  coverImage: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords: string[];
  intro: string[];
  sections: BlogGameSection[];
  body: string[];
  faqs?: BlogFaq[];
  kind?: "guide" | "cheats";
};

const RAWG = "https://media.rawg.io/media/games";

export const blogPosts: BlogPost[] = [
  {
    slug: "best-games-2026",
    title: "بهترین بازی‌های PS5 و Xbox در ۲۰۲۶",
    excerpt:
      "راهنمای جامع انتخاب بهترین بازی‌های اکشن، RPG، چندنفره و انحصاری برای پلی‌استیشن ۵ و ایکس‌باکس — با امتیاز، ژانر و پیشنهاد تخصصی.",
    publishedAt: "2026-03-15",
    readTimeMinutes: 8,
    coverImage: `${RAWG}/5ec/5ecac5cb026ec26a56efcc546324e348.jpg`,
    seoTitle: "بهترین بازی‌های PS5 و Xbox ۲۰۲۶ | لیست کامل و پیشنهاد تخصصی",
    seoDescription:
      "لیست بهترین بازی‌های PS5 و Xbox در سال ۲۰۲۶ شامل اکشن، RPG، چندنفره و انحصاری. راهنمای انتخاب بازی با امتیاز Metacritic و پیشنهاد نصب در فیکس‌بازی.",
    keywords: [
      "بهترین بازی ps5",
      "بهترین بازی xbox",
      "بازی ps5 2026",
      "بازی انحصاری ps5",
      "بازی دنیای باز",
      "بازی چندنفره ps5",
      "لیست بازی xbox series",
      "نصب بازی ps5",
      "بلاگ بازی",
      "راهنمای انتخاب بازی",
    ],
    intro: [
      "انتخاب بازی درست یکی از مهم‌ترین تصمیم‌هایی است که هر گیمر بعد از خرید کنسول با آن روبه‌رو می‌شود. با وجود هزاران عنوان در فروشگاه‌های دیجیتال، پیدا کردن بازی‌هایی که واقعاً ارزش وقت و هزینه شما را دارند کار ساده‌ای نیست — به‌خصوص وقتی ژانرهای مختلف، حجم نصب و نیاز به اینترنت پرسرعت مطرح می‌شود.",
      "در این مقاله، تیم فیکس‌بازی بر اساس تجربه نصب هزاران بازی روی PS5، PS4 و Xbox، لیستی از بهترین عناوین ۲۰۲۶ را در چهار دسته اکشن و ماجراجویی، RPG و دنیای باز، چندنفره و ورزشی، و انحصاری و مستقل جمع‌آوری کرده است. هر بازی با امتیاز کاربران، Metacritic و یک جمله پیشنهاد فارسی معرفی می‌شود.",
      "اگر قصد نصب بازی روی کنسول خود را دارید، می‌توانید از خدمات نصب بازی فیکس‌بازی استفاده کنید و این عناوین را بدون دردسر حجم و آپدیت روی دستگاه داشته باشید.",
    ],
    sections: [
      {
        id: "action-adventure",
        title: "بهترین بازی‌های اکشن و ماجراجویی",
        description:
          "این دسته برای گیمرهایی است که به داستان سینمایی، مبارزه نزدیک و جهان‌های بزرگ علاقه دارند. عناوین زیر در PS5 و Xbox بهترین تجربه گرافیکی و روانی را ارائه می‌دهند.",
        games: [
          {
            name: "God of War Ragnarök",
            console: "ps5",
            genre: "اکشن ماجراجویی",
            rating: 4.8,
            metacritic: 94,
            released: "2022-11-09",
            coverImage: `${RAWG}/7cf/7cfc8330f1d5b5f392ef1b8010cebb86.jpg`,
            highlight:
              "ادامه حماسی کراتوس و آترئوس با گرافیک خیره‌کننده و مبارزات حماسی اسطوره‌ای.",
          },
          {
            name: "Marvel's Spider-Man 2",
            console: "ps5",
            genre: "اکشن ماجراجویی",
            rating: 4.7,
            metacritic: 90,
            released: "2023-10-20",
            coverImage: `${RAWG}/deb/debdbfa4487c52979e245fb5559b22e4.jpg`,
            highlight:
              "وب‌سوینگ روان در نیویورک با دو اسپایدرمن و داستان پر از هیجان.",
          },
          {
            name: "Horizon Forbidden West",
            console: "ps5",
            genre: "اکشن RPG",
            rating: 4.6,
            metacritic: 88,
            released: "2022-02-18",
            coverImage: `${RAWG}/043/0433d2d64a7b0dec9f17b49b0ab05e2e.jpg`,
            highlight:
              "جهان پساآپوکالiptic با ماشین‌های غول‌پیکر و داستان الهام‌بخش آلوی.",
          },
          {
            name: "Star Wars Jedi: Survivor",
            console: "xbox",
            genre: "اکشن ماجراجویی",
            rating: 4.5,
            metacritic: 85,
            released: "2023-04-28",
            coverImage: `${RAWG}/e69/e690c5c4cc65a5a4f77fe825dca15497.jpg`,
            highlight:
              "مبارزه با چراغ‌جنگی، پارکور و کاوش در کهکشان دور، دور برای طرفداران جنگ ستارگان.",
          },
        ],
      },
      {
        id: "rpg-open-world",
        title: "بهترین بازی‌های RPG و دنیای باز",
        description:
          "اگر صدها ساعت گیم‌پلی، شخصی‌سازی شخصیت و آزادی اکتشاف برایتان اولویت دارد، این عناوین بهترین انتخاب در ۲۰۲۶ هستند.",
        games: [
          {
            name: "Elden Ring",
            console: "ps5",
            genre: "اکشن RPG",
            rating: 4.9,
            metacritic: 96,
            released: "2022-02-25",
            coverImage: `${RAWG}/5ec/5ecac5cb026ec26a56efcc546324e348.jpg`,
            highlight:
              "شاهکار FromSoftware با دنیای باز وسیع، باس‌های افسانه‌ای و آزادی مسیر.",
          },
          {
            name: "Baldur's Gate 3",
            console: "ps5",
            genre: "نقش‌آفرینی",
            rating: 4.9,
            metacritic: 96,
            released: "2023-08-03",
            coverImage: `${RAWG}/26d/26d4434445ee25b600243e55aeba9c1d.jpg`,
            highlight:
              "بهترین RPG نقش‌آفرینی دهه با انتخاب‌های تأثیرگذار و داستان عمیق.",
          },
          {
            name: "Cyberpunk 2077",
            console: "xbox",
            genre: "اکشن RPG",
            rating: 4.4,
            metacritic: 86,
            released: "2020-12-10",
            coverImage: `${RAWG}/26a/26aa3f95624a77a668f0e70d67eaa57a.jpg`,
            highlight:
              "نسخه Phantom Liberty و آپدیت‌های بعدی، نایت‌سیتی را به تجربه‌ای فوق‌العاده تبدیل کرده.",
          },
          {
            name: "Hogwarts Legacy",
            console: "ps5",
            genre: "اکشن RPG",
            rating: 4.5,
            metacritic: 84,
            released: "2023-02-10",
            coverImage: `${RAWG}/cd0/cd0bdd0cb13dc0df59979384df398e83.jpg`,
            highlight:
              "جهان جادوگری هری پاتر با آزادی اکتشاف قلعه هاگوارتز و یادگیری طلسم.",
          },
        ],
      },
      {
        id: "multiplayer-sports",
        title: "بهترین بازی‌های چندنفره و ورزشی",
        description:
          "برای بازی با دوستان، رقابت آنلاین و تجربه ورزشی زنده، این عناوین بیشترین بازیکن فعال و به‌روزرسانی منظم را دارند.",
        games: [
          {
            name: "EA Sports FC 25",
            console: "ps5",
            genre: "ورزشی",
            rating: 4.2,
            metacritic: 78,
            released: "2024-09-27",
            coverImage: `${RAWG}/7a3/7a39f47a2c8bba7d0dff7e1b0cd9ee69.jpg`,
            highlight:
              "محبوب‌ترین بازی فوتبال با حالت Ultimate Team و رقابت آنلاین جهانی.",
          },
          {
            name: "Fortnite",
            console: "xbox",
            genre: "بتل رویال",
            rating: 4.3,
            metacritic: 81,
            released: "2017-07-25",
            coverImage: `${RAWG}/2be/2be1ef1a4d7d57f6af405be02daa8330.jpg`,
            highlight:
              "رایگان، پر از رویداد زنده و همکاری با فرنچایزهای محبوب — ایده‌آل برای بازی گروهی.",
          },
          {
            name: "Call of Duty: Modern Warfare III",
            console: "ps5",
            genre: "تیراندازی",
            rating: 4.1,
            metacritic: 73,
            released: "2023-11-10",
            coverImage: `${RAWG}/f62/f6269b24f948638d4ce63a0a1c2db64c.jpg`,
            highlight:
              "مود زامبی، کمپین و مولتی‌پلیر سریع برای طرفداران FPS رقابتی.",
          },
          {
            name: "Rocket League",
            console: "xbox",
            genre: "ورزشی",
            rating: 4.4,
            metacritic: 86,
            released: "2015-07-07",
            coverImage: `${RAWG}/e0b/e0b0e2cfc89cce400475b4f721d5e51.jpg`,
            highlight:
              "فوتبال با ماشین — ساده برای یادگیری، سخت برای استاد شدن؛ عالی برای مهمانی.",
          },
        ],
      },
      {
        id: "exclusive-indie",
        title: "انحصاری‌ها و بازی‌های مستقل برتر",
        description:
          "عناوینی که تجربه‌ای منحصربه‌فرد ارائه می‌دهند — از داستان‌های احساسی تا رانندگی و بازی‌های کوتاه اما به‌یادماندنی.",
        games: [
          {
            name: "The Last of Us Part II",
            console: "ps5",
            genre: "اکشن ماجراجویی",
            rating: 4.7,
            metacritic: 93,
            released: "2020-06-19",
            coverImage: `${RAWG}/d48/d488ebc08bebb0d88b1e8e23b9a93ad0.jpg`,
            highlight:
              "داستان احساسی و گیم‌پلی مخفی‌کاری در سطح سینمایی — شاهکار ناتی داگ.",
          },
          {
            name: "Forza Horizon 5",
            console: "xbox",
            genre: "رانندگی",
            rating: 4.8,
            metacritic: 92,
            released: "2021-11-09",
            coverImage: `${RAWG}/62d/62da122ca1c53404b6d23d600a6be6f9.jpg`,
            highlight:
              "بهترین بازی رانندگی باز جهان با گرافیک ۴K و صدها خودرو.",
          },
          {
            name: "Hades",
            console: "ps5",
            genre: "روگ‌لایک",
            rating: 4.8,
            metacritic: 93,
            released: "2020-09-17",
            coverImage: `${RAWG}/51b/51be3b1f425d6b88317b5e5b00dfeeb6.jpg`,
            highlight:
              "روگ‌لایک با داستان عمیق و مبارزات سریع — هر مرگ بخشی از روایت است.",
          },
          {
            name: "Astro's Playroom",
            console: "ps5",
            genre: "پلتفرمر",
            rating: 4.6,
            metacritic: 83,
            released: "2020-11-12",
            coverImage: `${RAWG}/595/595b3d4f1d212bc146f16e3d356df2e6.jpg`,
            highlight:
              "رایگان با PS5 — معرفی خلاقانه قابلیت‌های DualSense و تاریخ پلی‌استیشن.",
          },
        ],
      },
    ],
    body: [
      "انتخاب بازی به سلیقه شخصی، زمان آزاد و سخت‌افزار شما بستگی دارد. اگر تازه PS5 یا Xbox Series خریده‌اید، پیشنهاد ما شروع با یک بازی اکشن داستانی مثل God of War Ragnarök یا Spider-Man 2 و سپس اضافه کردن یک عنوان چندنفره برای بازی با دوستان است.",
      "قبل از نصب، حجم هر بازی را بررسی کنید — برخی عناوین مانند Call of Duty یا Baldur's Gate 3 بیش از ۱۰۰ گیگابایت فضا می‌گیرند. اگر فضای کافی ندارید، می‌توانید از هارد اکسترنال یا ارتقای SSD کنسول استفاده کنید؛ تیم فیکس‌بازی در این زمینه هم مشاوره و خدمات نصب ارائه می‌دهد.",
      "برای نصب بازی روی PS5، PS4 یا Xbox با بهترین قیمت و گارانتی، به صفحه تعرفه نصب بازی مراجعه کنید یا همین حالا درخواست خود را ثبت کنید.",
    ],
    faqs: [
      {
        question: "بهترین بازی PS5 برای شروع کدام است؟",
        answer:
          "برای شروع، Astro's Playroom (رایگان) و سپس Spider-Man 2 یا God of War Ragnarök بهترین گزینه‌ها هستند — هر دو گرافیک و گیم‌پلی فوق‌العاده‌ای دارند.",
      },
      {
        question: "آیا بازی‌های Xbox روی PS5 اجرا می‌شوند؟",
        answer:
          "خیر. بازی‌های انحصاری Xbox مانند Forza Horizon 5 فقط روی کنسول‌های مایکروسافت اجرا می‌شوند و بالعکس.",
      },
      {
        question: "چطور بازی روی کنسول نصب کنم؟",
        answer:
          "می‌توانید از فروشگاه دیجیتال کنسول خرید کنید یا از خدمات نصب بازی فیکس‌بازی استفاده کنید — ما بازی را روی دستگاه شما نصب و تست می‌کنیم.",
      },
      {
        question: "کدام ژانر بیشترین محبوبیت را دارد؟",
        answer:
          "در ۲۰۲۶، RPGهای دنیای باز مانند Elden Ring و Baldur's Gate 3 و بازی‌های چندنفره رقابتی مانند Fortnite و FC بیشترین بازیکن فعال را دارند.",
      },
    ],
  },
  {
    slug: "game-install-guide",
    title: "راهنمای کامل نصب بازی روی کنسول",
    excerpt:
      "همه چیز درباره نصب بازی روی PS5، PS4 و Xbox — از انتخاب حافظه تا نصب اکانتی و پکیج اقتصادی با نکات تخصصی فیکس‌بازی.",
    publishedAt: "2026-03-01",
    readTimeMinutes: 7,
    coverImage: `${RAWG}/deb/debdbfa4487c52979e245fb5559b22e4.jpg`,
    seoTitle: "راهنمای نصب بازی PS5 و Xbox | روش‌ها، هزینه و نکات مهم",
    seoDescription:
      "راهنمای جامع نصب بازی روی پلی‌استیشن ۵، PS4 و Xbox Series. مقایسه نصب اکانتی، پکیج اقتصادی، نیاز به اینترنت و بهترین بازی‌ها برای شروع.",
    keywords: [
      "نصب بازی ps5",
      "نصب بازی xbox",
      "قیمت نصب بازی",
      "نصب اکانتی ps5",
      "پکیج بازی ps5",
      "هارد کنسول",
      "راهنمای نصب بازی",
      "تعرفه نصب بازی",
      "بازی ps4",
      "فیکس بازی",
    ],
    intro: [
      "نصب بازی روی کنسول یکی از پرتقاضاترین خدمات گیمرهای ایرانی است. با توجه به محدودیت‌های پرداخت بین‌المللی و حجم بالای بازی‌های مدرن، بسیاری ترجیح می‌دهند نصب را به مراکز تخصصی بسپارند تا هم زمان صرفه‌جویی شود و هم از سازگاری و تست نهایی مطمئن باشند.",
      "در این راهنما، روش‌های مختلف نصب بازی روی PS5، PS4 و Xbox را بررسی می‌کنیم، نکات مهم حافظه و اینترنت را توضیح می‌دهیم و بهترین بازی‌ها برای شروع هر کنسول را معرفی می‌کنیم.",
      "فیکس‌بازی با سال‌ها تجربه در نصب هزاران بازی، گارانتی نصب و پشتیبانی پس از تحویل ارائه می‌دهد.",
    ],
    sections: [
      {
        id: "ps5-starters",
        title: "بهترین بازی‌ها برای شروع PS5",
        description:
          "اگر تازه PS5 خریده‌اید، این عناوین بهترین ترکیب از انحصاری، گرافیک و ارزش خرید را دارند.",
        games: [
          {
            name: "Marvel's Spider-Man 2",
            console: "ps5",
            genre: "اکشن",
            rating: 4.7,
            metacritic: 90,
            released: "2023-10-20",
            coverImage: `${RAWG}/deb/debdbfa4487c52979e245fb5559b22e4.jpg`,
            highlight: "انحصاری PS5 — بهترین نمایش قدرت کنسول.",
          },
          {
            name: "Demon's Souls",
            console: "ps5",
            genre: "اکشن RPG",
            rating: 4.5,
            metacritic: 92,
            released: "2020-11-12",
            coverImage: `${RAWG}/3b5/3b52bb69e18a42c581002b4491aa7fe9.jpg`,
            highlight: "ریمیک با ریتریسینگ — تجربه بصری خیره‌کننده.",
          },
          {
            name: "Ratchet & Clank: Rift Apart",
            console: "ps5",
            genre: "پلتفرمر",
            rating: 4.6,
            metacritic: 88,
            released: "2021-06-11",
            coverImage: `${RAWG}/588/588969d64eaf5c117cd0503356ef6f0b.jpg`,
            highlight: "بارگذاری آنی بین دنیاها — شاهکار SSD PS5.",
          },
          {
            name: "Returnal",
            console: "ps5",
            genre: "شوتر",
            rating: 4.4,
            metacritic: 86,
            released: "2021-04-30",
            coverImage: `${RAWG}/81d/81d7fa01a9541a1aea7af2c61076cb6e.jpg`,
            highlight: "روگ‌لایک سوم‌شخص با haptic feedback عالی.",
          },
        ],
      },
      {
        id: "xbox-starters",
        title: "بهترین بازی‌ها برای شروع Xbox",
        description:
          "ایکس‌باکس با Game Pass و انحصاری‌های قوی، انتخاب‌های عالی برای گیمر تازه‌کار دارد.",
        games: [
          {
            name: "Forza Horizon 5",
            console: "xbox",
            genre: "رانندگی",
            rating: 4.8,
            metacritic: 92,
            released: "2021-11-09",
            coverImage: `${RAWG}/62d/62da122ca1c53404b6d23d600a6be6f9.jpg`,
            highlight: "بهترین بازی رانندگی — ایده‌آل برای نمایش 4K.",
          },
          {
            name: "Halo Infinite",
            console: "xbox",
            genre: "تیراندازی",
            rating: 4.2,
            metacritic: 87,
            released: "2021-12-08",
            coverImage: `${RAWG}/e68/e68244edc6725b413f13a37a08971e2f.jpg`,
            highlight: "مولتی‌پلیر رایگان و کمپین حماسی هیلو.",
          },
          {
            name: "Gears 5",
            console: "xbox",
            genre: "تیراندازی",
            rating: 4.3,
            metacritic: 84,
            released: "2019-09-06",
            coverImage: `${RAWG}/28d/28d9eb97eb591c66fe305b321dd9a0b1.jpg`,
            highlight: "کوآپ و داستان عمیق — انحصاری قوی Xbox.",
          },
          {
            name: "Sea of Thieves",
            console: "xbox",
            genre: "ماجراجویی",
            rating: 4.1,
            metacritic: 69,
            released: "2018-03-20",
            coverImage: `${RAWG}/d63/d638d5e44d2f9e94b966b5925937e0c0.jpg`,
            highlight: "دزدان دریایی با دوستان — تجربه منحصربه‌فرد آنلاین.",
          },
        ],
      },
      {
        id: "ps4-classics",
        title: "کلاسیک‌های PS4 که هنوز ارزش نصب دارند",
        description:
          "بسیاری از بازی‌های PS4 روی PS5 با Boost سازگار اجرا می‌شوند و هزینه نصب کمتری دارند.",
        games: [
          {
            name: "The Last of Us Part II",
            console: "ps4",
            genre: "اکشن",
            rating: 4.7,
            metacritic: 93,
            released: "2020-06-19",
            coverImage: `${RAWG}/d48/d488ebc08bebb0d88b1e8e23b9a93ad0.jpg`,
            highlight: "داستان برنده جوایز — تجربه‌ای فراموش‌نشدنی.",
          },
          {
            name: "Ghost of Tsushima",
            console: "ps4",
            genre: "اکشن",
            rating: 4.7,
            metacritic: 83,
            released: "2020-07-17",
            coverImage: `${RAWG}/742/7428392391df7d5f168203ee0cfe508a.jpg`,
            highlight: "سامورایی در ژاپن فئودال — زیبایی بصری فوق‌العاده.",
          },
          {
            name: "Bloodborne",
            console: "ps4",
            genre: "اکشن RPG",
            rating: 4.6,
            metacritic: 92,
            released: "2015-03-24",
            coverImage: `${RAWG}/391/391953552d69e47cb25ebee1003a6d1a.jpg`,
            highlight: "شاهکار FromSoftware — چالش‌برانگیز و محبوب.",
          },
          {
            name: "Uncharted 4",
            console: "ps4",
            genre: "ماجراجویی",
            rating: 4.6,
            metacritic: 93,
            released: "2016-05-10",
            coverImage: `${RAWG}/511/5118a0bfc1179dbca78ff40500b724a4.jpg`,
            highlight: "سینمایی‌ترین ماجراجویی ناتی داگ.",
          },
        ],
      },
      {
        id: "install-tips",
        title: "بازی‌های سبک برای تست نصب",
        description:
          "عناوین کوچک‌تر برای تست سلامت نصب و آشنایی با کنسول — حجم کم و بارگذاری سریع.",
        games: [
          {
            name: "Hades",
            console: "ps5",
            genre: "روگ‌لایک",
            rating: 4.8,
            metacritic: 93,
            released: "2020-09-17",
            coverImage: `${RAWG}/51b/51be3b1f425d6b88317b5e5b00dfeeb6.jpg`,
            highlight: "حجم معقول — ایده‌آل برای اولین نصب.",
          },
          {
            name: "Celeste",
            console: "xbox",
            genre: "پلتفرمر",
            rating: 4.7,
            metacritic: 94,
            released: "2018-01-25",
            coverImage: `${RAWG}/59b/59b9788d28a0e3ab479010c92aa3eb7c.jpg`,
            highlight: "مستقل برنده جوایز — کمتر از ۲ گیگ.",
          },
          {
            name: "Stardew Valley",
            console: "ps4",
            genre: "شبیه‌سازی",
            rating: 4.6,
            metacritic: 89,
            released: "2016-02-26",
            coverImage: `${RAWG}/713/7133696cb876108f1f974fedd6f86fae.jpg`,
            highlight: "آرامش‌بخش و سبک — مناسب همه سنین.",
          },
          {
            name: "Rocket League",
            console: "xbox",
            genre: "ورزشی",
            rating: 4.4,
            metacritic: 86,
            released: "2015-07-07",
            coverImage: `${RAWG}/e0b/e0b0e2cfc89cce400475b4f721d5e51.jpg`,
            highlight: "رایگان و سریع — تست آنلاین آسان.",
          },
        ],
      },
    ],
    body: [
      "روش‌های نصب بازی در فیکس‌بازی شامل نصب اکانتی (بازی‌های دیجیتال با اکانت)، پکیج اقتصادی (چند بازی با قیمت مناسب‌تر) و نصب تکی است. قبل از مراجعه، مدل کنسول و فضای خالی هارد را مشخص کنید.",
      "برای PS5 حداقل ۵۰۰ گیگابایت فضای آزاد برای نصب راحت چند بازی AAA توصیه می‌شود. Xbox Series با کارت حافظه قابل گسترش، انعطاف بیشتری دارد. PS4 با هارد ۱ ترابایتی محبوب‌ترین پیکربندی است.",
      "برای مشاهده تعرفه دقیق نصب بازی PS5، PS4 یا Xbox به صفحه خدمات نصب بازی مراجعه کنید یا همین حالا درخواست خود را ثبت کنید.",
    ],
    faqs: [
      {
        question: "نصب بازی چقدر طول می‌کشد؟",
        answer:
          "بسته به تعداد بازی و حجم آن‌ها، معمولاً بین ۱ تا ۴ ساعت. بازی‌های بزرگ مانند Call of Duty ممکن است زمان بیشتری نیاز داشته باشند.",
      },
      {
        question: "آیا نصب بازی گارانتی دارد؟",
        answer:
          "بله، فیکس‌بازی گارانتی نصب ارائه می‌دهد. اگر بازی پس از نصب اجرا نشود، بدون هزینه اضافی بررسی و رفع می‌شود.",
      },
      {
        question: "تفاوت نصب اکانتی و پکیج چیست؟",
        answer:
          "نصب اکانتی بازی‌های دیجیتال با اکانت مجاز را روی کنسول شما فعال می‌کند. پکیج اقتصادی مجموعه‌ای از بازی‌های پرطرفدار با قیمت پایین‌تر است.",
      },
    ],
  },
  gameCheatsPost,
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export const BLOG_INDEX_DESCRIPTION =
  "بلاگ فیکس‌بازی — راهنمای بهترین بازی‌های PS5 و Xbox، رمز و چیت بازی، نکات نصب بازی و اخبار گیمینگ برای گیمرهای ایرانی.";
