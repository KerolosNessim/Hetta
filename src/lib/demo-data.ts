// Shown only while Supabase is not connected. Prices are placeholders, not real pricing.
import type { Banner, Category, Product, Settings } from "./types";

export const demoCategories: Category[] = [
  {
    id: "c1",
    name: "كليات وطلبة",
    slug: "college",
    color: "#0B6E6D",
    image_url: null,
    is_visible: true,
    show_on_home: true,
    sort_order: 1,
  },
  {
    id: "c2",
    name: "إفيهات مصري",
    slug: "egyptian-memes",
    color: "#FFB627",
    image_url: null,
    is_visible: true,
    show_on_home: true,
    sort_order: 2,
  },
  {
    id: "c3",
    name: "كيوت ومينيمال",
    slug: "cute",
    color: "#FFC6DD",
    image_url: null,
    is_visible: true,
    show_on_home: true,
    sort_order: 3,
  },
  {
    id: "c4",
    name: "قهوة وشاي",
    slug: "coffee",
    color: "#F25C05",
    image_url: null,
    is_visible: true,
    show_on_home: true,
    sort_order: 4,
  },
  {
    id: "c5",
    name: "باكدجات",
    slug: "packs",
    color: "#1B1B1B",
    image_url: null,
    is_visible: true,
    show_on_home: true,
    sort_order: 5,
  },
];

const sizes = (base: number) => [
  {
    name: "صغير",
    dimensions: null,
    price: base,
    is_available: true,
    sort_order: 1,
  },
  {
    name: "وسط",
    dimensions: null,
    price: base + 10,
    is_available: true,
    sort_order: 2,
  },
  {
    name: "كبير",
    dimensions: null,
    price: base + 20,
    is_available: true,
    sort_order: 3,
  },
];

const p = (
  id: string,
  name: string,
  slug: string,
  catId: string,
  extra: Partial<Product> = {},
): Product => {
  const cat = demoCategories.find((c) => c.id === catId)!;
  return {
    id,
    name,
    slug,
    description:
      "استيكر فينيل ضد المية، يتلزق على اللابتوب والإزازة والموبايل ويتشال من غير ما يسيب أثر.",
    category_id: catId,
    kind: "single",
    badge: null,
    finishes: ["matte", "gloss"],
    images: [],
    is_published: true,
    is_featured: false,
    sort_order: 0,
    product_sizes: sizes(20),
    category: { id: cat.id, name: cat.name, slug: cat.slug, color: cat.color },
    ...extra,
  };
};

export const demoProducts: Product[] = [
  p("p1", "باكدج طالب هندسة", "engineering-pack", "c1", {
    kind: "pack",
    badge: "best_seller",
    is_featured: true,
    product_sizes: sizes(90),
  }),
  p("p2", "قهوة الأول", "coffee-first", "c4", { is_featured: true }),
  p("p3", "ذاكر بقى", "study-now", "c1", { badge: "new", is_featured: true }),
  p("p4", "يلا بينا", "yalla-bina", "c2", { is_featured: true }),
  p("p5", "باكدج طالب طب", "medicine-pack", "c1", {
    kind: "pack",
    product_sizes: sizes(90),
  }),
  p("p6", "آخر ترم", "last-term", "c1"),
  p("p7", "نوم الامتحانات", "exam-nap", "c3"),
  p("p8", "باكدج ١٠ حتت", "ten-pack", "c5", {
    kind: "pack",
    product_sizes: sizes(150),
  }),
];

export const demoBanners: Banner[] = [
  {
    id: "b1",
    title: "لزّق حتة من شخصيتك",
    subtitle:
      "استيكرات للابتوب والإزازة والموبايل والكشكول. اختار اللي يشبهك، والأوردر يتأكد على الواتساب.",
    placement: "home_hero",
    cta_label: "بص بصه🤣",
    cta_target: "shop",
    cta_value: null,
    bg_color: "#0B6E6D",
    image_desktop_url: null,
    image_mobile_url: null,
    starts_at: null,
    ends_at: null,
    is_active: true,
    sort_order: 1,
  },
  {
    id: "b2",
    title: "شحن لكل محافظات مصر · الطلب بيكمل على الواتساب في ثانية",
    subtitle: null,
    placement: "announcement",
    cta_label: null,
    cta_target: "shop",
    cta_value: null,
    bg_color: "#1B1B1B",
    image_desktop_url: null,
    image_mobile_url: null,
    starts_at: null,
    ends_at: null,
    is_active: true,
    sort_order: 1,
  },
];

export const demoSettings: Settings = {
  whatsapp_number: "",
  instagram_handle: "hetta.eg",
  tiktok_handle: null,
  shipping_note: "شحن لكل محافظات مصر. الدفع كاش عند الاستلام أو إنستاباي.",
  bulk_min_qty: null,
};
