"use client"

import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/context/theme-context"
import { WeightsProvider } from "@/context/weights-context"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WeightsProvider>{children}</WeightsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
