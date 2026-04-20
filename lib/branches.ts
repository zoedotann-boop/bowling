import type { Locale } from "@/i18n/routing"

export type LocalizedString = Record<Locale, string>

export type BranchAccent = "cherry" | "teal"

export type PriceRow = {
  label: LocalizedString
  weekday: string
  weekend: string
}

export type EventOffering = {
  title: LocalizedString
  description: LocalizedString
}

export type MenuItem = {
  name: LocalizedString
  price: string
  tag?: LocalizedString
}

export type MenuCategory = {
  title: LocalizedString
  items: MenuItem[]
}

export type GoogleReview = {
  author: string
  rating: number
  date: LocalizedString
  text: LocalizedString
}

export type OpeningHours = {
  day: LocalizedString
  open: string
  close: string
}

export type Branch = {
  slug: string
  domains: string[]
  displayName: LocalizedString
  shortName: LocalizedString
  address: LocalizedString
  city: LocalizedString
  phone: string
  whatsapp: string
  email: string
  mapUrl: string
  hours: OpeningHours[]
  hero: {
    image: string
    tagline: LocalizedString
    headline: LocalizedString
  }
  prices: PriceRow[]
  shoeRental: { weekday: string; weekend: string }
  packages: { title: LocalizedString; price: string; perks: LocalizedString }[]
  events: EventOffering[]
  menu: MenuCategory[]
  google: {
    rating: number
    count: number
    profileUrl: string
    reviews: GoogleReview[]
  }
  seo: { title: LocalizedString; description: LocalizedString }
  brandAccent: BranchAccent
  geo: { lat: number; lng: number }
}

const days = (en: string, ru: string, he: string, ar: string): LocalizedString => ({
  en,
  ru,
  he,
  ar,
})

const sharedMenu: MenuCategory[] = [
  {
    title: { en: "Snacks", ru: "Закуски", he: "חטיפים", ar: "وجبات خفيفة" },
    items: [
      {
        name: { en: "Loaded fries", ru: "Картошка с топингом", he: "צ׳יפס עמוס", ar: "بطاطس محمّلة" },
        price: "₪38",
        tag: { en: "Bestseller", ru: "Хит", he: "להיט", ar: "الأكثر مبيعًا" },
      },
      {
        name: { en: "Crispy wings (8 pc)", ru: "Хрустящие крылья (8 шт)", he: "כנפיים פריכות (8 יח׳)", ar: "أجنحة مقرمشة (8 قطع)" },
        price: "₪48",
      },
      {
        name: { en: "Mozzarella sticks", ru: "Сырные палочки", he: "מקלות מוצרלה", ar: "أصابع موزاريلا" },
        price: "₪34",
      },
      {
        name: { en: "Veggie nachos", ru: "Овощные начос", he: "נאצ׳וס צמחוני", ar: "ناتشوز نباتي" },
        price: "₪36",
      },
    ],
  },
  {
    title: { en: "Mains", ru: "Основные", he: "מנות עיקריות", ar: "أطباق رئيسية" },
    items: [
      {
        name: { en: "Cheeseburger + fries", ru: "Чизбургер + картошка", he: "צ׳יזבורגר + צ׳יפס", ar: "تشيز برجر + بطاطس" },
        price: "₪62",
      },
      {
        name: { en: "Margherita pizza", ru: "Пицца Маргарита", he: "פיצה מרגריטה", ar: "بيتزا مارغريتا" },
        price: "₪54",
      },
      {
        name: { en: "Spicy chicken sandwich", ru: "Острый куриный сэндвич", he: "סנדוויץ׳ עוף חריף", ar: "ساندويتش دجاج حار" },
        price: "₪58",
      },
      {
        name: { en: "Caesar salad", ru: "Салат цезарь", he: "סלט קיסר", ar: "سلطة سيزر" },
        price: "₪52",
      },
    ],
  },
  {
    title: { en: "Drinks", ru: "Напитки", he: "משקאות", ar: "مشروبات" },
    items: [
      {
        name: { en: "Local draft beer", ru: "Местное разливное", he: "בירה מהחבית", ar: "بيرة من البرميل" },
        price: "₪32",
      },
      {
        name: { en: "House cocktail", ru: "Фирменный коктейль", he: "קוקטייל הבית", ar: "كوكتيل البيت" },
        price: "₪48",
      },
      {
        name: { en: "Fresh lemonade", ru: "Лимонад", he: "לימונדה", ar: "ليموناضة" },
        price: "₪22",
      },
      {
        name: { en: "Iced coffee", ru: "Айс-кофе", he: "קפה קר", ar: "قهوة مثلجة" },
        price: "₪18",
      },
    ],
  },
]

