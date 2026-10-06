import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/form-controls'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { signIn, session, isAdmin } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/admin/products'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session && isAdmin) return <Navigate to={from} replace />

  return (
    <div className="grid min-h-svh place-items-center bg-[#faf7f0] p-4">
      <form
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border bg-card p-6"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          const err = await signIn(email, password)
          setBusy(false)
          if (err) setError(err)
          else navigate(from, { replace: true })
        }}
      >
        <div className="font-display text-4xl text-primary">حتة</div>
        <h1 className="text-xl font-bold">دخول الداشبورد</h1>
        <Field label="الإيميل" htmlFor="email">
          <Input id="email" type="email" dir="ltr" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="الباسورد" htmlFor="password">
          <Input id="password" type="password" dir="ltr" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? 'بيدخل…' : 'دخول'}</Button>
      </form>
    </div>
  )
}
