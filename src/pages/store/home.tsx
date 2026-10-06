import { Reveal } from "@/components/motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { ProductCard } from "@/components/store/product-card";
import { inkFor } from "@/components/store/sticker-art";
import { WhatsappIcon } from "@/components/store/whatsapp-icon";
import { getBanners, getCategories, getProducts } from "@/lib/api";
import { useSettings } from "@/lib/settings";
import type { Banner } from "@/lib/types";
import { useAsync } from "@/lib/use-async";
import {
  BULK_MESSAGE,
  CUSTOM_STICKER_MESSAGE,
  whatsappLink,
} from "@/lib/whatsapp";

export function bannerHref(b: Banner, whatsapp: string) {
  switch (b.cta_target) {
    case "category":
      return `/shop?cat=${b.cta_value ?? ""}`;
    case "product":
      return `/p/${b.cta_value ?? ""}`;
    case "whatsapp":
      return whatsappLink(whatsapp, b.cta_value || "أهلاً حتة");
    case "url":
      return b.cta_value || "/shop";
    default:
      return "/shop";
  }
}

function CtaLink({
  href,
  children,
  className,
  variant,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "sticker" | "stickerPrimary" | "outlineInk";
}) {
  const external = href.startsWith("http");
  return (
    <Button
      asChild
      variant={variant ?? "sticker"}
      size="lg"
      className={className}
    >
      {external ? (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      ) : (
        <Link to={href}>{children}</Link>
      )}
    </Button>
  );
}

function Hero() {
  const { settings } = useSettings();
  const { data } = useAsync(() => getBanners("home_hero"), []);
  const b = data?.[0];
  if (!b) return <Skeleton className="h-[420px] rounded-[2rem]" />;
  const fg = inkFor(b.bg_color);

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border-[3px] border-ink shadow-sticker-lg"
      style={{ background: b.bg_color }}
    >
      {b.image_desktop_url && (
        <picture>
          {b.image_mobile_url && (
            <source media="(max-width: 767px)" srcSet={b.image_mobile_url} />
          )}
          <img
            src={b.image_desktop_url}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        </picture>
      )}
      <div className="relative flex flex-wrap items-center gap-10 p-6 md:p-14">
        <div className="flex flex-[1_1_420px] flex-col gap-5">
          <span className="self-start rounded-full bg-orange px-3.5 py-1.5 text-sm font-semibold text-white mb-6 inline-block [text-shadow:2px_2px_0_var(--ink)]">
            ماتجرب يا أخي
            
            </span>
          <h1 className="font-display text-5xl leading-[1.05] text-accent [text-shadow:4px_4px_0_var(--ink)] md:text-7xl">
            {b.title}
          </h1>
          {b.subtitle && (
            <p
              className="max-w-md text-base leading-8 md:text-xl"
              style={{ color: fg }}
            >
              {b.subtitle}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-3">
            {b.cta_label && (
              <CtaLink  href={bannerHref(b, settings.whatsapp_number)}>
                {b.cta_label}
              </CtaLink>
            )}
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="border-2 border-current hover:bg-white/10"
              style={{ color: fg }}
            >
              <a href="#custom">صمم بنفسك</a>
            </Button>
          </div>
        </div>
        {!b.image_desktop_url && (
          <div
            aria-hidden="true"
            className="relative hidden h-80 flex-[1_1_340px] md:block"
          >
            <span style={{ "--float": "-10px", "--dur": "4s" } as React.CSSProperties} className="animate-float absolute top-2 right-8 grid size-48 -rotate-[10deg] place-items-center rounded-full border-[10px] border-white bg-accent font-display text-5xl shadow-sticker"
            >
              يلا بينا
            </span>
            <span style={{ "--float": "8px", "--dur": "5s" } as React.CSSProperties} className="animate-float absolute top-28 left-4 grid h-32 w-56 rotate-[8deg] place-items-center rounded-3xl border-[10px] border-white bg-orange font-display text-4xl text-white shadow-sticker"
            >
              قهوة الأول
            </span>
            <span style={{ "--float": "-7px", "--dur": "4.5s" } as React.CSSProperties} className="animate-float absolute right-28 bottom-0 grid h-28 w-44 -rotate-[4deg] place-items-center rounded-2xl border-[10px] border-white bg-background font-display text-3xl text-primary shadow-sticker"
            >
              ذاكر بقى
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const middle = useAsync(() => getBanners("home_middle"), []);

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
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-[repeat(auto-fit,minmax(170px,1fr))] md:gap-4 md:overflow-visible md:px-0">
            {cats.loading
              ? Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-36 min-w-36" />
                ))
              : cats.data?.map((c) => (
                  <Link
                    key={c.id}
                    to={`/shop?cat=${c.slug}`}
                    className="flex min-w-36 flex-col gap-3 rounded-2xl border-2 border-ink bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-sticker-sm"
                  >
                    <span
                      className="grid h-20 place-items-center overflow-hidden rounded-xl font-display text-2xl"
                      style={{ background: c.color, color: inkFor(c.color) }}
                    >
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        c.name.split(" ")[0]
                      )}
                    </span>
                    <span className="font-semibold">{c.name}</span>
                  </Link>
                ))}
          </div>
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

      {middle.data?.[0] && (
        <Reveal>
          <section aria-label={middle.data[0].title}>
            <div
              className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] border-[3px] border-ink p-8 md:p-12"
              style={{
                background: middle.data[0].bg_color,
                color: inkFor(middle.data[0].bg_color),
              }}
            >
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-4xl md:text-5xl">
                  {middle.data[0].title}
                </h2>
                {middle.data[0].subtitle && (
                  <p className="text-lg">{middle.data[0].subtitle}</p>
                )}
              </div>
              {middle.data[0].cta_label && (
                <CtaLink
                  href={bannerHref(middle.data[0], settings.whatsapp_number)}
                  variant="outlineInk"
                >
                  {middle.data[0].cta_label}
                </CtaLink>
              )}
            </div>
          </section>
        </Reveal>
      )}

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

      <Reveal>
        <section id="b2b" aria-labelledby="b2b-h" className="scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-ink p-6 text-white md:p-12">
            <div className="flex max-w-xl flex-col gap-3">
              <h2
                id="b2b-h"
                className="font-display text-4xl text-accent md:text-5xl"
              >
                ورك سبيس أو إيفنت؟
              </h2>
              <p className="text-lg leading-8 text-secondary">
                استيكرات بلوجو مكانك أو اسم الإيفنت، بأسعار خاصة للكميات
                {settings.bulk_min_qty
                  ? ` من ${settings.bulk_min_qty.toLocaleString("ar-EG")} قطعة`
                  : ""}
                .
              </p>
            </div>
            {settings.whatsapp_number && (
              <CtaLink
                href={whatsappLink(settings.whatsapp_number, BULK_MESSAGE)}
              >
                اطلب عرض سعر
              </CtaLink>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
