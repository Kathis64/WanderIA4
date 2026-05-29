"use client"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { DestinationCard } from "@/components/destination-card"
import { FavoriteCommentSection } from "@/components/favorite-comment-section"
import { RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ResultsData {
  success: boolean
  recommendations: Array<{
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
  }>
  profile_summary: {
    climate: string
    budget: string
    interests: string[]
    travel_style: string
  }
}

function ResultsContent() {
  const router = useRouter()
  const [results, setResults] = useState<ResultsData | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [token, setToken] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("wanderia_results")
    const storedToken = sessionStorage.getItem("wanderia_token")
    const storedSessionId = sessionStorage.getItem("wanderia_session_id")
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setResults(parsed)
        setToken(storedToken)
        // Usar session_id de los resultados si existe, o el almacenado
        const sid = parsed.session_id || storedSessionId
        setSessionId(sid)
      } catch {
        router.replace("/test")
      }
    } else {
      router.replace("/test")
    }
  }, [router])

  if (!results || !results.recommendations?.length) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Cargando resultados...</p>
          </div>
        </main>
      </div>
    )
  }

  const labelMap: Record<string, string> = {
    frio: "Frío", templado: "Templado", calido: "Cálido", tropical: "Tropical",
    bajo: "Económico", medio: "Moderado", alto: "Cómodo", premium: "Premium",
    cultura: "Cultura", naturaleza: "Naturaleza", aventura: "Aventura",
    gastronomia: "Gastronomía", relax: "Relax", historia: "Historia",
    mochilero: "Mochilero", comfort: "Confort", lujo: "Lujo", cultural: "Cultural",
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Tus destinos recomendados
          </h1>
          <p className="mt-2 text-muted-foreground">
            Basado en tus preferencias, nuestra IA ha encontrado los mejores destinos para ti.
          </p>
        </div>

        {/* Profile summary */}
        <div className="mb-8 flex flex-wrap gap-2">
          {results.profile_summary.climate && (
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              Clima: {labelMap[results.profile_summary.climate] || results.profile_summary.climate}
            </span>
          )}
          {results.profile_summary.budget && (
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              Presupuesto: {labelMap[results.profile_summary.budget] || results.profile_summary.budget}
            </span>
          )}
          {results.profile_summary.travel_style && (
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              Estilo: {labelMap[results.profile_summary.travel_style] || results.profile_summary.travel_style}
            </span>
          )}
          {results.profile_summary.interests?.map((interest) => (
            <span
              key={interest}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
            >
              {labelMap[interest] || interest}
            </span>
          ))}
        </div>

        {/* Destination tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {results.recommendations.map((rec, index) => (
            <button
              key={rec.name}
              onClick={() => setActiveTab(index)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
                activeTab === index
                  ? "bg-foreground text-background shadow-sm"
                  : "border border-border bg-card text-foreground hover:bg-secondary hover:border-foreground/20 hover:shadow-sm"
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-xs">
                {index + 1}
              </span>
              {rec.name}, {rec.country}
            </button>
          ))}
        </div>

        {/* Active destination */}
        <DestinationCard
          recommendation={results.recommendations[activeTab]}
          isMain
        />

        {/* Favorite and Comment Section */}
        {sessionId && (
          <FavoriteCommentSection
            destinationName={results.recommendations[activeTab].name}
            destinationCountry={results.recommendations[activeTab].country}
            sessionId={sessionId}
            recommendationId={`${activeTab}-${results.recommendations[activeTab].name}`}
            token={token}
          />
        )}

        {/* Other recommendations */}
        {results.recommendations.length > 1 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-foreground">Otras opciones para ti</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {results.recommendations
                .filter((_, i) => i !== activeTab)
                .map((rec) => (
                  <DestinationCard key={rec.name} recommendation={rec} />
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/test"
            className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Repetir Test
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </main>

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

export default function ResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  )
}
