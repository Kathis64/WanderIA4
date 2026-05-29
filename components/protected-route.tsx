"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, type ReactNode, Suspense } from "react"
import { Loader2 } from "lucide-react"

function ProtectedRouteInner({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const expired = searchParams.get("expired") === "1"

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login" + (expired ? "?expired=1" : ""))
    }
  }, [isAuthenticated, isLoading, router, expired])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProtectedRouteInner>{children}</ProtectedRouteInner>
    </Suspense>
  )
}
