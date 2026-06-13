import { createContext, useContext, useEffect, useState } from 'react'

const AUTH_STORAGE_KEY = 'neulex_admin_auth_v1'
const PASSWORD_STORAGE_KEY = 'neulex_admin_password_v1'

type AuthContextType = {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
  hasPasswordSet: boolean
  setNewPassword: (newPassword: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return String(hash)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const hasPasswordSet = !!localStorage.getItem(PASSWORD_STORAGE_KEY)

  function login(password: string): boolean {
    const storedHash = localStorage.getItem(PASSWORD_STORAGE_KEY)
    if (!storedHash) {
      const hash = hashPassword(password)
      localStorage.setItem(PASSWORD_STORAGE_KEY, hash)
      localStorage.setItem(AUTH_STORAGE_KEY, 'true')
      setIsAuthenticated(true)
      return true
    } else {
      const hash = hashPassword(password)
      if (hash === storedHash) {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true')
        setIsAuthenticated(true)
        return true
      }
      return false
    }
  }

  function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setIsAuthenticated(false)
  }

  function setNewPassword(newPassword: string) {
    const hash = hashPassword(newPassword)
    localStorage.setItem(PASSWORD_STORAGE_KEY, hash)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, hasPasswordSet, setNewPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