const sharedGoogle = (slug: string) => ({
  rating: 4.7,
  count: 482,
  profileUrl: `https://www.google.com/maps/search/${slug}+bowling`,
  reviews: [
    {
      author: "נועה לוי",
      rating: 5,
      date: { en: "2 weeks ago", ru: "2 недели назад", he: "לפני שבועיים", ar: "قبل أسبوعين" },
      text: {
        en: "Lanes were spotless, drinks came fast, the staff actually cared. We'll be back next Friday.",
        ru: "Дорожки идеально чистые, напитки быстро, персонал внимательный. Вернёмся в пятницу.",
        he: "מסלולים נקיים, משקאות מהר, צוות שבאמת אכפת לו. נחזור שישי הבא.",
        ar: "المسارات نظيفة، المشروبات وصلت بسرعة، والطاقم يهتم فعلاً. سنعود الجمعة المقبلة.",
      },
    },
    {
      author: "Andrey K.",
      rating: 5,
      date: { en: "1 month ago", ru: "1 месяц назад", he: "לפני חודש", ar: "قبل شهر" },
      text: {
        en: "Booked the birthday package for my son - they handled everything from invitations to cake.",
        ru: "Заказали пакет на день рождения сына - они всё сделали, от приглашений до торта.",
        he: "הזמנו את חבילת יום ההולדת לבן שלי - הם דאגו להכל, מההזמנות ועד העוגה.",
        ar: "حجزت حزمة عيد الميلاد لابني - اهتموا بكل شيء من الدعوات إلى الكعكة.",
      },
    },
  ],
})

const israeliWeek: OpeningHours[] = [
  { day: days("Sunday", "Воскресенье", "ראשון", "الأحد"), open: "14:00", close: "23:30" },
  { day: days("Monday", "Понедельник", "שני", "الإثنين"), open: "14:00", close: "23:30" },
  { day: days("Tuesday", "Вторник", "שלישי", "الثلاثاء"), open: "14:00", close: "23:30" },
  { day: days("Wednesday", "Среда", "רביעי", "الأربعاء"), open: "14:00", close: "23:30" },
  { day: days("Thursday", "Четверг", "חמישי", "الخميس"), open: "14:00", close: "01:00" },
  { day: days("Friday", "Пятница", "שישי", "الجمعة"), open: "12:00", close: "16:00" },
  { day: days("Saturday", "Суббота", "שבת", "السبت"), open: "19:00", close: "01:00" },
]

const sharedPackages = [
  {
    title: { en: "Birthday Package", ru: "Праздник", he: "חבילת יום הולדת", ar: "حزمة عيد ميلاد" },
    price: "₪690",
    perks: {
      en: "Lane · 90 min · pizza · soft drinks · staff host",
      ru: "Дорожка · 90 мин · пицца · напитки · ведущий",
      he: "מסלול · 90 דקות · פיצה · שתייה · מנחה אירוע",
      ar: "مسار · 90 دقيقة · بيتزا · مشروبات · مضيف حفلة",
    },
  },
  {
    title: { en: "Family Pack", ru: "Семейный пакет", he: "חבילת משפחה", ar: "حزمة العائلة" },
    price: "₪320",
    perks: {
      en: "Lane · 60 min · 4 shoe rentals · pitcher of soft drinks",
      ru: "Дорожка · 60 мин · 4 пары обуви · кувшин напитков",
      he: "מסלול · שעה · 4 השכרות נעליים · קנקן שתייה",
      ar: "مسار · ساعة · 4 إيجارات أحذية · إبريق مشروبات",
    },
  },
]

const sharedEvents: EventOffering[] = [
  {
    title: { en: "Birthdays", ru: "Дни рождения", he: "ימי הולדת", ar: "أعياد ميلاد" },
    description: {
      en: "Lanes, party room, food, cake - we handle the whole thing.",
      ru: "Дорожки, зал, еда, торт - мы делаем всё под ключ.",
      he: "מסלולים, חדר אירועים, אוכל ועוגה - אנחנו מפיקים מקצה לקצה.",
      ar: "مسارات، قاعة حفلات، طعام وكعكة - نحن نهتم بكل شيء.",
    },
  },
  {
    title: { en: "Corporate", ru: "Корпоративы", he: "אירועי חברה", ar: "فعاليات الشركات" },
    description: {
      en: "Team-building leagues, catered menus and a private bar.",
      ru: "Тимбилдинг-лиги, кейтеринг и частный бар.",
      he: "ליגות גיבוש, תפריטי קייטרינג ובר פרטי.",
      ar: "دوريات بناء الفريق، قوائم طعام، وبار خاص.",
    },
  },
  {
    title: { en: "Bachelorette / Stag", ru: "Девичник / мальчишник", he: "מסיבות רווקות / רווקים", ar: "حفلات عزّاب" },
    description: {
      en: "Late-night lanes, cocktails and a reserved area for groups of 8+.",
      ru: "Поздние дорожки, коктейли и отдельная зона для групп от 8.",
      he: "מסלולים בלייט, קוקטיילים ואזור שמור לקבוצות 8+.",
      ar: "مسارات الليل، كوكتيلات، ومنطقة محجوزة لمجموعات من 8 أشخاص فأكثر.",
    },
  },
]

