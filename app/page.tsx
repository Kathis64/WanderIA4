"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { MapPin, Shield, Sparkles } from "lucide-react"

const stats = [
  { icon: MapPin, label: "Destinos analizados", value: "50+" },
  { icon: Sparkles, label: "Recomendaciones con IA", value: "100%" },
  { icon: Shield, label: "Datos protegidos", value: "JWT" },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 flex-col gap-16 pb-16">
        <HeroSection />
        <FeaturesSection />

        {/* Stats section */}
        <section className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-8 px-4 md:justify-between">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <stat.icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-4xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Completa el test",
                description: "Responde preguntas sobre tus gustos, presupuesto, clima preferido y estilo de viaje.",
              },
              {
                step: "02",
                title: "IA analiza tu perfil",
                description: "Nuestro motor de IA procesa tus respuestas y busca el destino ideal para ti.",
              },
              {
                step: "03",
                title: "Descubre tu destino",
                description: "Recibe recomendaciones personalizadas con toda la información para planificar tu viaje.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <span className="text-3xl font-bold text-muted-foreground/40">{item.step}</span>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            WanderIA - Recomendador inteligente de destinos de viaje
          </p>
        </div>
      </footer>
    </div>
  )
}
