"use client"

import { useWeights, WEIGHT_LABELS, type WeightConfig } from "@/context/weights-context"
import { cn } from "@/lib/utils"
import {
  X,
  RotateCcw,
  Thermometer,
  Wallet,
  Compass,
  Backpack,
  Globe,
  Footprints,
  UtensilsCrossed,
  Hotel,
  Users,
  Shield,
  MessageCircle,
  Calendar,
  Moon,
  TreePine,
  Landmark,
  Mountain,
  Wifi,
  Camera,
  ShoppingBag,
  Leaf,
  Waves,
  type LucideIcon,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"

const iconMap: Record<string, LucideIcon> = {
  Thermometer,
  Wallet,
  Compass,
  Backpack,
  Globe,
  Footprints,
  UtensilsCrossed,
  Hotel,
  Users,
  Shield,
  MessageCircle,
  Calendar,
  Moon,
  TreePine,
  Landmark,
  Mountain,
  Wifi,
  Camera,
  ShoppingBag,
  Leaf,
  Waves,
}

interface WeightSliderProps {
  weightKey: keyof WeightConfig
  value: number
  onChange: (value: number) => void
}

function WeightSlider({ weightKey, value, onChange }: WeightSliderProps) {
  const config = WEIGHT_LABELS[weightKey]
  const Icon = iconMap[config.icon] || Compass

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex w-28 items-center gap-2 shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-foreground truncate">{config.label}</span>
      </div>
      <div className="flex-1">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
      </div>
      <div className="w-10 text-right">
        <span className="text-sm font-medium text-foreground">{value}/10</span>
      </div>
    </div>
  )
}

export function WeightsConfigPanel() {
  const { weights, setWeight, resetWeights, isConfigOpen, closeConfig } = useWeights()

  if (!isConfigOpen) return null

  const weightKeys = Object.keys(weights) as (keyof WeightConfig)[]

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        onClick={closeConfig}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-border bg-background shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <h2 className="text-lg font-semibold text-foreground">Configurar Pesos</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={resetWeights}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="Restaurar valores predeterminados"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={closeConfig}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="mb-6 text-sm text-muted-foreground">
            Ajusta la importancia de cada factor en las recomendaciones. 
            Un valor más alto significa que ese factor tendrá más peso en el algoritmo de IA.
          </p>

          <div className="space-y-1">
            {weightKeys.map((key) => (
              <WeightSlider
                key={key}
                weightKey={key}
                value={weights[key]}
                onChange={(value) => setWeight(key, value)}
              />
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-foreground">Acerca de los pesos</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>- Valor 1-3: Baja importancia</li>
              <li>- Valor 4-6: Importancia media</li>
              <li>- Valor 7-10: Alta importancia</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export function WeightsConfigButton() {
  const { toggleConfig, isConfigOpen } = useWeights()

  return (
    <button
      onClick={toggleConfig}
      className={cn(
        "rounded-lg p-2 transition-colors",
        isConfigOpen
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
      title="Configurar pesos de recomendación"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  )
}