export const branches: Branch[] = [
  {
    slug: "ramat-gan",
    domains: ["rgbowling.com", "www.rgbowling.com", "ramat-gan.local"],
    displayName: {
      en: "Bowling Ramat Gan",
      ru: "Боулинг Рамат-Ган",
      he: "באולינג רמת גן",
      ar: "بولينج رمات غان",
    },
    shortName: {
      en: "Ramat Gan",
      ru: "Рамат-Ган",
      he: "רמת גן",
      ar: "رمات غان",
    },
    address: {
      en: "18 Aluf Sade St, Ramat Gan",
      ru: "ул. Алуф Саде 18, Рамат-Ган",
      he: "אלוף שדה 18, רמת גן",
      ar: "شارع ألوف ساديه 18، رمات غان",
    },
    city: {
      en: "Ramat Gan",
      ru: "Рамат-Ган",
      he: "רמת גן",
      ar: "رمات غان",
    },
    phone: "+972 3-575-1100",
    whatsapp: "972545751100",
    email: "info@rgbowling.com",
    mapUrl: "https://maps.google.com/?q=32.0853,34.8089",
    geo: { lat: 32.0853, lng: 34.8089 },
    hours: israeliWeek,
    hero: {
      image: "/branches/ramat-gan/hero.jpg",
      headline: {
        en: "Bowling night, Ramat Gan style",
        ru: "Боулинг-вечер по-рамат-гански",
        he: "ערב באולינג, סטייל רמת גן",
        ar: "ليلة بولينج على طريقة رمات غان",
      },
      tagline: {
        en: "20 lanes, kosher kitchen, party rooms - open every night.",
        ru: "20 дорожек, кошерная кухня, залы для мероприятий - открыто каждый вечер.",
        he: "20 מסלולים, מטבח כשר, חדרי אירועים - פתוחים כל ערב.",
        ar: "20 مسارًا، مطبخ كوشير، قاعات حفلات - مفتوح كل ليلة.",
      },
    },
    prices: [
      {
        label: { en: "Adult game", ru: "Игра взрослого", he: "משחק מבוגר", ar: "لعبة بالغ" },
        weekday: "₪42",
        weekend: "₪52",
      },
      {
        label: { en: "Child game (under 12)", ru: "Детская игра (до 12)", he: "משחק ילד (עד 12)", ar: "لعبة طفل (أقل من 12)" },
        weekday: "₪32",
        weekend: "₪42",
      },
      {
        label: { en: "Lane per hour", ru: "Дорожка в час", he: "מסלול לשעה", ar: "مسار للساعة" },
        weekday: "₪160",
        weekend: "₪200",
      },
    ],
    shoeRental: { weekday: "₪10", weekend: "₪10" },
    packages: sharedPackages,
    events: sharedEvents,
    menu: sharedMenu,
    google: sharedGoogle("ramat-gan"),
    seo: {
      title: {
        en: "Bowling Ramat Gan - Lanes, Kitchen, Birthdays",
        ru: "Боулинг Рамат-Ган - дорожки, кухня, дни рождения",
        he: "באולינג רמת גן - מסלולים, מטבח וימי הולדת",
        ar: "بولينج رمات غان - مسارات ومطبخ وأعياد ميلاد",
      },
      description: {
        en: "20 bowling lanes, kosher kitchen, party rooms and birthday packages in central Ramat Gan.",
        ru: "20 дорожек, кошерная кухня, залы и пакеты для дней рождения в центре Рамат-Гана.",
        he: "20 מסלולי באולינג, מטבח כשר, חדרי אירועים וחבילות יום הולדת במרכז רמת גן.",
        ar: "20 مسار بولينج، مطبخ كوشير، قاعات حفلات وحزم أعياد ميلاد في وسط رمات غان.",
      },
    },
    brandAccent: "cherry",
  },
  {
    slug: "rishon-letsiyon",
    domains: ["rlbowling.com", "www.rlbowling.com", "rishon-letsiyon.local"],
    displayName: {
      en: "Bowling Rishon LeTsiyon",
      ru: "Боулинг Ришон-ле-Цион",
      he: "באולינג ראשון לציון",
      ar: "بولينج ريشون لتسيون",
    },
    shortName: {
      en: "Rishon",
      ru: "Ришон",
      he: "ראשון",
      ar: "ريشون",
    },
    address: {
      en: "21 Sakharov St, Rishon LeTsiyon",
      ru: "ул. Сахарова 21, Ришон-ле-Цион",
      he: "סחרוב 21, ראשון לציון",
      ar: "شارع ساخاروف 21، ريشون لتسيون",
    },
    city: {
      en: "Rishon LeTsiyon",
      ru: "Ришон-ле-Цион",
      he: "ראשון לציון",
      ar: "ريشون لتسيون",
    },
    phone: "+972 3-942-2200",
    whatsapp: "972549422200",
    email: "info@rlbowling.com",
    mapUrl: "https://maps.google.com/?q=31.9730,34.7925",
    geo: { lat: 31.973, lng: 34.7925 },
    hours: israeliWeek,
    hero: {
      image: "/branches/rishon/hero.jpg",
      headline: {
        en: "South Tel Aviv's biggest bowling floor",
        ru: "Крупнейший боулинг юга Тель-Авива",
        he: "אולם הבאולינג הגדול בדרום תל אביב",
        ar: "أكبر صالة بولينج في جنوب تل أبيب",
      },
      tagline: {
        en: "24 lanes, arcade, sports bar - five minutes from Cinema City.",
        ru: "24 дорожки, аркада, спорт-бар - пять минут от Cinema City.",
        he: "24 מסלולים, ארקייד וספורטס בר - חמש דקות מסינמה סיטי.",
        ar: "24 مسارًا، أركيد، وبار رياضي - خمس دقائق من سينما سيتي.",
      },
    },
    prices: [
      {
        label: { en: "Adult game", ru: "Игра взрослого", he: "משחק מבוגר", ar: "لعبة بالغ" },
        weekday: "₪44",
        weekend: "₪54",
      },
      {
        label: { en: "Child game (under 12)", ru: "Детская игра (до 12)", he: "משחק ילד (עד 12)", ar: "لعبة طفل (أقل من 12)" },
        weekday: "₪34",
        weekend: "₪44",
      },
      {
        label: { en: "Lane per hour", ru: "Дорожка в час", he: "מסלול לשעה", ar: "مسار للساعة" },
        weekday: "₪180",
        weekend: "₪220",
      },
    ],
    shoeRental: { weekday: "₪10", weekend: "₪10" },
    packages: sharedPackages,
    events: sharedEvents,
    menu: sharedMenu,
    google: sharedGoogle("rishon-letsiyon"),
    seo: {
      title: {
        en: "Bowling Rishon LeTsiyon - 24 Lanes, Arcade, Birthdays",
        ru: "Боулинг Ришон-ле-Цион - 24 дорожки, аркада, дни рождения",
        he: "באולינג ראשון לציון - 24 מסלולים, ארקייד וימי הולדת",
        ar: "بولينج ريشون لتسيون - 24 مسار، أركيد وأعياد ميلاد",
      },
      description: {
        en: "24 lanes, arcade, sports bar and birthday packages in Rishon LeTsiyon - minutes from Cinema City.",
        ru: "24 дорожки, аркада, спорт-бар и пакеты для дней рождения в Ришон-ле-Ционе.",
        he: "24 מסלולי באולינג, ארקייד וספורטס בר וחבילות יום הולדת בראשון לציון, ליד סינמה סיטי.",
        ar: "24 مسارًا، أركيد، بار رياضي، وحزم أعياد ميلاد في ريشون لتسيون، بالقرب من سينما سيتي.",
      },
    },
    brandAccent: "teal",
  },
]

const branchBySlug = new Map(branches.map((b) => [b.slug, b]))
const branchByDomain = new Map<string, Branch>()
for (const b of branches) {
  for (const d of b.domains) {
    branchByDomain.set(d.toLowerCase(), b)
  }
}

export const defaultBranch = branches[0]

export function getBranchBySlug(slug: string | null | undefined): Branch | undefined {
  if (!slug) return undefined
  return branchBySlug.get(slug)
}

export function getBranchByHost(host: string | null | undefined): Branch | undefined {
  if (!host) return undefined
  const cleaned = host.toLowerCase().split(":")[0]
  return branchByDomain.get(cleaned)
}

export function resolveBranch(input: {
  override?: string | null
  host?: string | null
}): Branch {
  return (
    getBranchBySlug(input.override) ??
    getBranchByHost(input.host) ??
    defaultBranch
  )
}
