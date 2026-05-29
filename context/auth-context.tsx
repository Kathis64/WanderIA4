"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string, birthDate: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Helpers de JWT en cliente (sin verificar firma — eso es rol del servidor)
// Solo decodifica el payload para leer exp/iat
function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    return JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJWTPayload(token)
  if (!payload || typeof payload.exp !== "number") return true
  // Consideramos expirado si quedan menos de 60 segundos
  return payload.exp < Math.floor(Date.now() / 1000) + 60
}

function msUntilExpiry(token: string): number {
  const payload = decodeJWTPayload(token)
  if (!payload || typeof payload.exp !== "number") return 0
  return Math.max(0, payload.exp * 1000 - Date.now())
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Limpia sesión en memoria y storage
  const clearSession = useCallback(() => {
    setToken(null)
    setUser(null)
    sessionStorage.removeItem("wanderia_token")
    sessionStorage.removeItem("wanderia_user")
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current)
      expiryTimerRef.current = null
    }
  }, [])

  // Programa un logout automático cuando el token expire
  const scheduleExpiry = useCallback((t: string) => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current)
    const ms = msUntilExpiry(t)
    if (ms <= 0) return
    expiryTimerRef.current = setTimeout(() => {
      clearSession()
      router.replace("/login?expired=1")
    }, ms)
  }, [clearSession, router])

  // Guarda sesión y programa expiración
  const saveSession = useCallback((newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    sessionStorage.setItem("wanderia_token", newToken)
    sessionStorage.setItem("wanderia_user", JSON.stringify(newUser))
    scheduleExpiry(newToken)
  }, [scheduleExpiry])

  // Al montar: leer sessionStorage y validar token
  useEffect(() => {
    const storedToken = sessionStorage.getItem("wanderia_token")
    const storedUser = sessionStorage.getItem("wanderia_user")

    if (storedToken && storedUser) {
      if (isTokenExpired(storedToken)) {
        // Token expirado — limpiar y no restaurar sesión
        sessionStorage.removeItem("wanderia_token")
        sessionStorage.removeItem("wanderia_user")
      } else {
        try {
          const parsedUser = JSON.parse(storedUser) as User
          setToken(storedToken)
          setUser(parsedUser)
          scheduleExpiry(storedToken)
        } catch {
          // JSON corrupto
          sessionStorage.removeItem("wanderia_token")
          sessionStorage.removeItem("wanderia_user")
        }
      }
    }
    setIsLoading(false)
  }, [scheduleExpiry])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || "Error al iniciar sesión" }
      }
      saveSession(data.token, data.user)
      return { success: true }
    } catch {
      return { success: false, error: "Error de conexión" }
    }
  }, [saveSession])

  const signup = useCallback(async (name: string, email: string, password: string, birthDate: string) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, birthDate }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || "Error al registrarse" }
      }
      saveSession(data.token, data.user)
      return { success: true }
    } catch {
      return { success: false, error: "Error de conexión" }
    }
  }, [saveSession])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
