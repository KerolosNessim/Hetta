import { createContext, useContext, type ReactNode } from 'react'
import { getSettings } from './api'
import { demoSettings } from './demo-data'
import type { Settings } from './types'
import { useAsync } from './use-async'

const Ctx = createContext<{ settings: Settings; reload: () => void }>({ settings: demoSettings, reload: () => {} })

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data, reload } = useAsync(getSettings, [])
  return <Ctx.Provider value={{ settings: data ?? demoSettings, reload }}>{children}</Ctx.Provider>
}

export const useSettings = () => useContext(Ctx)
