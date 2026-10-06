import { FINISH_LABEL } from './types'
import type { CartItem } from './cart'

export type DeliveryInfo = { name: string; phone: string; governorate: string; address: string; notes: string }

/** Egyptian local numbers (010…) become 2010… for wa.me. */
export function normalizeWhatsapp(number: string) {
  const digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) return `2${digits}`
  return digits
}

export function whatsappLink(number: string, message: string) {
  const n = normalizeWhatsapp(number)
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`
}

export function orderMessage(items: CartItem[], info: DeliveryInfo) {
  const lines = items.map(
    (it) => `• ${it.name} (${it.sizeName}، ${FINISH_LABEL[it.finish]}) × ${it.qty} = ${it.price * it.qty} ج`,
  )
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0)
  return [
    'أهلاً حتة، عايز أطلب:',
    ...lines,
    `المجموع: ${subtotal} ج (من غير الشحن)`,
    '',
    `الاسم: ${info.name}`,
    `الموبايل: ${info.phone}`,
    `المحافظة: ${info.governorate}`,
    `العنوان: ${info.address}`,
    info.notes ? `ملاحظات: ${info.notes}` : '',
  ]
    .filter((l) => l !== '')
    .join('\n')
}

export const CUSTOM_STICKER_MESSAGE = 'أهلاً حتة، عايز أصمم استيكر بفكرتي. هبعتلكم الصورة أو الفكرة والمقاس اللي عايزه.'
export const BULK_MESSAGE = 'أهلاً حتة، عايز عرض سعر لاستيكرات بالكمية لـ (ورك سبيس / إيفنت / شركة).'

export const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ',
  'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا',
  'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء',
]
