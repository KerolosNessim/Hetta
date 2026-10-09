import { Fragment } from "react";
import { Reveal } from "@/components/motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { ProductCard } from "@/components/store/product-card";
import { Carousel } from "@/components/store/carousel";
import { Hero } from "@/components/store/hero";
import { PartnershipsSection } from "@/components/store/partnerships-section";
import { ReviewsSection } from "@/components/store/reviews-section";
import { CategoryArt, hasCategoryArt } from "@/components/store/category-art";
import { inkFor } from "@/components/store/sticker-art";
import { WhatsappIcon } from "@/components/store/whatsapp-icon";
import { getCategories, getProducts } from "@/lib/api";
import { useSettings } from "@/lib/settings";
import { useAsync } from "@/lib/use-async";
import {
  CUSTOM_STICKER_MESSAGE,
  whatsappLink,
} from "@/lib/whatsapp";

function SectionHead({
  id,
  title,
  more,
}: {
  id: string;
  title: string;
  more?: { to: string; label: string };
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 id={id} className="font-display text-3xl md:text-[2.75rem]">
        {title}
      </h2>
      {more && (
        <Link
          to={more.to}
          className="font-semibold text-primary hover:underline"
        >
          {more.label}
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const { settings } = useSettings();
  const cats = useAsync(() => getCategories({ homeOnly: true }), []);
  const best = useAsync(() => getProducts({ featured: true, limit: 8 }), []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 pt-6 md:px-6 md:pt-8">
      <section aria-label="البانر الرئيسي">
        <Hero />
      </section>

      
        <section aria-labelledby="cats-h">
          <SectionHead
            id="cats-h"
            title="الأقسام"
            more={{ to: "/shop", label: "كل الأقسام" }}
          />
          <Carousel label="الأقسام" loop={!cats.loading}>
            {cats.loading
              ? Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-48 md:h-56" />
                ))
              : cats.data?.map((c) => (
                  <Fragment key={c.id}>
                  <Link
                    to={`/shop?cat=${c.slug}`}
                    className="group flex flex-col gap-3 rounded-2xl border-2 border-ink bg-card p-3 transition hover:-translate-y-0.5 hover:shadow-sticker-sm"
                  >
                    <span
                      className="grid h-28 place-items-center overflow-hidden rounded-xl font-display text-2xl md:h-36"
                      style={{ background: c.color, color: inkFor(c.color) }}
                    >
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : hasCategoryArt(c.slug) ? (
                        <CategoryArt slug={c.slug} className="p-2 transition-transform group-hover:scale-105 group-hover:-rotate-3" />
                      ) : (
                        c.name.split(" ")[0]
                      )}
                    </span>
                    <span className="text-center font-semibold md:text-lg">{c.name}</span>
                  </Link>
                  </Fragment>
                ))}
          </Carousel>
        </section>

      
        <section aria-labelledby="best-h">
          <SectionHead
            id="best-h"
            title="الأكثر طلباً"
            more={{ to: "/shop", label: "شوف الكل" }}
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] md:gap-6">
            {best.loading
              ? Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-80" />
                ))
              : best.data?.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    color={p.category?.color ?? "#0B6E6D"}
                  />
                ))}
          </div>
          {!best.loading && !best.data?.length && (
            <p className="text-muted-foreground">
              علّم منتجات كـ "مميز" من الداشبورد وهتظهر هنا.
            </p>
          )}
        </section>

      <ReviewsSection />

      <Reveal>
        <section
          id="custom"
          aria-labelledby="custom-h"
          className="scroll-mt-24"
        >
          <div className="flex flex-wrap items-center gap-10 rounded-[2rem] border-[3px] border-ink bg-accent p-6 md:p-12">
            <div className="flex flex-[1_1_340px] flex-col gap-4">
              <h2
                id="custom-h"
                className="font-display text-4xl leading-tight md:text-5xl"
              >
                صمم بنفسك
                <br />
                بفكرتك إنت
              </h2>
              <p className="text-lg leading-8">
                صورتك، اسمك، جملة بتحبها، أو لوجو. ابعتلنا على الواتساب ونرجعلك
                بالتصميم قبل الطباعة.
              </p>
              {settings.whatsapp_number ? (
                <Button
                  asChild
                  size="lg"
                  className="self-start bg-ink text-white hover:bg-ink/90"
                >
                  <a
                    href={whatsappLink(
                      settings.whatsapp_number,
                      CUSTOM_STICKER_MESSAGE,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <WhatsappIcon className="size-5" />
                    ابعت فكرتك على الواتساب
                  </a>
                </Button>
              ) : (
                <p className="text-sm font-medium">
                  ضيف رقم الواتساب من الداشبورد ← الإعدادات عشان الزرار يظهر.
                </p>
              )}
            </div>
            <ol className="flex flex-[1_1_340px] flex-col gap-3">
              {[
                "ابعت الصورة أو الفكرة والمقاس",
                "نبعتلك التصميم توافق عليه",
                "نطبع ونشحنلك لحد البيت",
              ].map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-4 rounded-2xl border-2 border-ink bg-card px-5 py-4 text-lg"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-bold text-white">
                    {(i + 1).toLocaleString("ar-EG")}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Reveal>

      <PartnershipsSection />
    </div>
  );
}
