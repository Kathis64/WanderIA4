"use client"

import { useAuth } from "@/context/auth-context"
import Link from "next/link"

export function HeroSection() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="flex flex-col items-center gap-8 px-4 py-16 text-center md:py-24">
      <h1 className="max-w-xl text-pretty text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
        Su próximo destino, definido por datos
      </h1>
      <Link
        href={isAuthenticated ? "/test" : "/signup"}
        className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background shadow-sm transition-opacity hover:opacity-90"
      >
        Iniciar Test de Perfilado
      </Link>
    </section>
  )
}
