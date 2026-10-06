import { useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/admin-layout";
import { SingleImageUploader } from "@/components/admin/image-uploader";
import { inkFor } from "@/components/store/sticker-art";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Switch } from "@/components/ui/form-controls";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui/misc";
import {
  adminDeleteBanner,
  adminListBanners,
  adminSaveBanner,
} from "@/lib/api";
import {
  PLACEMENT_LABEL,
  TARGET_LABEL,
  type Banner,
  type BannerPlacement,
  type BannerTarget,
} from "@/lib/types";
import { useAsync } from "@/lib/use-async";
import { cn } from "@/lib/utils";
import { BRAND_SWATCHES } from "./categories";

type Draft = Partial<Banner> & { title: string };
const EMPTY: Draft = {
  title: "",
  subtitle: "",
  placement: "home_hero",
  cta_label: "بص بصه🤣",
  cta_target: "shop",
  cta_value: "",
  bg_color: "#0B6E6D",
  image_desktop_url: null,
  image_mobile_url: null,
  starts_at: null,
  ends_at: null,
  is_active: true,
};

function status(b: Banner): {
  label: string;
  variant: "success" | "warning" | "muted";
} {
  const now = Date.now();
  if (!b.is_active) return { label: "متوقف", variant: "muted" };
  if (b.ends_at && new Date(b.ends_at).getTime() <= now)
    return { label: "انتهى", variant: "muted" };
  if (b.starts_at && new Date(b.starts_at).getTime() > now)
    return { label: "مجدول", variant: "warning" };
  return { label: "شغّال", variant: "success" };
}

const toDateInput = (iso: string | null | undefined) =>
  iso ? iso.slice(0, 10) : "";
const fromDateInput = (v: string) =>
  v ? new Date(`${v}T00:00:00`).toISOString() : null;

const VALUE_HINT: Partial<Record<BannerTarget, string>> = {
  category: "رابط القسم، مثلاً college",
  product: "رابط المنتج، مثلاً engineering-pack",
  whatsapp: "الرسالة اللي هتتكتب للعميل في الواتساب",
  url: "رابط كامل يبدأ بـ https://",
};

