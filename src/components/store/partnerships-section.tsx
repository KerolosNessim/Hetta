import { useState } from 'react'
import { CheckIcon } from 'lucide-react'
import { Reveal } from '@/components/motion'
import { CategoryArt, hasCategoryArt } from '@/components/store/category-art'
import { WhatsappIcon } from '@/components/store/whatsapp-icon'
import { Button } from '@/components/ui/button'
import { getCategories } from '@/lib/api'
import { useSettings } from '@/lib/settings'
import { useAsync } from '@/lib/use-async'
import { cn } from '@/lib/utils'
import { bulkQuoteMessage, whatsappLink } from '@/lib/whatsapp'

const OCCASIONS = ['إيفنت أو مؤتمر', 'ورك سبيس أو شركة', 'تخرج ودفعات', 'جامعة أو نادي']
const QUANTITIES = [50, 100, 250, 500, 1000]
const POINTS = [
  'اللوجو واسم الإيفنت على كل قطعة، ونبعتلك التصميم توافق عليه قبل الطباعة.',
  'سعر الواحدة بيقل كل ما الكمية تزيد.',
  'تحدد معانا ميعاد الاستلام من الأول، ونرتب الطباعة على أساسه.',
]

const n = (v: number) => v.toLocaleString('ar-EG')

/**
 * Partnerships & events: a small quote builder instead of a banner. The visitor picks the
 * occasion, the products they want branded (any category, not only stickers) and a rough
 * quantity, and the WhatsApp message to the shop is written from those choices.
 */
export function PartnershipsSection() {
  const { settings } = useSettings()
  const cats = useAsync(() => getCategories({ topOnly: true }), [])
  const [occasion, setOccasion] = useState(OCCASIONS[0])
  const [picked, setPicked] = useState<string[]>([])
  const [qty, setQty] = useState(100)

  const toggle = (name: string) => setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]))
  const ready = picked.length > 0 && !!settings.whatsapp_number

  return (
    <Reveal>
      <section id="b2b" aria-labelledby="b2b-h" className="scroll-mt-24">
        <div className="overflow-hidden rounded-[2rem] border-[3px] border-ink bg-ink p-6 text-white md:p-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            {/* pitch */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold tracking-wide text-accent">للشركات والإيفنتات والدفعات</p>
                <h2 id="b2b-h" className="font-display text-4xl leading-tight md:text-5xl">
                  كل اللي إيفنتك محتاجه،
                  <br />
                  <span className="text-accent">بلوجو مكانك</span>
                </h2>
                <p className="text-lg leading-8 text-secondary">
                  مش استيكرات بس: ماجات ودفاتر وكروت ID وكوسترز وميداليات وأقلام، بتصميمك وبكميات تناسب المناسبة.
                  {settings.bulk_min_qty ? ` الأسعار الخاصة بتبدأ من ${n(settings.bulk_min_qty)} قطعة.` : ''}
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {POINTS.map((p) => (
                  <li key={p} className="flex gap-3 leading-7">
                    <span aria-hidden="true" className="mt-1.5 size-2.5 shrink-0 rotate-45 rounded-[3px] bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* quote builder */}
            <form
              className="flex flex-col gap-7 rounded-3xl border-2 border-white/20 bg-white/[0.06] p-5 md:p-7"
              onSubmit={(e) => e.preventDefault()}
              aria-label="طلب عرض سعر"
            >
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 font-display text-2xl">
                  <span className="text-accent">١ </span>المناسبة
                </legend>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={occasion === o}
                      onClick={() => setOccasion(o)}
                      className={cn(
                        'h-11 rounded-full border-2 px-4 font-medium outline-none transition focus-visible:ring-[3px] focus-visible:ring-accent/60',
                        occasion === o ? 'border-accent bg-accent text-ink' : 'border-white/30 hover:border-white/60',
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 font-display text-2xl">
                  <span className="text-accent">٢ </span>عايز إيه عليه لوجو؟
                  <span className="ms-2 font-sans text-sm font-normal text-secondary">اختار أكتر من واحد</span>
                </legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {cats.loading && Array.from({ length: 7 }, (_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/10" />)}
                  {cats.data?.map((c) => {
                    const on = picked.includes(c.name)
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(c.name)}
                        className={cn(
                          'group relative flex flex-col gap-2 rounded-2xl border-2 p-2 text-start outline-none transition focus-visible:ring-[3px] focus-visible:ring-accent/60',
                          on ? 'border-accent bg-white/10' : 'border-white/15 hover:border-white/40',
                        )}
                      >
                        <span className="grid h-20 place-items-center overflow-hidden rounded-xl md:h-24" style={{ background: c.color }}>
                          {hasCategoryArt(c.slug) ? (
                            <CategoryArt slug={c.slug} className="p-1.5 motion-safe:transition-transform motion-safe:group-hover:-rotate-3 motion-safe:group-hover:scale-105" />
                          ) : (
                            <span className="font-display text-xl text-white">{c.name.split(' ')[0]}</span>
                          )}
                        </span>
                        <span className="px-1 pb-0.5 text-sm font-semibold">{c.name}</span>
                        {on && (
                          <span aria-hidden="true" className="absolute -top-2 -end-2 grid size-6 place-items-center rounded-full border-2 border-ink bg-accent text-ink">
                            <CheckIcon className="size-3.5" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 font-display text-2xl">
                  <span className="text-accent">٣ </span>الكمية التقريبية
                </legend>
                <div className="flex flex-wrap gap-2">
                  {QUANTITIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      aria-pressed={qty === q}
                      onClick={() => setQty(q)}
                      className={cn(
                        'h-11 min-w-20 rounded-full border-2 px-4 font-semibold outline-none transition focus-visible:ring-[3px] focus-visible:ring-accent/60',
                        qty === q ? 'border-accent bg-accent text-ink' : 'border-white/30 hover:border-white/60',
                      )}
                    >
                      {n(q)}+
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t-2 border-dashed border-white/20 pt-6">
                {settings.whatsapp_number ? (
                  <Button asChild size="lg" variant="stickerPrimary" className={cn(!ready && 'pointer-events-none opacity-50')}>
                    <a
                      href={ready ? whatsappLink(settings.whatsapp_number, bulkQuoteMessage({ occasion, items: picked, qty })) : undefined}
                      aria-disabled={!ready}
                      tabIndex={ready ? undefined : -1}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <WhatsappIcon className="size-5" />
                      اطلب عرض سعر
                    </a>
                  </Button>
                ) : (
                  <p className="text-sm text-secondary">رقم الواتساب لسه متضافش من الإعدادات.</p>
                )}
                <p className="text-sm text-secondary" aria-live="polite">
                  {picked.length ? `${n(picked.length)} ${picked.length > 10 ? 'صنف' : 'أصناف'} • ${occasion} • ${n(qty)}+ قطعة` : 'اختار صنف واحد على الأقل وهنجهزلك الرسالة.'}
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Reveal>
  )
}
