import { useRef, useState } from 'react'
import { ArrowRightIcon, ImagePlusIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { uploadImage } from '@/lib/api'
import { cn } from '@/lib/utils'

const MAX_MB = 2

/** Multiple images, first one is the main photo. Arrow moves an image one step toward the front. */
export function ImageListUploader({ value, onChange, folder }: { value: string[]; onChange: (v: string[]) => void; folder: 'products' | 'categories' }) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handle(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    const urls: string[] = []
    for (const f of Array.from(files)) {
      if (f.size > MAX_MB * 1024 * 1024) {
        toast.error(`${f.name} أكبر من ${MAX_MB} ميجا`)
        continue
      }
      try {
        urls.push(await uploadImage(f, folder))
      } catch (e) {
        toast.error(`فشل رفع ${f.name}: ${e instanceof Error ? e.message : ''}`)
      }
    }
    onChange([...value, ...urls])
    setBusy(false)
    if (input.current) input.current.value = ''
  }

  const moveUp = (i: number) => {
    const next = [...value]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    onChange(next)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {value.map((src, i) => (
        <div key={src} className="group relative size-28 overflow-hidden rounded-xl border bg-secondary">
          <img src={src} alt={`صورة ${i + 1}`} className="size-full object-cover" />
          {i === 0 && <span className="absolute right-1.5 bottom-1.5 rounded-md bg-ink px-1.5 py-0.5 text-[11px] text-white">الرئيسية</span>}
          <div className="absolute top-1 left-1 flex gap-1">
            {i > 0 && (
              <button type="button" onClick={() => moveUp(i)} aria-label="قدّم الصورة" className="grid size-7 place-items-center rounded-md bg-card/90 shadow">
                <ArrowRightIcon className="size-4" />
              </button>
            )}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="امسح الصورة" className="grid size-7 place-items-center rounded-md bg-card/90 text-destructive shadow">
              <XIcon className="size-4" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className={cn('flex size-28 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-input text-sm text-muted-foreground hover:bg-secondary', busy && 'animate-pulse')}
      >
        <ImagePlusIcon className="size-6" />
        {busy ? 'بيرفع…' : 'رفع صور'}
      </button>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => handle(e.target.files)} />
    </div>
  )
}

export function SingleImageUploader({ value, onChange, folder, label }: { value: string | null; onChange: (v: string | null) => void; folder: 'products' | 'categories'; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <ImageListUploader value={value ? [value] : []} onChange={(v) => onChange(v[v.length - 1] ?? null)} folder={folder} />
    </div>
  )
}
