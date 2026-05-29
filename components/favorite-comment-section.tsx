"use client"

import { useState, useEffect } from "react"
import { Star, MessageSquare, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FavoriteCommentSectionProps {
  destinationName: string
  destinationCountry: string
  sessionId: string
  recommendationId: string
  token: string | null
}

type Sentiment = "positive" | "neutral" | "negative"

export function FavoriteCommentSection({
  destinationName,
  destinationCountry,
  sessionId,
  recommendationId,
  token,
}: FavoriteCommentSectionProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [savedRating, setSavedRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [comment, setComment] = useState("")
  const [sentiment, setSentiment] = useState<Sentiment>("neutral")
  const [helpfulScore, setHelpfulScore] = useState(5)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [commentSaved, setCommentSaved] = useState(false)

  // Cargar estado inicial de favorito
  useEffect(() => {
    if (!token || !destinationName) return
    const load = async () => {
      try {
        const res = await fetch("/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        const match = data.favorites?.find(
          (f: { destination_name: string; rating: number }) =>
            f.destination_name === destinationName
        )
        if (match) {
          setIsFavorite(true)
          setSavedRating(match.rating)
        }
      } catch {
        // silencioso
      }
    }
    load()
  }, [token, destinationName])

  const displayRating = hoverRating || savedRating

  const handleStarClick = async (starIndex: number) => {
    if (!token) {
      setErrorMessage("Token de sesión no encontrado. Intenta recargar la página.")
      return
    }

    setLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination_name: destinationName,
          destination_country: destinationCountry,
          rating: starIndex,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al marcar como favorito")
      }

      setIsFavorite(true)
      setSavedRating(starIndex)
      setSuccessMessage(`¡${destinationName} agregado a favoritos con ${starIndex} estrella${starIndex > 1 ? "s" : ""}!`)
      setTimeout(() => setSuccessMessage(""), 4000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async () => {
    if (!token) return

    setLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch(
        `/api/favorites?destination_name=${encodeURIComponent(destinationName)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error al remover favorito")

      setIsFavorite(false)
      setSavedRating(0)
      setHoverRating(0)
      setSuccessMessage("Eliminado de favoritos")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    const trimmed = comment.trim()
    if (!token) {
      setErrorMessage("Token de sesión no encontrado. Intenta recargar la página.")
      return
    }
    if (!trimmed) {
      setErrorMessage("Por favor escribe un comentario antes de guardar.")
      return
    }

    setLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          recommendation_id: recommendationId,
          destination_name: destinationName,
          destination_country: destinationCountry,
          feedback_text: trimmed,
          sentiment,
          helpful_score: helpfulScore,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error al guardar comentario")

      setCommentSaved(true)
      setComment("")
      setSentiment("neutral")
      setHelpfulScore(5)
      setShowCommentForm(false)
      setSuccessMessage("¡Comentario guardado! Tu opinión nos ayuda a mejorar las recomendaciones.")
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const sentimentOptions: { value: Sentiment; label: string; emoji: string }[] = [
    { value: "positive", label: "Me interesa", emoji: "👍" },
    { value: "neutral", label: "Neutral", emoji: "😐" },
    { value: "negative", label: "No me interesa", emoji: "👎" },
  ]

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* Mensajes globales */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800/40 dark:bg-green-950/40 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
          <button onClick={() => setErrorMessage("")} className="ml-auto">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Bloque de favoritos */}
      <div className="rounded-xl border border-border bg-card px-6 py-5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            ¿Te interesa{" "}
            <span className="text-primary">{destinationName}</span>?
          </h3>
          {isFavorite && (
            <button
              onClick={handleRemoveFavorite}
              disabled={loading}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-destructive disabled:opacity-50"
            >
              Quitar favorito
            </button>
          )}
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Califícalo con estrellas para guardarlo en tu perfil
        </p>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={loading}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="group rounded p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
              title={`${star} estrella${star > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  star <= displayRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-transparent text-muted-foreground/40 group-hover:text-yellow-300"
                )}
              />
            </button>
          ))}

          <span className="ml-3 text-sm text-muted-foreground">
            {hoverRating > 0
              ? `${hoverRating} estrella${hoverRating > 1 ? "s" : ""}`
              : savedRating > 0
              ? `${savedRating} estrella${savedRating > 1 ? "s" : ""} — guardado`
              : "Pasa el cursor para calificar"}
          </span>

          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Bloque de comentario */}
      <div className="rounded-xl border border-border bg-card px-6 py-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Comparte tu opinión sobre{" "}
              <span className="text-primary">{destinationName}</span>
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tu retroalimentación mejora las próximas recomendaciones
            </p>
          </div>
          {!showCommentForm && !commentSaved && (
            <button
              onClick={() => setShowCommentForm(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Agregar
            </button>
          )}
          {commentSaved && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Comentario guardado
            </span>
          )}
        </div>

        {showCommentForm && (
          <div className="mt-5 flex flex-col gap-4">
            {/* Sentiment */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-foreground">
                ¿Cómo te parece esta recomendación?
              </label>
              <div className="flex gap-2">
                {sentimentOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSentiment(opt.value)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                      sentiment === opt.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-foreground hover:bg-secondary"
                    )}
                  >
                    <span>{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Helpful score */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between text-xs font-medium text-foreground">
                <span>Utilidad de la sugerencia</span>
                <span className="tabular-nums text-muted-foreground">{helpfulScore}/10</span>
              </label>
              <div className="relative flex items-center gap-3">
                <div className="relative flex-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-foreground transition-all"
                      style={{ width: `${(helpfulScore / 10) * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={helpfulScore}
                    onChange={(e) => setHelpfulScore(Number(e.target.value))}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
                <div className="flex w-24 justify-between text-xs text-muted-foreground">
                  {[0, 2, 4, 6, 8, 10].map((n) => (
                    <span
                      key={n}
                      className={cn(
                        "transition-colors",
                        helpfulScore >= n ? "text-foreground font-medium" : ""
                      )}
                    >
                      {n === helpfulScore ? helpfulScore : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-foreground">
                Tu comentario
              </label>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value)
                  if (errorMessage) setErrorMessage("")
                }}
                placeholder={`¿Qué te parece ${destinationName} como destino? ¿Por qué sí o por qué no?`}
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <span className="text-right text-xs text-muted-foreground">
                {comment.trim().length} caracteres
              </span>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <button
                onClick={handleAddComment}
                disabled={loading || !comment.trim()}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  comment.trim()
                    ? "bg-foreground text-background hover:opacity-90"
                    : "cursor-not-allowed bg-muted text-muted-foreground",
                  "disabled:opacity-50"
                )}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar comentario
              </button>
              <button
                onClick={() => {
                  setShowCommentForm(false)
                  setComment("")
                  setErrorMessage("")
                }}
                disabled={loading}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}