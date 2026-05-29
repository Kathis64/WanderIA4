"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, Trash2, ArrowLeft, Loader2, AlertCircle, MessageSquare, KeyRound } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/context/auth-context"
import { ChangePasswordModal } from "@/components/change-password-modal"

interface Favorite {
  id: string
  user_id: string
  destination_name: string
  destination_country: string
  rating: number
  marked_at: string
}

interface FeedbackItem {
  id: string
  destination_name: string
  destination_country: string
  feedback_text: string
  sentiment: "positive" | "neutral" | "negative"
  helpful_score: number
  created_at: string
}

function ProfileContent() {
  const router = useRouter()
  const { token } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState("")
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([])
  const [loadingFeedback, setLoadingFeedback] = useState(true)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  useEffect(() => {
    if (token) {
      fetchFavorites()
      fetchFeedback()
    }
  }, [token])

  const fetchFavorites = async () => {
    try {
      setLoading(true)

      if (!token) {
        setError("No autenticado. Por favor inicia sesión.")
        return
      }

      const response = await fetch("/api/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("No se pudieron cargar los favoritos")
      }

      const data = await response.json()
      setFavorites(data.favorites || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const fetchFeedback = async () => {
    try {
      setLoadingFeedback(true)
      const storedToken = sessionStorage.getItem("wanderia_token")
      if (!storedToken) return

      const response = await fetch("/api/feedback", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      if (!response.ok) return
      const data = await response.json()
      setFeedbackList(data.feedback || [])
    } catch (err) {
      console.error("Error fetching feedback:", err)
    } finally {
      setLoadingFeedback(false)
    }
  }

  const sentimentConfig = {
    positive: { label: "Me interesa", emoji: "👍", className: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800/40" },
    neutral:  { label: "Neutral",     emoji: "😐", className: "text-muted-foreground bg-secondary border-border" },
    negative: { label: "No me interesa", emoji: "👎", className: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/40" },
  }

  const handleDeleteFavorite = async (destination: string) => {
    try {
      setDeletingId(destination)

      if (!token) {
        setError("No autenticado")
        return
      }

      const response = await fetch(
        `/api/favorites?destination_name=${encodeURIComponent(destination)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("No se pudo eliminar el favorito")
      }

      setFavorites((prev) =>
        prev.filter((fav) => fav.destination_name !== destination)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setDeletingId("")
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ))
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Mi Perfil
            </h1>
            <p className="mt-1 text-muted-foreground">
              Mis destinos favoritos y preferencias
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-900 dark:bg-red-950 dark:text-red-100">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Favorites section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            <h2 className="text-2xl font-bold text-foreground">
              Destinos Favoritos
            </h2>
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              {favorites.length}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted p-8 text-center">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">
                Aún no tienes destinos favoritos.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Completa el test de recomendación y marca los destinos que te interesen como favoritos.
              </p>
              <button
                onClick={() => router.push("/test")}
                className="mt-6 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90"
              >
                Ir al Test
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-4 transition-colors hover:bg-muted/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {favorite.destination_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {favorite.destination_country}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {renderStars(favorite.rating)}
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteFavorite(favorite.destination_name)
                        }
                        disabled={deletingId === favorite.destination_name}
                        className="ml-2 rounded-lg p-2 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === favorite.destination_name ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Agregado el {formatDate(favorite.marked_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Sección de comentarios */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-foreground" />
            <h2 className="text-2xl font-bold text-foreground">Mis Comentarios</h2>
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              {feedbackList.length}
            </span>
          </div>

          {loadingFeedback ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted p-8 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">Aún no has dejado comentarios.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Después de recibir recomendaciones, puedes comentar sobre los destinos sugeridos.
              </p>
              <button
                onClick={() => router.push("/test")}
                className="mt-6 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90"
              >
                Ir al Test
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {feedbackList.map((fb) => {
                const cfg = sentimentConfig[fb.sentiment]
                return (
                  <div
                    key={fb.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{fb.destination_name}</p>
                        <p className="text-sm text-muted-foreground">{fb.destination_country}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.className}`}>
                          {cfg.emoji} {cfg.label}
                        </span>
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                          {fb.helpful_score}/10
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">"{fb.feedback_text}"</p>
                    <p className="text-xs text-muted-foreground">{formatDate(fb.created_at)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Security section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-foreground" />
            <h2 className="text-2xl font-bold text-foreground">Seguridad</h2>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Gestiona tu contraseña y opciones de seguridad
            </p>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-muted p-4 transition-colors hover:bg-muted/80"
            >
              <div className="text-left">
                <p className="font-medium text-foreground">Cambiar contraseña</p>
                <p className="text-sm text-muted-foreground">
                  Actualiza tu contraseña para mantener tu cuenta segura
                </p>
              </div>
              <KeyRound className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        {/* More sections can be added here (feedback history, preferences, etc.) */}
      </main>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />

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

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
