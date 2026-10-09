import { useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutGridIcon, LogOutIcon, MenuIcon, MessageSquareQuoteIcon, SettingsIcon, StoreIcon, TagIcon } from 'lucide-react'
import { Toaster } from 'sonner'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useAuth } from '@/lib/auth'
import { isDemoMode } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin/products', label: 'المنتجات', icon: TagIcon },
  { to: '/admin/categories', label: 'الأقسام', icon: LayoutGridIcon },
  { to: '/admin/reviews', label: 'آراء العملاء', icon: MessageSquareQuoteIcon },
  { to: '/admin/settings', label: 'الإعدادات', icon: SettingsIcon },
]

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut, session } = useAuth()
  return (
    <div className="flex h-full flex-col gap-1">
      <div className="px-3 pb-5 font-display text-3xl text-primary">
        حتة <span className="font-sans text-xs text-muted-foreground">داشبورد</span>
      </div>
      <nav aria-label="قائمة الداشبورد" className="flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn('flex h-11 items-center gap-3 rounded-lg px-3 text-[#3e382f] hover:bg-secondary', isActive && 'bg-teal-subtle font-semibold text-teal-strong')
            }
          >
            <Icon className="size-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2 pt-6">
        <Button asChild variant="outline">
          <Link to="/" target="_blank">
            <StoreIcon /> عرض المتجر
          </Link>
        </Button>
        {session && (
          <Button variant="ghost" onClick={signOut} className="justify-start text-muted-foreground">
            <LogOutIcon /> خروج
          </Button>
        )}
      </div>
    </div>
  )
}

export function AdminLayout() {
  const { session, isAdmin, loading } = useAuth()
  const location = useLocation()
  const [menu, setMenu] = useState(false)

  if (isDemoMode) return <SetupNotice />
  if (loading) return <div className="grid min-h-svh place-items-center text-muted-foreground">بيحمّل…</div>
  if (!session) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  if (!isAdmin) return <NotAdmin email={session.user.email} />

  return (
    <div className="flex min-h-svh bg-[#faf7f0]">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-e bg-card p-4 lg:block">
        <SideNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
          <Button variant="outline" size="icon" aria-label="القائمة" onClick={() => setMenu(true)}>
            <MenuIcon />
          </Button>
          <span className="font-display text-2xl text-primary">حتة</span>
          <span className="w-11" />
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="right" className="max-w-72 border-ink p-4" aria-describedby={undefined}>
          <SheetTitle className="sr-only">قائمة الداشبورد</SheetTitle>
          <SideNav onNavigate={() => setMenu(false)} />
        </SheetContent>
      </Sheet>
      <Toaster dir="rtl" position="bottom-left" richColors />
    </div>
  )
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function SetupNotice() {
  return (
    <div className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-4 p-6 leading-8">
      <h1 className="text-2xl font-bold">الداشبورد محتاج Supabase</h1>
      <ol className="list-decimal ps-5">
        <li>اعمل مشروع على supabase.com وشغّل ملف <code dir="ltr">supabase/migrations/0001_init.sql</code> في SQL Editor.</li>
        <li>انسخ <code dir="ltr">.env.example</code> لـ <code dir="ltr">.env</code> وحط فيه الـ URL والـ anon key.</li>
        <li>اعمل يوزر من Authentication وضيفه لجدول admins (الطريقة في <code dir="ltr">supabase/seed.sql</code>).</li>
        <li>شغّل <code dir="ltr">npm run dev</code> تاني.</li>
      </ol>
      <Button asChild variant="outline" className="self-start">
        <Link to="/">ارجع للمتجر</Link>
      </Button>
    </div>
  )
}

function NotAdmin({ email }: { email?: string }) {
  const { signOut } = useAuth()
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">الحساب ده مش أدمن</h1>
      <p className="text-muted-foreground">
        <span dir="ltr">{email}</span> مسجّل دخول، بس مش متضاف لجدول admins في Supabase.
      </p>
      <Button variant="outline" onClick={signOut}>خروج</Button>
    </div>
  )
}
