import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

type AuthState = {
  session: Session | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

async function checkAdmin(userId: string | undefined) {
  if (!supabase || !userId) return false
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle()
  return !!data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) return
    const apply = async (s: Session | null) => {
      setSession(s)
      setIsAdmin(await checkAdmin(s?.user.id))
      setLoading(false)
    }
    supabase.auth.getSession().then(({ data }) => apply(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      void apply(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value: AuthState = {
    session,
    isAdmin,
    loading,
    signIn: async (email, password) => {
      if (!supabase) return 'Supabase مش متوصل.'
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error ? 'الإيميل أو الباسورد غلط.' : null
    },
    signOut: async () => {
      await supabase?.auth.signOut()
    },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
