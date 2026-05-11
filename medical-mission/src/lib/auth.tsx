'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAdmin: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('admin_auth') : null
    if (stored === 'true') setIsAdmin(true)
  }, [])

  const login = (username: string, password: string) => {
    // Credentials checked client-side for this offline-capable system
    const validUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'pbbc-admin'
    const validPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'pbbccwop2026'
    if (username === validUser && password === validPass) {
      setIsAdmin(true)
      if (typeof window !== 'undefined') sessionStorage.setItem('admin_auth', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    if (typeof window !== 'undefined') sessionStorage.removeItem('admin_auth')
  }

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
