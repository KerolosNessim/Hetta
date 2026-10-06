import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { Card, CardContent } from "@/components/ui/misc";
import { adminSaveSettings } from "@/lib/api";
import { useSettings } from "@/lib/settings";
import type { Settings } from "@/lib/types";
import { normalizeWhatsapp, whatsappLink } from "@/lib/whatsapp";

export default function AdminSettingsPage() {
  const { settings, reload } = useSettings();
  const [form, setForm] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(settings), [settings]);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const digits = normalizeWhatsapp(form.whatsapp_number);
    if (digits && !/^20\d{10}$/.test(digits))
      return toast.error("رقم الواتساب لازم يكون مصري، مثلاً 01012345678");
    setSaving(true);
    try {
      await adminSaveSettings({
        ...form,
        whatsapp_number: digits,
        instagram_handle: form.instagram_handle?.replace("@", "") || null,
        tiktok_handle: form.tiktok_handle?.replace("@", "") || null,
      });
      toast.success("اتحفظ");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حصلت مشكلة");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="الإعدادات"
        description="رقم الواتساب ده هو اللي كل الأوردرات وزرار صمم بنفسك بيبعتوا عليه."
      />
      <Card className="max-w-2xl">
        <form onSubmit={save}>
          <CardContent>
            <Field
              label="رقم الواتساب"
              htmlFor="s-wa"
              hint="اكتبه زي ما هو: 01012345678"
            >
              <div className="flex gap-2">
                <Input
                  id="s-wa"
                  dir="ltr"
                  inputMode="tel"
                  className="text-end"
                  value={form.whatsapp_number}
                  onChange={(e) => set("whatsapp_number", e.target.value)}
                />
                {form.whatsapp_number && (
                  <Button asChild variant="outline">
                    <a
                      href={whatsappLink(
                        form.whatsapp_number,
                        "تجربة من داشبورد حتة",
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      جرّب
                    </a>
                  </Button>
                )}
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="إنستغرام" htmlFor="s-ig">
                <Input
                  id="s-ig"
                  dir="ltr"
                  placeholder="hetta.eg"
                  value={form.instagram_handle ?? ""}
                  onChange={(e) => set("instagram_handle", e.target.value)}
                />
              </Field>
              <Field label="تيك توك" htmlFor="s-tt">
                <Input
                  id="s-tt"
                  dir="ltr"
                  value={form.tiktok_handle ?? ""}
                  onChange={(e) => set("tiktok_handle", e.target.value)}
                />
              </Field>
            </div>
            <Field
              label="ملاحظة الشحن والدفع"
              htmlFor="s-ship"
              hint="بتظهر في صفحة المنتج وفي السلة"
            >
              <Textarea
                id="s-ship"
                rows={3}
                value={form.shipping_note ?? ""}
                onChange={(e) => set("shipping_note", e.target.value)}
              />
            </Field>
            <Field label="أقل كمية لطلبات الشركات (اختياري)" htmlFor="s-bulk">
              <Input
                id="s-bulk"
                type="number"
                min={1}
                value={form.bulk_min_qty ?? ""}
                onChange={(e) =>
                  set(
                    "bulk_min_qty",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </Field>
            <Button type="submit" className="self-start" disabled={saving}>
              {saving ? "بيحفظ…" : "حفظ"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </>
  );
}
