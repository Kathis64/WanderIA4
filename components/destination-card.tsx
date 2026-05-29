"use client"

import { useState, useEffect } from "react"
import { DollarSign, Sun, Plane, Lightbulb, ExternalLink, Calendar, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Recommendation {
  rank: number
  match_percentage: number
  name: string
  country: string
  description: string
  culture: string
  gastronomy: string
  climate: {
    spring: string
    summer: string
    autumn: string
    winter: string
    best_season: string
  }
  estimated_cost: {
    min: number
    max: number
    currency: string
    budget_level: number
  }
  flights: {
    from: string
    min_price: number
    currency: string
    airlines: string[]
  }
  tips: string[]
  image_query: string
}

interface FlightInfo {
  origin: string
  originCode: string
  originCity: string
  destination: string
  destinationCode: string
  departureDate: string
  returnDate: string
  estimatedPrice: {
    min: number
    max: number
    currency: string
  }
  airlines: string[]
  bookingUrl: string
  provider: string
}

interface DestinationCardProps {
  recommendation: Recommendation
  isMain?: boolean
}

// Map destination names to Unsplash image IDs for real photos
const destinationImages: Record<string, string> = {
  "Kioto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=500&fit=crop",
  "Barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=500&fit=crop",
  "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=500&fit=crop",
  "Estambul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=500&fit=crop",
  "Cusco": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&h=500&fit=crop",
  "Reikiavik": "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200&h=500&fit=crop",
  "Cartagena": "https://images.unsplash.com/photo-1583997052103-b4a1cb974ce5?w=1200&h=500&fit=crop",
  "Praga": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&h=500&fit=crop",
  "Marrakech": "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200&h=500&fit=crop",
  "Queenstown": "https://images.unsplash.com/photo-1589871973318-9ca1258faa5d?w=1200&h=500&fit=crop",
  "Ciudad del Cabo": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&h=500&fit=crop",
  "Hanói": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=500&fit=crop",
  "Lisboa": "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&h=500&fit=crop",
  "Dubái": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=500&fit=crop",
  "Buenos Aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200&h=500&fit=crop",
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function DestinationCard({ recommendation, isMain = false }: DestinationCardProps) {
  const [flightInfo, setFlightInfo] = useState<FlightInfo | null>(null)
  const [loadingFlight, setLoadingFlight] = useState(false)
  const [flightError, setFlightError] = useState<string | null>(null)

  const imageUrl = destinationImages[recommendation.name] ||
    `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=500&fit=crop`

  const budgetDots = Array.from({ length: 5 }, (_, i) => i < recommendation.estimated_cost.budget_level)

  // Fetch flight information when component mounts (only for main card)
  useEffect(() => {
    if (!isMain) return

    const fetchFlightInfo = async () => {
      setLoadingFlight(true)
      setFlightError(null)

      try {
        const response = await fetch(`/api/flights?destination=${encodeURIComponent(recommendation.name)}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al obtener información de vuelos")
        }

        setFlightInfo(data.flight)
      } catch (err) {
        console.error("Error fetching flight info:", err)
        setFlightError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoadingFlight(false)
      }
    }

    fetchFlightInfo()
  }, [recommendation.name, isMain])

  return (
    <div className={cn("flex flex-col gap-4", isMain && "mb-8")}>
      {/* Hero image */}
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={imageUrl}
          alt={`${recommendation.name}, ${recommendation.country}`}
          className="h-48 w-full object-cover sm:h-64 md:h-72"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-[#ffffff] md:text-3xl">
            {recommendation.name}, {recommendation.country}
          </h2>
          {isMain && (
            <span className="w-fit rounded-full bg-[#ffffff]/20 px-3 py-1 text-xs font-medium text-[#ffffff] backdrop-blur-sm">
              {recommendation.match_percentage}% compatibilidad
            </span>
          )}
        </div>
      </div>

      {/* Info cards following mockup layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Culture & Gastronomy */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-card-foreground">Cultura y Gastronomía</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{recommendation.culture}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-medium text-card-foreground">Gastronomía:</span>{" "}
            {recommendation.gastronomy}
          </p>
        </div>

        {/* Estimated costs */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-card-foreground">Costos Estimados</h3>
          <div className="flex gap-1">
            {budgetDots.map((filled, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  filled ? "bg-foreground" : "bg-secondary"
                )}
              >
                <DollarSign className={cn("h-4 w-4", filled ? "text-background" : "text-muted-foreground")} />
              </div>
            ))}
          </div>
          <p className="text-sm font-medium text-card-foreground">
            Precio: ${recommendation.estimated_cost.min} - ${recommendation.estimated_cost.max} {recommendation.estimated_cost.currency}
          </p>
        </div>

        {/* Climate & Flights */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-card-foreground">Clima y Vuelos</h3>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sun className="h-4 w-4 shrink-0" />
              <span>Primavera: {recommendation.climate.spring}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sun className="h-4 w-4 shrink-0" />
              <span>Mejor época: {recommendation.climate.best_season}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-card-foreground">
              <Plane className="h-4 w-4 shrink-0" />
              <span>Vuelos desde ${recommendation.flights.min_price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Flight Information */}
      {isMain && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-card-foreground">
            <Plane className="h-5 w-5" />
            Información de Vuelos en Tiempo Real
          </h3>

          {loadingFlight ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Buscando vuelos...</span>
            </div>
          ) : flightError ? (
            <div className="rounded-lg bg-secondary p-4 text-center">
              <p className="text-sm text-muted-foreground">{flightError}</p>
            </div>
          ) : flightInfo ? (
            <div className="flex flex-col gap-4">
              {/* Flight Route */}
              <div className="flex flex-col gap-3 rounded-lg bg-secondary/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Desde: {flightInfo.origin}
                    </span>
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {flightInfo.originCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Hacia: {flightInfo.destination}
                    </span>
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {flightInfo.destinationCode}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <span className="text-xs text-muted-foreground">Precio estimado</span>
                  <span className="text-lg font-bold text-foreground">
                    ${flightInfo.estimatedPrice.min} - ${flightInfo.estimatedPrice.max} {flightInfo.estimatedPrice.currency}
                  </span>
                </div>
              </div>

              {/* Dates and Airlines */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Salida:</span>
                    <span className="font-medium text-foreground">{formatDate(flightInfo.departureDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Regreso:</span>
                    <span className="font-medium text-foreground">{formatDate(flightInfo.returnDate)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Aerolíneas disponibles:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {flightInfo.airlines.map((airline) => (
                      <span
                        key={airline}
                        className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {airline}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking Button */}
              <a
                href={flightInfo.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                <Plane className="h-4 w-4" />
                Reservar en {flightInfo.provider}
                <ExternalLink className="h-4 w-4" />
              </a>

              <p className="text-center text-xs text-muted-foreground">
                Los precios son estimados y pueden variar. Serás redirigido a {flightInfo.provider} para completar tu reserva.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Tips */}
      {isMain && recommendation.tips.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-card-foreground">
            <Lightbulb className="h-4 w-4" />
            Consejos para tu viaje
          </h3>
          <ul className="flex flex-col gap-2">
            {recommendation.tips.map((tip, i) => (
              <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                <span className="mr-2 text-foreground">-</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Airlines - Original (shown when not loading real flights) */}
      {isMain && !flightInfo && !loadingFlight && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-card-foreground">
            <Plane className="h-4 w-4" />
            Aerolíneas disponibles desde {recommendation.flights.from}
          </h3>
          <div className="flex flex-wrap gap-2">
            {recommendation.flights.airlines.map((airline) => (
              <span
                key={airline}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
              >
                {airline}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
