import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpLeftIcon } from "lucide-react";
import { getCategories } from "@/lib/api";
import { useSettings } from "@/lib/settings";
import { useAsync } from "@/lib/use-async";
import { CUSTOM_STICKER_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import { inkFor, tiltFor } from "./sticker-art";
import { WhatsappIcon } from "./whatsapp-icon";

const YEAR = new Date()
  .getFullYear()
  .toLocaleString("ar-EG", { useGrouping: false });

const linkClass =
  "w-fit rounded-sm py-0.5 text-[#fff6e5]/80 underline-offset-4 transition hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent";

/**
 * Footer as the backing sheet the stickers peel off: category chips are die-cut
 * stickers, the custom-order CTA is the one big sticker, and the wordmark sits
 * cropped at the bottom edge like the logo printed on the sheet.
 */
export function StoreFooter() {
  const { settings } = useSettings();
  const { data: categories } = useAsync(() => getCategories(), []);
  const chat = settings.whatsapp_number
    ? whatsappLink(settings.whatsapp_number, CUSTOM_STICKER_MESSAGE)
    : null;

  return (
    <footer className="relative mt-24 overflow-x-clip bg-teal-strong text-[#fff6e5]">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-0 pb-10 md:px-6 lg:grid-cols-[1.1fr_1fr]">
        {/* the one loud element: a sticker that overlaps the top edge */}
        <div className="-mt-10 lg:-mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -8 }}
            whileInView={{ opacity: 1, y: 0, rotate: -2 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="max-w-md rounded-2xl border-[5px] border-white bg-accent p-6 text-ink shadow-[6px_6px_0_rgba(0,0,0,.35)] md:p-7"
          >
            <p className="font-display text-3xl leading-tight md:text-4xl">
              عايز استيكر بتصميمك؟
            </p>
            <p className="mt-2 leading-7">
              ابعتلنا الفكرة أو الصورة، وهنرجعلك بتصميم وسعر في نفس اليوم.
            </p>
            {chat ? (
              <a
                href={chat}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-ink px-5 py-3 font-medium text-[#fff6e5] transition hover:-translate-y-0.5 hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <WhatsappIcon className="size-5" />
                كلمنا على الواتساب
              </a>
            ) : (
              <Link
                to="/#custom"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-ink px-5 py-3 font-medium text-[#fff6e5] transition hover:-translate-y-0.5 hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                صمم ينفسك
                <ArrowUpLeftIcon className="size-5" />
              </Link>
            )}
          </motion.div>
          {settings.shipping_note && (
            <p className="mt-6 max-w-md leading-7 text-[#fff6e5]/80">
              {settings.shipping_note}
            </p>
          )}
        </div>

        <div className="grid gap-10 pt-10 sm:grid-cols-2 lg:pt-12">
          <nav aria-label="أقسام المتجر" className="sm:col-span-2">
            <h2 className="mb-4 font-bold text-accent">الأقسام</h2>
            <ul className="flex flex-wrap gap-x-3 gap-y-4">
              {(categories ?? []).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/shop?cat=${c.slug}`}
                    style={{
                      background: c.color,
                      color: inkFor(c.color),
                      transform: `rotate(${tiltFor(c.id) / 2}deg)`,
                    }}
                    className="inline-block rounded-xl border-[3px] border-white px-3.5 py-1.5 font-display text-lg shadow-[3px_3px_0_rgba(0,0,0,.3)] transition hover:!rotate-0 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="تسوّق">
            <h2 className="mb-3 font-bold text-accent">تسوّق</h2>
            <ul className="flex flex-col gap-1.5">
              <li>
                <Link to="/shop" className={linkClass}>
                  كل الاستيكرات
                </Link>
              </li>
              <li>
                <Link to="/shop?kind=pack" className={linkClass}>
                  الباكدجات
                </Link>
              </li>
              <li>
                <Link to="/#custom" className={linkClass}>
                  صمم بنفسك
                </Link>
              </li>
              <li>
                <Link to="/#b2b" className={linkClass}>
                  للشركات والإيفنتات
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="تابعنا">
            <h2 className="mb-3 font-bold text-accent">تابعنا</h2>
            <ul className="flex flex-col gap-1.5">
              {settings.instagram_handle && (
                <li>
                  <a
                    href={`https://instagram.com/${settings.instagram_handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClass}
                  >
                    إنستغرام <span dir="ltr">@{settings.instagram_handle}</span>
                  </a>
                </li>
              )}
              {settings.tiktok_handle && (
                <li>
                  <a
                    href={`https://tiktok.com/@${settings.tiktok_handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClass}
                  >
                    تيك توك <span dir="ltr">@{settings.tiktok_handle}</span>
                  </a>
                </li>
              )}
              {settings.whatsapp_number && (
                <li>
                  <a
                    href={whatsappLink(settings.whatsapp_number, "أهلاً حتة")}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClass}
                  >
                    واتساب
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#fff6e5]/20 py-4 text-sm text-[#fff6e5]/70">
          <span>استيكرات فينيل ضد المية، متغلفة بإيدينا ومتشحنة لكل مصر.</span>
          <span>© {YEAR} حتة</span>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none h-[min(22vw,9.9rem)] select-none overflow-hidden"
        >
          <div className="text-center font-display text-[min(38vw,17rem)] leading-[0.9] text-primary">
            حتة
          </div>
        </div>
      </div>
    </footer>
  );
}
