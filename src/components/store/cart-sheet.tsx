import { useState } from 'react'
import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/form-controls'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { useCart } from '@/lib/cart'
import { useSettings } from '@/lib/settings'
import { FINISH_LABEL } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { GOVERNORATES, orderMessage, whatsappLink, type DeliveryInfo } from '@/lib/whatsapp'
import { StickerArt } from './sticker-art'
import { WhatsappIcon } from './whatsapp-icon'

const EMPTY: DeliveryInfo = { name: '', phone: '', governorate: '', address: '', notes: '' }

export function CartSheet() {
  const { items, open, setOpen, setQty, remove, subtotal, count, clear } = useCart()
  const { settings } = useSettings()
  const [info, setInfo] = useState<DeliveryInfo>(EMPTY)
  const [touched, setTouched] = useState(false)

  const missing = !info.name.trim() || !/^01\d{9}$/.test(info.phone.replace(/\s/g, '')) || !info.governorate || !info.address.trim()
  const noNumber = !settings.whatsapp_number

  function send() {
    setTouched(true)
    if (missing || noNumber || !items.length) return
    window.open(whatsappLink(settings.whatsapp_number, orderMessage(items, info)), '_blank', 'noopener')
    clear()
    setInfo(EMPTY)
    setTouched(false)
    setOpen(false)
  }

  const set = (k: keyof DeliveryInfo) => (e: { target: { value: string } }) => setInfo((s) => ({ ...s, [k]: e.target.value }))

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" aria-describedby="cart-desc">
        <div className="border-b-2 border-ink px-5 pt-5 pb-4">
          <SheetTitle>السلة</SheetTitle>
          <SheetDescription id="cart-desc">{count ? `${count} حتة في السلة` : 'السلة فاضية لسه'}</SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!items.length ? (
            <p className="py-16 text-center text-muted-foreground">اختار استيكرات من المتجر وهتلاقيها هنا.</p>
          ) : (
            <div className="flex flex-col gap-5">
              <ul className="flex flex-col gap-3">
                {items.map((it) => (
                  <li key={it.key} className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3">
                    <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-secondary">
                      <StickerArt label={it.name.split(' ')[0]} color={it.color} size="sm" tilt={-4} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="truncate font-semibold">{it.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {it.sizeName} · {FINISH_LABEL[it.finish]}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">{formatPrice(it.price * it.qty)}</span>
                        <div className="flex items-center rounded-lg border-2 border-ink">
                          <Button variant="ghost" size="iconSm" aria-label="زوّد" onClick={() => setQty(it.key, it.qty + 1)}>
                            <PlusIcon />
                          </Button>
                          <span className="min-w-6 text-center font-bold" aria-live="polite">{it.qty}</span>
                          {it.qty > 1 ? (
                            <Button variant="ghost" size="iconSm" aria-label="قلّل" onClick={() => setQty(it.key, it.qty - 1)}>
                              <MinusIcon />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="iconSm" aria-label={`شيل ${it.name}`} onClick={() => remove(it.key)}>
                              <Trash2Icon className="text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <form className="flex flex-col gap-3 rounded-2xl border-2 border-ink bg-card p-4" onSubmit={(e) => (e.preventDefault(), send())} noValidate>
                <div className="font-bold">بيانات التوصيل</div>
                <Field label="الاسم" htmlFor="c-name">
                  <Input id="c-name" autoComplete="name" value={info.name} onChange={set('name')} aria-invalid={touched && !info.name.trim()} />
                </Field>
                <Field label="رقم الموبايل" htmlFor="c-phone" hint={touched && !/^01\d{9}$/.test(info.phone.replace(/\s/g, '')) ? 'اكتب رقم مصري من ١١ رقم يبدأ بـ 01' : undefined}>
                  <Input id="c-phone" inputMode="tel" autoComplete="tel" dir="ltr" className="text-end" placeholder="01xxxxxxxxx" value={info.phone} onChange={set('phone')} aria-invalid={touched && !/^01\d{9}$/.test(info.phone.replace(/\s/g, ''))} />
                </Field>
                <Field label="المحافظة" htmlFor="c-gov">
                  <Select id="c-gov" value={info.governorate} onChange={set('governorate')} aria-invalid={touched && !info.governorate}>
                    <option value="">اختار المحافظة</option>
                    {GOVERNORATES.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="العنوان بالتفصيل" htmlFor="c-addr">
                  <Input id="c-addr" autoComplete="street-address" placeholder="الشارع، رقم العمارة، الدور" value={info.address} onChange={set('address')} aria-invalid={touched && !info.address.trim()} />
                </Field>
                <Field label="ملاحظات (اختياري)" htmlFor="c-notes">
                  <Textarea id="c-notes" rows={2} value={info.notes} onChange={set('notes')} />
                </Field>
              </form>
            </div>
          )}
        </div>

        {!!items.length && (
          <div className="flex flex-col gap-3 border-t-2 border-ink bg-card px-5 py-4">
            <div className="flex justify-between text-lg font-bold">
              <span>المجموع</span>
              <span className="text-primary">{formatPrice(subtotal)}</span>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">{settings.shipping_note || 'الشحن بيتحسب حسب المحافظة ويتأكد معاك على الواتساب.'}</p>
            {touched && missing && <p role="alert" className="text-sm font-medium text-destructive">كمّل بيانات التوصيل الأول.</p>}
            {noNumber && <p role="alert" className="text-sm font-medium text-destructive">رقم الواتساب لسه مش متضاف من الداشبورد ← الإعدادات.</p>}
            <Button variant="stickerPrimary" size="lg" onClick={send}>
              <WhatsappIcon className="size-5" />
              ابعت الأوردر على الواتساب
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
