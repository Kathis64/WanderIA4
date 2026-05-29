import { NextRequest, NextResponse } from "next/server"
import { 
  generateQuestion, 
  generateQuestionBatch, 
  generateRecommendations,
  checkOllamaHealth,
  getAvailableModels,
  generateAbstractUserProfile
} from "@/lib/ollama"
import { verifyJWT } from "@/lib/database"

// GET: Check Ollama health and get available models
export async function GET() {
  try {
    const isHealthy = await checkOllamaHealth()
    const models = await getAvailableModels()
    
    return NextResponse.json({
      status: isHealthy ? "connected" : "disconnected",
      models,
      message: isHealthy 
        ? "Ollama está funcionando correctamente" 
        : "No se pudo conectar con Ollama. Asegúrate de que esté ejecutándose (ollama serve)",
    })
  } catch {
    return NextResponse.json({
      status: "error",
      models: [],
      message: "Error al verificar el estado de Ollama",
    }, { status: 500 })
  }
}

// POST: Generate questions or recommendations
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    
    const token = authHeader.split(" ")[1]
    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
    }

    const body = await request.json()
    const { action, category, categories, answers, weights, existingQuestions } = body

    // Check Ollama health first
    const isHealthy = await checkOllamaHealth()
    if (!isHealthy) {
      return NextResponse.json({
        error: "Ollama no está disponible. Por favor, asegúrate de que esté ejecutándose.",
        fallback: true,
      }, { status: 503 })
    }

    switch (action) {
      case "generate_question": {
        if (!category) {
          return NextResponse.json({ error: "Categoría requerida" }, { status: 400 })
        }
        const question = await generateQuestion(category, existingQuestions || [])
        if (!question) {
          return NextResponse.json({ error: "Error al generar pregunta" }, { status: 500 })
        }
        return NextResponse.json({ question })
      }

      case "generate_questions_batch": {
        if (!categories || !Array.isArray(categories)) {
          return NextResponse.json({ error: "Categorías requeridas" }, { status: 400 })
        }

        // Cargar contexto del usuario para personalizar las preguntas
        let userProfile: string | undefined = undefined
        if (body.includeUserContext) {
          try {
            const { getFavoritesByUser, getFeedbackByUser } = await import("@/lib/database")
            const userId = payload.id as string
            const favorites = getFavoritesByUser(userId)
            const feedbackList = getFeedbackByUser(userId)

            // Usar la nueva función que extrae insights abstractos en lugar de nombres de destinos
            if (favorites.length > 0 || feedbackList.length > 0) {
              userProfile = generateAbstractUserProfile(favorites, feedbackList)
            }
          } catch (e) {
            console.error("[WanderIA] Error loading user context for questions:", e)
          }
        }

        const questions = await generateQuestionBatch(categories, userProfile)
        return NextResponse.json({ questions })
      }

      case "generate_recommendations": {
        if (!answers || !weights) {
          return NextResponse.json({ error: "Respuestas y pesos requeridos" }, { status: 400 })
        }

        // Cargar contexto del usuario desde la BD para personalizar recomendaciones
        let userContext = undefined
        try {
          const { getFavoritesByUser, getFeedbackByUser } = await import("@/lib/database")
          const userId = payload.id as string
          const favorites = getFavoritesByUser(userId)
          const feedback = getFeedbackByUser(userId)
          if (favorites.length > 0 || feedback.length > 0) {
            userContext = { favorites, feedback }
          }
        } catch (e) {
          console.error("[WanderIA] Error loading user context:", e)
        }

        const recommendations = await generateRecommendations(answers, weights, userContext)
        return NextResponse.json({ recommendations })
      }

      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Ollama API error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
