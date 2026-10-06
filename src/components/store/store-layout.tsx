import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { MenuIcon, SearchIcon, ShoppingCartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getBanners } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/lib/settings";
import { isDemoMode } from "@/lib/supabase";
import { useAsync } from "@/lib/use-async";
import { cn } from "@/lib/utils";
import { CUSTOM_STICKER_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import { CartSheet } from "./cart-sheet";
import { StoreFooter } from "./store-footer";
import { WhatsappIcon } from "./whatsapp-icon";

const NAV = [
  { to: "/", label: "الرئيسية", end: true },
  { to: "/shop", label: "المتجر" },
  { to: "/shop?kind=pack", label: "الباكدجات" },
  { to: "/#custom", label: "صمم بنفسك" },
  { to: "/#b2b", label: "للشركات والإيفنتات" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "font-display text-4xl leading-none text-primary [text-shadow:3px_3px_0_var(--accent)]",
        className,
      )}
    >
      حتة
    </Link>
  );
}

/** "/shop?kind=pack" and "/#custom" share a path with other links, so match on query and hash too. */
function isActive(to: string, pathname: string, search: string, hash: string) {
  const i = to.search(/[?#]/)
  const path = i === -1 ? to : to.slice(0, i) || '/'
  const rest = i === -1 ? '' : to.slice(i)
  if (rest.startsWith('#')) return pathname === '/' && hash === rest
  if (rest.startsWith('?')) return pathname === path && search === rest
  if (path === '/') return pathname === '/' && !hash
  return pathname === path && !search.includes('kind=pack')
}

export function StoreLayout() {
  const { count, setOpen } = useCart();
  const { settings } = useSettings();
  const { data: announce } = useAsync(() => getBanners("announcement"), []);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { pathname, hash, search: qs } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Router links like "/#custom" don't scroll on their own.
  useEffect(() => {
    if (hash)
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
    setMenu(false);
  };

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3"
      >
        تخطّى للمحتوى
      </a>
      {isDemoMode && (
        <div className="bg-orange-strong px-4 py-2 text-center text-sm text-white">
          وضع تجريبي: البيانات دي للعرض بس. وصّل Supabase من ملف .env عشان تظهر
          منتجاتك.
        </div>
      )}
      {announce?.[0] && (
        <div
          role="region"
          aria-label="إعلان"
          dir="ltr"
          className="group overflow-hidden py-2.5 text-xs text-white md:text-sm"
          style={{ background: announce[0].bg_color }}
        >
          <div className="marquee-track flex w-max group-hover:[animation-play-state:paused]">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1} className="flex shrink-0">
                {Array.from({ length: 24 }, (_, i) => (
                  <span key={i} dir="rtl" className="flex items-center gap-6 pe-6 font-medium whitespace-nowrap">
                    {announce[0].title}
                    <span aria-hidden="true">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-card px-3 py-2 transition-shadow duration-200 md:px-4",
            scrolled ? "shadow-sticker" : "shadow-sticker-sm",
          )}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="outlineInk"
              size="icon"
              className="lg:hidden"
              aria-label="القائمة"
              onClick={() => setMenu(true)}
            >
              <MenuIcon />
            </Button>
            <Logo className="px-1" />
          </div>
          <nav
            aria-label="القائمة الرئيسية"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV.map((n) => {
              const active = isActive(n.to, pathname, qs, hash);
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full border-2 px-4 py-1.5 font-medium whitespace-nowrap outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    active
                      ? "border-ink bg-accent shadow-[2px_2px_0_var(--ink)]"
                      : "border-transparent hover:bg-secondary",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <form onSubmit={search} role="search" className="hidden md:block">
              <label htmlFor="h-search" className="sr-only">
                ابحث عن استيكر
              </label>
              <div className="group relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="h-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ابحث…"
                  className="w-36 rounded-full border-2 border-transparent bg-secondary ps-9 transition-[width,background-color,border-color] duration-300 focus:w-56 focus:border-ink focus:bg-card xl:w-48 xl:focus:w-64"
                />
              </div>
            </form>
            <Button
              variant="sticker"
              className="relative rounded-full px-5"
              onClick={() => setOpen(true)}
              aria-label={`السلة، ${count} حتة`}
            >
              <ShoppingCartIcon className="size-5" />
              <span className="hidden sm:inline">السلة</span>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 14 }}
                  className="absolute -top-2.5 -start-2.5 grid min-w-6 place-items-center rounded-full border-2 border-ink bg-orange px-1 text-xs font-bold text-white"
                >
                  {count}
                </motion.span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent
          side="right"
          className="gap-6 p-6"
          aria-describedby={undefined}
        >
          <SheetTitle className="text-primary">حتة</SheetTitle>
          <form onSubmit={search} role="search">
            <label htmlFor="m-search" className="sr-only">
              ابحث عن استيكر
            </label>
            <Input
              id="m-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن استيكر…"
              className="border-2 border-ink"
            />
          </form>
          <nav
            aria-label="القائمة"
            className="flex flex-col gap-1 text-lg font-medium"
          >
            {NAV.map((n) => {
              const active = isActive(n.to, pathname, qs, hash);
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  onClick={() => setMenu(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 transition",
                    active
                      ? "border-ink bg-accent shadow-[3px_3px_0_var(--ink)]"
                      : "border-transparent hover:bg-secondary",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <motion.main
        key={pathname}
        id="main"
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Outlet />
      </motion.main>

      <StoreFooter />

      {settings.whatsapp_number && !pathname.startsWith("/p/") && (
        <a
          href={whatsappLink(settings.whatsapp_number, CUSTOM_STICKER_MESSAGE)}
          target="_blank"
          rel="noreferrer"
          aria-label="كلمنا على الواتساب"
          className="fixed bottom-5 left-5 z-30 grid size-14 place-items-center rounded-full border-[3px] border-ink bg-primary text-white shadow-sticker-sm transition hover:-translate-y-0.5"
        >
          <WhatsappIcon className="size-6" />
        </a>
      )}
      <CartSheet />
    </div>
  );
}
