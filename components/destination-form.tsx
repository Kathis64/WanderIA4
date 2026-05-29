"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"

interface DestinationData {
  id?: string
  name: string
  country: string
  description: string
  culture: string
  gastronomy: string
  climate_spring: string
  climate_summer: string
  climate_autumn: string
  climate_winter: string
  climate_best_season: string
  cost_min: number
  cost_max: number
  cost_currency: string
  budget_level: number
  image_query: string
  tips: string
  tags_climate: string
  tags_safety: string
  tags_language: string
  tags_seasons: string
  tags_nightlife: string
  tags_nature: string
  tags_culture: string
  tags_adventure: string
  tags_connectivity: string
  tags_transport: string
  is_active: number
}

interface DestinationFormProps {
  destination?: DestinationData | null
  onSubmit: (data: DestinationData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const defaultDestination: DestinationData = {
  name: "",
  country: "",
  description: "",
  culture: "",
  gastronomy: "",
  climate_spring: "",
  climate_summer: "",
  climate_autumn: "",
  climate_winter: "",
  climate_best_season: "",
  cost_min: 0,
  cost_max: 0,
  cost_currency: "USD",
  budget_level: 2,
  image_query: "",
  tips: "",
  tags_climate: "",
  tags_safety: "",
  tags_language: "",
  tags_seasons: "",
  tags_nightlife: "",
  tags_nature: "",
  tags_culture: "",
  tags_adventure: "",
  tags_connectivity: "",
  tags_transport: "",
  is_active: 1,
}

export function DestinationForm({
  destination,
  onSubmit,
  onCancel,
  isLoading = false,
}: DestinationFormProps) {
  const [formData, setFormData] = useState<DestinationData>(
    destination || defaultDestination
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (destination) {
      setFormData(destination)
    }
  }, [destination])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "El nombre es requerido"
    if (!formData.country.trim()) newErrors.country = "El país es requerido"
    if (!formData.description.trim()) newErrors.description = "La descripción es requerida"
    if (!formData.culture.trim()) newErrors.culture = "La cultura es requerida"
    if (!formData.gastronomy.trim()) newErrors.gastronomy = "La gastronomía es requerida"
    if (formData.cost_min < 0) newErrors.cost_min = "El costo mínimo no puede ser negativo"
    if (formData.cost_max < formData.cost_min) {
      newErrors.cost_max = "El costo máximo debe ser mayor al mínimo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    await onSubmit(formData)
  }

  const handleChange = (
    field: keyof DestinationData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-card p-6 shadow-xl">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-foreground">
          {destination ? "Editar Destino" : "Nuevo Destino"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Basic Info */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Información Básica
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nombre del Destino *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Ej: Barcelona"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <span className="text-xs text-red-500">{errors.name}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="country">País *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="Ej: España"
                  className={errors.country ? "border-red-500" : ""}
                />
                {errors.country && (
                  <span className="text-xs text-red-500">{errors.country}</span>
                )}
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Descripción del destino..."
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <span className="text-xs text-red-500">{errors.description}</span>
                )}
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="image_query">Búsqueda de Imagen (Unsplash)</Label>
                <Input
                  id="image_query"
                  value={formData.image_query}
                  onChange={(e) => handleChange("image_query", e.target.value)}
                  placeholder="ej: mountain landscape, beach sunset, city architecture..."
                />
                <span className="text-xs text-muted-foreground">
                  Escriba términos de búsqueda para encontrar imágenes en Unsplash
                </span>
              </div>
            </div>
          </div>

          {/* Culture & Gastronomy */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Cultura y Gastronomía
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="culture">Cultura *</Label>
                <Textarea
                  id="culture"
                  value={formData.culture}
                  onChange={(e) => handleChange("culture", e.target.value)}
                  placeholder="Descripción de la cultura..."
                  rows={2}
                  className={errors.culture ? "border-red-500" : ""}
                />
                {errors.culture && (
                  <span className="text-xs text-red-500">{errors.culture}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="gastronomy">Gastronomía *</Label>
                <Textarea
                  id="gastronomy"
                  value={formData.gastronomy}
                  onChange={(e) => handleChange("gastronomy", e.target.value)}
                  placeholder="Descripción de la gastronomía..."
                  rows={2}
                  className={errors.gastronomy ? "border-red-500" : ""}
                />
                {errors.gastronomy && (
                  <span className="text-xs text-red-500">{errors.gastronomy}</span>
                )}
              </div>
            </div>
          </div>

          {/* Climate */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Clima</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="climate_spring">Primavera</Label>
                <Input
                  id="climate_spring"
                  value={formData.climate_spring}
                  onChange={(e) => handleChange("climate_spring", e.target.value)}
                  placeholder="Ej: 15-22°C"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="climate_summer">Verano</Label>
                <Input
                  id="climate_summer"
                  value={formData.climate_summer}
                  onChange={(e) => handleChange("climate_summer", e.target.value)}
                  placeholder="Ej: 25-32°C"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="climate_autumn">Otoño</Label>
                <Input
                  id="climate_autumn"
                  value={formData.climate_autumn}
                  onChange={(e) => handleChange("climate_autumn", e.target.value)}
                  placeholder="Ej: 15-24°C"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="climate_winter">Invierno</Label>
                <Input
                  id="climate_winter"
                  value={formData.climate_winter}
                  onChange={(e) => handleChange("climate_winter", e.target.value)}
                  placeholder="Ej: 8-15°C"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="climate_best_season">Mejor Época para Visitar</Label>
                <Input
                  id="climate_best_season"
                  value={formData.climate_best_season}
                  onChange={(e) => handleChange("climate_best_season", e.target.value)}
                  placeholder="Ej: Primavera y otoño para clima ideal"
                />
              </div>
            </div>
          </div>

          {/* Costs */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Costos Estimados
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cost_min">Costo Mínimo</Label>
                <Input
                  id="cost_min"
                  type="number"
                  value={formData.cost_min}
                  onChange={(e) => handleChange("cost_min", parseInt(e.target.value) || 0)}
                  min={0}
                  className={errors.cost_min ? "border-red-500" : ""}
                />
                {errors.cost_min && (
                  <span className="text-xs text-red-500">{errors.cost_min}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cost_max">Costo Máximo</Label>
                <Input
                  id="cost_max"
                  type="number"
                  value={formData.cost_max}
                  onChange={(e) => handleChange("cost_max", parseInt(e.target.value) || 0)}
                  min={0}
                  className={errors.cost_max ? "border-red-500" : ""}
                />
                {errors.cost_max && (
                  <span className="text-xs text-red-500">{errors.cost_max}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cost_currency">Moneda</Label>
                <Select
                  value={formData.cost_currency}
                  onValueChange={(value) => handleChange("cost_currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="COP">COP</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="budget_level">Nivel de Presupuesto (1-5)</Label>
                <Select
                  value={formData.budget_level.toString()}
                  onValueChange={(value) => handleChange("budget_level", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Económico</SelectItem>
                    <SelectItem value="2">2 - Moderado</SelectItem>
                    <SelectItem value="3">3 - Cómodo</SelectItem>
                    <SelectItem value="4">4 - Alto</SelectItem>
                    <SelectItem value="5">5 - Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Etiquetas (separadas por coma)
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags_climate">Clima</Label>
                <Input
                  id="tags_climate"
                  value={formData.tags_climate}
                  onChange={(e) => handleChange("tags_climate", e.target.value)}
                  placeholder="templado, calido, frio, tropical"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags_safety">Seguridad</Label>
                <Input
                  id="tags_safety"
                  value={formData.tags_safety}
                  onChange={(e) => handleChange("tags_safety", e.target.value)}
                  placeholder="muy_seguro, seguro, moderado"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags_language">Idioma</Label>
                <Input
                  id="tags_language"
                  value={formData.tags_language}
                  onChange={(e) => handleChange("tags_language", e.target.value)}
                  placeholder="espanol, ingles, aprender"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags_seasons">Temporadas</Label>
                <Input
                  id="tags_seasons"
                  value={formData.tags_seasons}
                  onChange={(e) => handleChange("tags_seasons", e.target.value)}
                  placeholder="primavera, verano, otono, invierno"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags_nightlife">Vida Nocturna</Label>
                <Input
                  id="tags_nightlife"
                  value={formData.tags_nightlife}
                  onChange={(e) => handleChange("tags_nightlife", e.target.value)}
                  placeholder="fiestas, bares, cenas, tranquila"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags_nature">Naturaleza</Label>
                <Input
                  id="tags_nature"
                  value={formData.tags_nature}
                  onChange={(e) => handleChange("tags_nature", e.target.value)}
                  placeholder="playas, montanas, bosques, desiertos"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags_culture">Cultura</Label>
                <Input
                  id="tags_culture"
                  value={formData.tags_culture}
                  onChange={(e) => handleChange("tags_culture", e.target.value)}
                  placeholder="arquitectura, religion, tradiciones, arte"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags_adventure">Nivel de Aventura</Label>
                <Input
                  id="tags_adventure"
                  value={formData.tags_adventure}
                  onChange={(e) => handleChange("tags_adventure", e.target.value)}
                  placeholder="relajado, moderado, activo, extremo"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags_connectivity">Conectividad</Label>
                <Input
                  id="tags_connectivity"
                  value={formData.tags_connectivity}
                  onChange={(e) => handleChange("tags_connectivity", e.target.value)}
                  placeholder="esencial, importante, ocasional"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags_transport">Transporte</Label>
                <Input
                  id="tags_transport"
                  value={formData.tags_transport}
                  onChange={(e) => handleChange("tags_transport", e.target.value)}
                  placeholder="transporte, caminando, auto, tours"
                />
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Consejos de Viaje
            </h3>
            <Textarea
              id="tips"
              value={formData.tips}
              onChange={(e) => handleChange("tips", e.target.value)}
              placeholder="Cada línea es un consejo diferente..."
              rows={4}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Escribe cada consejo en una línea separada
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-4 rounded-lg border border-border p-4">
            <Switch
              id="is_active"
              checked={formData.is_active === 1}
              onCheckedChange={(checked) => handleChange("is_active", checked ? 1 : 0)}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Destino Activo (visible en recomendaciones)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Guardando..."
                : destination
                ? "Guardar Cambios"
                : "Crear Destino"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