export default function AdminBannersPage() {
  const { data, loading, reload } = useAsync(adminListBanners, []);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));
  const fg = inkFor(draft.bg_color ?? "#0B6E6D");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return toast.error("اكتب عنوان البانر");
    setSaving(true);
    try {
      await adminSaveBanner(draft);
      toast.success("اتحفظ");
      setDraft(EMPTY);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حصلت مشكلة");
    } finally {
      setSaving(false);
    }
  }

  async function remove(b: Banner) {
    if (!confirm(`تمسح بانر "${b.title}"؟`)) return;
    await adminDeleteBanner(b.id);
    if (draft.id === b.id) setDraft(EMPTY);
    reload();
  }

  return (
    <>
      <PageHeader
        title="البانرات"
        description="غيّر بانرات الرئيسية وشريط الإعلان من غير كود. البانر بيظهر بس بين تاريخ البداية والنهاية."
        action={
          <Button onClick={() => setDraft(EMPTY)}>
            <PlusIcon /> بانر جديد
          </Button>
        }
      />
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-3">
          {loading && <Skeleton className="h-40" />}
          {data?.map((b) => {
            const s = status(b);
            return (
              <div
                key={b.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card p-3",
                  draft.id === b.id && "border-2 border-primary",
                )}
              >
                <button
                  type="button"
                  onClick={() => setDraft(b)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-start"
                  aria-label={`تعديل ${b.title}`}
                >
                  <span
                    className="grid h-16 w-28 shrink-0 place-items-center overflow-hidden rounded-lg p-1 text-center font-display text-sm"
                    style={{
                      background: b.bg_color,
                      color: inkFor(b.bg_color),
                    }}
                  >
                    {b.image_desktop_url ? (
                      <img
                        src={b.image_desktop_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      b.title.slice(0, 18)
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {b.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {PLACEMENT_LABEL[b.placement]}
                    </span>
                  </span>
                </button>
                <Badge variant={s.variant}>{s.label}</Badge>
                <Button
                  variant="ghost"
                  size="iconSm"
                  className="text-destructive"
                  aria-label={`حذف ${b.title}`}
                  onClick={() => remove(b)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            );
          })}
          {!loading && !data?.length && (
            <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              لسه مفيش بانرات. أول بانر "الرئيسية — البانر الكبير" هو اللي بيظهر
              فوق في الصفحة الرئيسية.
            </p>
          )}
        </div>

        <Card className="flex-[1_1_420px]">
          <form onSubmit={save}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                {draft.id ? `تعديل: ${draft.title}` : "بانر جديد"}
              </CardTitle>
              <label className="flex items-center gap-2 text-sm">
                مفعّل
                <Switch
                  checked={draft.is_active ?? true}
                  onCheckedChange={(v) => set("is_active", v)}
                />
              </label>
            </CardHeader>
            <CardContent>
              <div
                aria-label="معاينة"
                className="flex flex-col gap-2 rounded-xl border-2 border-ink p-5"
                style={{ background: draft.bg_color }}
              >
                <div className="font-display text-3xl leading-tight text-accent [text-shadow:2px_2px_0_var(--ink)]">
                  {draft.title || "عنوان البانر"}
                </div>
                {draft.subtitle && (
                  <div className="text-sm" style={{ color: fg }}>
                    {draft.subtitle}
                  </div>
                )}
                {draft.cta_label && (
                  <span className="self-start rounded-lg border-2 border-ink bg-accent px-3 py-1.5 text-sm font-bold text-ink">
                    {draft.cta_label}
                  </span>
                )}
              </div>
              <Field label="المكان" htmlFor="b-place">
                <Select
                  id="b-place"
                  value={draft.placement ?? "home_hero"}
                  onChange={(e) =>
                    set("placement", e.target.value as BannerPlacement)
                  }
                >
                  {(Object.keys(PLACEMENT_LABEL) as BannerPlacement[]).map(
                    (p) => (
                      <option key={p} value={p}>
                        {PLACEMENT_LABEL[p]}
                      </option>
                    ),
                  )}
                </Select>
              </Field>
              <Field label="العنوان" htmlFor="b-title">
                <Input
                  id="b-title"
                  value={draft.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </Field>
              <Field label="الوصف (اختياري)" htmlFor="b-sub">
                <Input
                  id="b-sub"
                  value={draft.subtitle ?? ""}
                  onChange={(e) => set("subtitle", e.target.value)}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="نص الزرار" htmlFor="b-cta">
                  <Input
                    id="b-cta"
                    value={draft.cta_label ?? ""}
                    onChange={(e) => set("cta_label", e.target.value)}
                  />
                </Field>
                <Field label="الزرار يودّي على" htmlFor="b-target">
                  <Select
                    id="b-target"
                    value={draft.cta_target ?? "shop"}
                    onChange={(e) =>
                      set("cta_target", e.target.value as BannerTarget)
                    }
                  >
                    {(Object.keys(TARGET_LABEL) as BannerTarget[]).map((t) => (
                      <option key={t} value={t}>
                        {TARGET_LABEL[t]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              {draft.cta_target && VALUE_HINT[draft.cta_target] && (
                <Field label={VALUE_HINT[draft.cta_target]!} htmlFor="b-val">
                  <Input
                    id="b-val"
                    dir={draft.cta_target === "whatsapp" ? "rtl" : "ltr"}
                    value={draft.cta_value ?? ""}
                    onChange={(e) => set("cta_value", e.target.value)}
                  />
                </Field>
              )}
              <fieldset>
                <legend className="mb-2 text-sm font-medium">
                  لون الخلفية
                </legend>
                <div className="flex flex-wrap gap-2.5">
                  {BRAND_SWATCHES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      aria-label={s.label}
                      aria-pressed={draft.bg_color === s.value}
                      onClick={() => set("bg_color", s.value)}
                      className={cn(
                        "size-9 rounded-full border-2",
                        draft.bg_color === s.value
                          ? "border-ink ring-2 ring-ink ring-offset-2"
                          : "border-border",
                      )}
                      style={{ background: s.value }}
                    />
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-3 sm:grid-cols-2">
                <SingleImageUploader
                  label="صورة ديسكتوب (اختياري)"
                  value={draft.image_desktop_url ?? null}
                  onChange={(v) => set("image_desktop_url", v)}
                  folder="banners"
                />
                <SingleImageUploader
                  label="صورة موبايل (اختياري)"
                  value={draft.image_mobile_url ?? null}
                  onChange={(v) => set("image_mobile_url", v)}
                  folder="banners"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="يبدأ" htmlFor="b-start">
                  <Input
                    id="b-start"
                    type="date"
                    value={toDateInput(draft.starts_at)}
                    onChange={(e) =>
                      set("starts_at", fromDateInput(e.target.value))
                    }
                  />
                </Field>
                <Field label="ينتهي (اختياري)" htmlFor="b-end">
                  <Input
                    id="b-end"
                    type="date"
                    value={toDateInput(draft.ends_at)}
                    onChange={(e) =>
                      set("ends_at", fromDateInput(e.target.value))
                    }
                  />
                </Field>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "بيحفظ…" : "حفظ البانر"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </>
  );
}
