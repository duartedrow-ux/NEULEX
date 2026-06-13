import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from './lib/supabase'

type Settings = {
  whatsapp_number: string
}

const SETTINGS_KEYS: (keyof Settings)[] = ['whatsapp_number']

const SettingsContext = createContext<{
  settings: Settings | null
  isLoading: boolean
  updateSetting: (key: keyof Settings, value: string) => Promise<void>
} | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    settings: Settings | null
    isLoading: boolean
  }>({
    settings: null,
    isLoading: true
  })

  const fetchSettings = useCallback(async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('settings').select('*')
        if (error) {
          console.error('Error fetching settings:', error)
        } else {
          const settingsMap = data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {})
          const defaultSettings: Settings = {
            whatsapp_number: ''
          }
          setState({
            settings: { ...defaultSettings, ...settingsMap },
            isLoading: false
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    } else {
      // Fallback a localStorage si no hay Supabase
      const storedSettings = localStorage.getItem('neulex_settings')
      if (storedSettings) {
        setState({
          settings: JSON.parse(storedSettings),
          isLoading: false
        })
      } else {
        setState({
          settings: { whatsapp_number: '' },
          isLoading: false
        })
      }
    }
  }, [])

  const updateSetting = useCallback(async (key: keyof Settings, value: string) => {
    if (supabase) {
      const { error } = await supabase.from('settings').upsert({ key, value })
      if (error) {
        console.error('Error updating setting:', error)
        return
      }
    } else {
      // Fallback a localStorage
      const currentSettings = state.settings || { whatsapp_number: '' }
      const newSettings = { ...currentSettings, [key]: value }
      localStorage.setItem('neulex_settings', JSON.stringify(newSettings))
    }
    
    setState(s => ({
      ...s,
      settings: { ...(s.settings || { whatsapp_number: '' }), [key]: value }
    }))
  }, [state.settings])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Add real-time subscription for settings
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, async () => {
        fetchSettings()
      })
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchSettings])

  return (
    <SettingsContext.Provider value={{
      settings: state.settings,
      isLoading: state.isLoading,
      updateSetting
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
