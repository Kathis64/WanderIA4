"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface WeightConfig {
  climate: number
  budget: number
  interests: number
  travelStyle: number
  continent: number
  activities: number
  food: number
  accommodation: number
  companion: number
  safety: number
  language: number
  season: number
  nightlife: number
  nature: number
  culture: number
  adventureLevel: number
  connectivity: number
  photography: number
  crowdPreference: number
  shopping: number
  sustainability: number
  waterActivities: number
}

export const DEFAULT_WEIGHTS: WeightConfig = {
  climate: 5,
  budget: 5,
  interests: 5,
  travelStyle: 5,
  continent: 5,
  activities: 5,
  food: 5,
  accommodation: 5,
  companion: 5,
  safety: 5,
  language: 5,
  season: 5,
  nightlife: 5,
  nature: 5,
  culture: 5,
  adventureLevel: 5,
  connectivity: 5,
  photography: 5,
  crowdPreference: 5,
  shopping: 5,
  sustainability: 5,
  waterActivities: 5,
}

export const WEIGHT_LABELS: Record<keyof WeightConfig, { label: string; icon: string }> = {
  climate: { label: "Clima", icon: "Thermometer" },
  budget: { label: "Presupuesto", icon: "Wallet" },
  interests: { label: "Intereses", icon: "Compass" },
  travelStyle: { label: "Estilo de viaje", icon: "Backpack" },
  continent: { label: "Región", icon: "Globe" },
  activities: { label: "Actividades", icon: "Footprints" },
  food: { label: "Gastronomía", icon: "UtensilsCrossed" },
  accommodation: { label: "Alojamiento", icon: "Hotel" },
  companion: { label: "Compañía", icon: "Users" },
  safety: { label: "Seguridad", icon: "Shield" },
  language: { label: "Idioma", icon: "MessageCircle" },
  season: { label: "Temporada", icon: "Calendar" },
  nightlife: { label: "Vida nocturna", icon: "Moon" },
  nature: { label: "Naturaleza", icon: "TreePine" },
  culture: { label: "Cultura", icon: "Landmark" },
  adventureLevel: { label: "Aventura", icon: "Mountain" },
  connectivity: { label: "Conectividad", icon: "Wifi" },
  photography: { label: "Fotografía", icon: "Camera" },
  crowdPreference: { label: "Multitudes", icon: "Users" },
  shopping: { label: "Compras", icon: "ShoppingBag" },
  sustainability: { label: "Sostenibilidad", icon: "Leaf" },
  waterActivities: { label: "Acuáticas", icon: "Waves" },
}

interface WeightsContextType {
  weights: WeightConfig
  setWeight: (key: keyof WeightConfig, value: number) => void
  resetWeights: () => void
  isConfigOpen: boolean
  openConfig: () => void
  closeConfig: () => void
  toggleConfig: () => void
}

const WeightsContext = createContext<WeightsContextType | undefined>(undefined)

export function WeightsProvider({ children }: { children: ReactNode }) {
  const [weights, setWeights] = useState<WeightConfig>(DEFAULT_WEIGHTS)
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  const setWeight = useCallback((key: keyof WeightConfig, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: Math.min(10, Math.max(1, value)),
    }))
  }, [])

  const resetWeights = useCallback(() => {
    setWeights(DEFAULT_WEIGHTS)
  }, [])

  const openConfig = useCallback(() => setIsConfigOpen(true), [])
  const closeConfig = useCallback(() => setIsConfigOpen(false), [])
  const toggleConfig = useCallback(() => setIsConfigOpen((prev) => !prev), [])

  return (
    <WeightsContext.Provider
      value={{
        weights,
        setWeight,
        resetWeights,
        isConfigOpen,
        openConfig,
        closeConfig,
        toggleConfig,
      }}
    >
      {children}
    </WeightsContext.Provider>
  )
}

export function useWeights() {
  const context = useContext(WeightsContext)
  if (context === undefined) {
    throw new Error("useWeights must be used within a WeightsProvider")
  }
  return context
}
