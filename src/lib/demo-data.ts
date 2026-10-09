// Shown only while Supabase is not connected. Prices are placeholders, not real pricing.
import type { Category, Product, Settings } from "./types";

const main = (id: string, name: string, slug: string, color: string, sort_order: number): Category => ({
  id,
  name,
  slug,
  color,
  image_url: null,
  parent_id: null,
  is_visible: true,
  show_on_home: true,
  sort_order,
});

export const demoCategories: Category[] = [
  main("m1", "Stickers", "stickers", "#0B6E6D", 1),
  main("m2", "Mugs", "mugs", "#F25C05", 2),
  main("m3", "Notebooks", "notebooks", "#FFB627", 3),
  main("m4", "IDs", "id-cards", "#FFC6DD", 4),
  main("m5", "Coasters", "coasters", "#FFF6E5", 5),
  main("m6", "Medals", "medals", "#1B1B1B", 6),
  main("m7", "Pens", "pens", "#0B6E6D", 7),
  {
    id: "c1",
    name: "كليات وطلبة",
    slug: "college",
    color: "#0B6E6D",
    image_url: null,
    parent_id: "m1",
    is_visible: true,
    show_on_home: false,
    sort_order: 1,
  },
  {
    id: "c2",
    name: "إفيهات مصري",
    slug: "egyptian-memes",
    color: "#FFB627",
    image_url: null,
    parent_id: "m1",
    is_visible: true,
    show_on_home: false,
    sort_order: 2,
  },
  {
    id: "c3",
    name: "كيوت ومينيمال",
    slug: "cute",
    color: "#FFC6DD",
    image_url: null,
    parent_id: "m1",
    is_visible: true,
    show_on_home: false,
    sort_order: 3,
  },
  {
    id: "c4",
    name: "قهوة وشاي",
    slug: "coffee",
    color: "#F25C05",
    image_url: null,
    parent_id: "m1",
    is_visible: true,
    show_on_home: false,
    sort_order: 4,
  },
  {
    id: "c5",
    name: "باكدجات",
    slug: "packs",
    color: "#1B1B1B",
    image_url: null,
    parent_id: "m1",
    is_visible: true,
    show_on_home: false,
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
    images: [],
    is_published: true,
    is_featured: false,
    sort_order: 0,
    product_sizes: sizes(20),
    category: { id: cat.id, name: cat.name, slug: cat.slug, color: cat.color, parent_id: cat.parent_id },
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

export const demoSettings: Settings = {
  whatsapp_number: "",
  instagram_handle: "hetta.eg",
  tiktok_handle: null,
  shipping_note: "شحن لكل محافظات مصر. الدفع كاش عند الاستلام أو إنستاباي.",
  bulk_min_qty: null,
};
