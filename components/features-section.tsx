"use client"

import { DollarSign, CloudSun, Compass } from "lucide-react"

const features = [
  {
    icon: DollarSign,
    title: "Presupuesto",
    description:
      "WanderIA analiza una amplia gama de factores para proporcionarte recomendaciones personalizadas.",
  },
  {
    icon: CloudSun,
    title: "Clima",
    description:
      "WanderIA analiza el clima y la temporada para determinar las recomendaciones personalizadas.",
  },
  {
    icon: Compass,
    title: "Intereses",
    description:
      "WanderIA analiza tus intereses para proyectar y ofrecer recomendaciones personalizadas en WanderIA.",
  },
]

export function FeaturesSection() {
  return (
    <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-4 sm:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <feature.icon className="h-5 w-5 text-foreground" />
          </div>
          <h3 className="text-base font-semibold text-card-foreground">{feature.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {feature.description}
          </p>
        </div>
      ))}
    </section>
  )
}
