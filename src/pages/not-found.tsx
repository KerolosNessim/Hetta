import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-24 text-center">
      <span className="grid size-32 -rotate-6 place-items-center rounded-full border-8 border-white bg-accent font-display text-5xl shadow-sticker">٤٠٤</span>
      <h1 className="font-display text-4xl">الصفحة دي مش موجودة</h1>
      <Button asChild variant="sticker" size="lg">
        <Link to="/">ارجع للرئيسية</Link>
      </Button>
    </div>
  )
}
