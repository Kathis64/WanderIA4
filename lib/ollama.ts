/**
 * Ollama Microservice Integration
 * 
 * Connects to Ollama running locally with llama3.2:3b model
 * 
 * Setup for Windows:
 * 1. Download Ollama from https://ollama.ai/download/windows
 * 2. Install and run: ollama serve
 * 3. Pull the model: ollama pull llama3.2:3b
 * 4. The API will be available at http://localhost:11434
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://localhost:11434"
const MODEL_NAME = "llama3.2:3b"

// List of valid Lucide icon names for the AI to use
export const VALID_LUCIDE_ICONS = [
  // Weather/Climate
  "Snowflake", "CloudSun", "Sun", "Palmtree", "Cloud", "CloudRain", "CloudSnow", "Wind", "Thermometer",
  // Money/Budget
  "Wallet", "DollarSign", "Gem", "Crown", "CreditCard", "Coins", "PiggyBank", "BadgeDollarSign",
  // Time/Duration
  "Clock", "Calendar", "CalendarDays", "CalendarRange", "Timer", "Hourglass", "Watch",
  // Interests/Culture
  "Landmark", "TreePine", "Mountain", "UtensilsCrossed", "Bed", "Sparkles", "BookOpen", "Palette", "Music", "Theater",
  // Travel
  "Globe", "Map", "Backpack", "Hotel", "Compass", "Plane", "Train", "Car", "Ship", "Luggage",
  // People
  "Heart", "Users", "User", "Baby", "UserPlus", "UsersRound",
  // Activities
  "Footprints", "Waves", "Building", "ShoppingBag", "Camera", "Bike", "Tent", "Dumbbell", "Fish",
  // Food
  "Soup", "Pizza", "Salad", "Beef", "Coffee", "Wine", "Apple", "Croissant", "IceCream",
  // Accommodation
  "Home", "Building2", "Castle", "Warehouse",
  // Nature
  "Flower", "Trees", "Leaf", "Bird", "Sunset", "Sunrise", "Moon", "Star",
  // Adventure
  "Rocket", "Zap", "Flame", "Anchor", "Navigation",
  // Safety/Health
  "Shield", "HeartPulse", "Stethoscope", "Activity",
  // Communication
  "MessageCircle", "Phone", "Wifi", "Signal",
  // Other
  "Check", "X", "Plus", "Minus", "ArrowRight", "ArrowLeft", "Search", "Filter", "Settings"
]

/**
 * Extrae insights abstractos de favoritos y comentarios
 * Sin mencionar destinos específicos, solo patrones y preferencias
 */
function extractPreferenceInsights(
  favorites: Array<{ destination_name: string; destination_country: string; rating: number }> = [],
  feedback: Array<{ destination_name: string; sentiment: string; helpful_score: number; feedback_text: string }> = []
): string {
  const insights: string[] = []

  // Keywords asociadas con diferentes tipos de experiencias
  const keywordMap: Record<string, string[]> = {
    "arquitectura y patrimonio": ["arquitectura", "monumento", "patrimonio", "histórico", "ruinas", "templo", "castillo", "iglesia", "catedral", "estructura"],
    "gastronomía y culinary": ["gastronomía", "comida", "cocina", "culinaria", "sabor", "comidas locales", "mercado de comida", "chef", "restaurante", "auténtica"],
    "naturaleza y paisajes": ["naturaleza", "paisaje", "montaña", "playa", "bosque", "selva", "rio", "cascada", "senderismo", "trekking", "naturaleza salvaje"],
    "experiencias culturales": ["cultura", "tradición", "costumbre", "pueblo", "comunidad", "local", "ritual", "festival", "arte local", "teatro"],
    "aventura y actividad": ["aventura", "activ", "deporte", "adrenalina", "emoción", "desafío", "extremo", "acampar", "escalada", "buceo"],
    "relajación y bienestar": ["relax", "relajación", "paz", "tranquilo", "descanso", "spa", "bienestar", "calma", "meditar", "serenidad"],
    "vida nocturna y social": ["noche", "discoteca", "bar", "vida nocturna", "fiesta", "entretenimiento", "ambiente", "socializar", "música en vivo"],
    "presupuesto accesible": ["económico", "barato", "asequible", "precio", "valor", "caro"],
    "lujo y comodidad": ["lujo", "cómodo", "confort", "premium", "lujoso", "elegante", "sofisticado"],
    "destinos asiáticos": ["asia", "tailandia", "japón", "vietnam", "china", "india", "indonesia"],
    "destinos europeos": ["europa", "españa", "francia", "italia", "alemania", "portugal"],
    "destinos americanos": ["américa", "méxico", "perú", "brasil", "argentina", "colombia", "estados unidos"],
  }

  // Analizar comentarios para extraer patrones
  const detectedPatterns = new Set<string>()
  const allText = [
    ...feedback.map(f => f.feedback_text),
    ...feedback.map(f => f.destination_name)
  ].join(" ").toLowerCase()

  for (const [pattern, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => allText.includes(kw))) {
      detectedPatterns.add(pattern)
    }
  }

  // Calcular preferencias por sentimiento
  const positiveCount = feedback.filter(f => f.sentiment === "positive").length
  const negativeCount = feedback.filter(f => f.sentiment === "negative").length
  const avgHelpfulScore = feedback.length > 0 
    ? feedback.reduce((sum, f) => sum + f.helpful_score, 0) / feedback.length 
    : 0

  // Analizar ratings de favoritos
  const avgRating = favorites.length > 0 
    ? favorites.reduce((sum, f) => sum + f.rating, 0) / favorites.length 
    : 0

  // Construir insights sin mencionar destinos específicos
  if (detectedPatterns.size > 0) {
    const patternsList = Array.from(detectedPatterns).slice(0, 3).join(", ")
    insights.push(`El usuario muestra preferencia por experiencias relacionadas con: ${patternsList}.`)
  }

  if (positiveCount > negativeCount && avgHelpfulScore > 5) {
    insights.push(`El usuario tiende a apreciar recomendaciones que se alinean con sus intereses específicos (puntuación de utilidad promedio: ${avgHelpfulScore.toFixed(1)}/10).`)
  }

  if (avgRating >= 4) {
    insights.push(`El usuario ha mostrado alta satisfacción con destinos que ofrecen ciertas características (calificación promedio: ${avgRating.toFixed(1)}/5).`)
  } else if (avgRating >= 3) {
    insights.push(`El usuario tiene preferencias moderadas bien definidas en cuanto a tipo de destino.`)
  }

  if (feedback.length > 0) {
    insights.push(`El usuario proporciona retroalimentación detallada y es selectivo con sus preferencias.`)
  }

  return insights.length > 0 
    ? insights.join(" ")
    : ""
}

/**
 * Exportable version que genera un perfil abstracto de preferencias del usuario
 * basado en favoritos y comentarios, SIN incluir nombres de destinos
 */
export function generateAbstractUserProfile(
  favorites: Array<{ destination_name: string; destination_country: string; rating: number }> = [],
  feedback: Array<{ destination_name: string; sentiment: string; helpful_score: number; feedback_text: string }> = []
): string {
  const insights = extractPreferenceInsights(favorites, feedback)
  
  if (!insights) {
    return ""
  }

  return `RESUMEN DE PREFERENCIAS DEL USUARIO (basado en su historial):
${insights}

INSTRUCCIONES: Utiliza este resumen para entender el tipo de experiencias que al usuario le atrae, pero NO hagas preguntas directas sobre los destinos mencionados en sus favoritos previos. En su lugar, profundiza en aspectos relacionados o complementarios de sus preferencias que aún no hayan sido explorados.`
}

/**
 * Extrae insights abstractos de favoritos y comentarios
 * Sin mencionar destinos específicos, solo patrones y preferencias
 */

export interface OllamaQuestion {
  id: string
  category: string
  question: string
  type: "single" | "multiple"
  maxSelections?: number
  options: {
    value: string
    label: string
    icon: string // Lucide icon name
  }[]
}

export interface OllamaRecommendation {
  destination: string
  country: string
  reasoning: string
  matchScore: number
  highlights: string[]
}

// System prompt for generating travel questions
const QUESTION_GENERATION_PROMPT = `Eres WanderIA, un asistente de viajes inteligente. Tu tarea es generar preguntas para un test de perfil de viajero.

REGLAS CRÍTICAS - DEBES SEGUIRLAS EXACTAMENTE:
1. RESPONDE SOLO CON JSON VÁLIDO. NADA DE TEXTO ANTES O DESPUÉS.
2. NO USES COMENTARIOS EN EL JSON.
3. ASEGÚRATE DE CERRAR TODOS LOS PARÉNTESIS, CORCHETES Y COMILLAS.
4. NO DEJES COMAS FINALES EN ARRAYS U OBJETOS.
5. CADA OPCIÓN DEBE TENER: value, label, icon (todos requeridos).
6. Los valores (value) deben ser en minúsculas sin espacios ni acentos (usar guion_bajo).
7. El icono DEBE SER EXACTAMENTE uno de esta lista: ${VALID_LUCIDE_ICONS.join(", ")}

ESTRUCTURA EXACTA A SEGUIR:
{
  "id": "id_en_snake_case",
  "category": "categoria_en_snake_case",
  "question": "¿Tu pregunta aquí?",
  "type": "single",
  "options": [
    {"value": "opcion_1", "label": "Etiqueta en español", "icon": "IconoValido"},
    {"value": "opcion_2", "label": "Otra etiqueta", "icon": "OtroIcono"}
  ]
}

VALIDACIÓN:
- Mínimo 4 opciones, máximo 6
- Los "value" deben ser snake_case
- Los "icon" deben ser de la lista (sin cambios)
- Los "label" deben ser en español
- NO INCLUYAS NINGÚN OTRO TEXTO FUERA DEL JSON`

// System prompt for generating recommendations
const RECOMMENDATION_PROMPT = `Eres WanderIA, un experto en recomendaciones de viajes personalizadas.

Basándote en el perfil del usuario y sus respuestas al test, debes recomendar destinos de viaje.

REGLAS:
1. Responde SOLO con JSON válido.
2. Considera todos los factores: clima, presupuesto, intereses, estilo de viaje, etc.
3. Proporciona razonamiento detallado para cada recomendación.
4. El matchScore debe ser un número entre 60 y 98.
5. Incluye al menos 3 highlights por destino.

FORMATO DE RESPUESTA (JSON):
{
  "recommendations": [
    {
      "destination": "Nombre de la ciudad",
      "country": "País",
      "reasoning": "Explicación detallada de por qué este destino es ideal para el perfil del usuario",
      "matchScore": 85,
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
    }
  ]
}`

interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
}

async function callOllama(prompt: string, systemPrompt: string): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        system: systemPrompt,
        stream: false,
        options: {
          temperature: 0.3,  // Lower temperature for more consistent JSON output
          top_p: 0.8,
          num_predict: 2048,
          top_k: 40,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data: OllamaResponse = await response.json()
    return data.response
  } catch (error) {
    console.error("Error calling Ollama:", error)
    throw error
  }
}

function extractJSON(text: string): string {
  // Limpiar markdown code blocks
  text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim()

  // Buscar el primer { y el último } balanceado
  const firstBrace = text.indexOf("{")
  if (firstBrace === -1) throw new Error("No JSON object found in response")

  let depth = 0
  let lastValidClose = -1
  let inString = false
  let escapeNext = false

  for (let i = firstBrace; i < text.length; i++) {
    const ch = text[i]

    if (escapeNext) { escapeNext = false; continue }
    if (ch === "\\" && inString) { escapeNext = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue

    if (ch === "{") depth++
    else if (ch === "}") {
      depth--
      if (depth === 0) { lastValidClose = i; break }
    }
  }

  // Si no se cerró bien, intentar cerrar manualmente hasta donde llegó
  let jsonStr = lastValidClose !== -1
    ? text.substring(firstBrace, lastValidClose + 1)
    : text.substring(firstBrace)

  // Limpiar problemas comunes del output de LLMs
  jsonStr = jsonStr
    // Trailing commas antes de ] o }
    .replace(/,\s*([}\]])/g, "$1")
    // Saltos de línea dentro de strings (los rompen)
    .replace(/"([^"]*)"/g, (match) =>
      match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")
    )
    // Quitar caracteres de control no escapados
    .replace(/[\x00-\x1F\x7F](?<!\\[nrt])/g, " ")

  // Intentar parsear
  try {
    JSON.parse(jsonStr)
    return jsonStr
  } catch {
    // Intentar reparar: si el array de options quedó abierto, cerrarlo
    const openBrackets = (jsonStr.match(/\[/g) || []).length
    const closeBrackets = (jsonStr.match(/\]/g) || []).length
    const openBraces = (jsonStr.match(/\{/g) || []).length
    const closeBraces = (jsonStr.match(/\}/g) || []).length

    let repaired = jsonStr.trim()
    // Quitar coma final si hay
    repaired = repaired.replace(/,\s*$/, "")

    // Cerrar strings abiertos si los hay
    const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length
    if (quoteCount % 2 !== 0) repaired += '"'

    // Cerrar brackets/braces faltantes
    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += "]"
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += "}"

    try {
      JSON.parse(repaired)
      return repaired
    } catch (e2) {
      throw new Error(`Invalid JSON: ${jsonStr.substring(0, 200)}...`)
    }
  }
}

export async function generateQuestion(
  category: string,
  existingQuestions: string[] = [],
  userProfile?: string
): Promise<OllamaQuestion | null> {
  const profileSection = userProfile
    ? `\nPERFIL CONOCIDO DEL USUARIO (úsalo para hacer preguntas más relevantes y personalizadas):\n${userProfile}\n`
    : ""

  const prompt = `Genera UNA pregunta para la categoría "${category}" del test de perfil de viajero.
${profileSection}
${existingQuestions.length > 0 ? `Preguntas ya existentes (evita repetir conceptos similares):\n${existingQuestions.join("\n")}` : ""}

${userProfile ? `Dado que ya conoces algo del usuario, enfoca la pregunta para profundizar en sus preferencias o descubrir matices nuevos relacionados con lo que ya le gusta.` : "Genera una pregunta única, interesante y relevante para conocer las preferencias de viaje del usuario."}
IMPORTANTE: Responde SOLO con el JSON, sin texto adicional, sin comentarios.`

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await callOllama(prompt, QUESTION_GENERATION_PROMPT)
      const jsonStr = extractJSON(response)

      let question: OllamaQuestion
      try {
        question = JSON.parse(jsonStr) as OllamaQuestion
      } catch (parseError) {
        console.error(`[Attempt ${attempt}] JSON parse error for category "${category}":`, parseError)
        if (attempt === 3) return null
        continue
      }

      if (!question.id || !question.question || !Array.isArray(question.options) || question.options.length < 2) {
        console.warn(`[Attempt ${attempt}] Invalid question structure for category "${category}"`)
        if (attempt === 3) return null
        continue
      }

      question.options = question.options.map(opt => ({
        ...opt,
        icon: VALID_LUCIDE_ICONS.includes(opt.icon) ? opt.icon : "HelpCircle",
      }))

      return question
    } catch (error) {
      console.error(`[Attempt ${attempt}] Error generating question for category "${category}":`, error)
      if (attempt === 3) return null
    }
  }

  return null
}

export async function generateQuestionBatch(
  categories: string[],
  userProfile?: string
): Promise<OllamaQuestion[]> {
  const questions: OllamaQuestion[] = []

  for (const category of categories) {
    const existingForCategory = questions
      .filter(q => q.category === category)
      .map(q => q.question)

    const question = await generateQuestion(category, existingForCategory, userProfile)
    if (question) {
      questions.push(question)
    }
  }

  return questions
}

export async function generateRecommendations(
  userAnswers: Record<string, string | string[]>,
  weights: Record<string, number>,
  userContext?: {
    favorites?: Array<{ destination_name: string; destination_country: string; rating: number }>
    feedback?: Array<{ destination_name: string; sentiment: string; helpful_score: number; feedback_text: string }>
  }
): Promise<OllamaRecommendation[]> {
  let contextSection = ""
  
  // Generar resumen abstracto de preferencias basado en el historial
  if (userContext?.favorites && userContext.favorites.length > 0 || userContext?.feedback && userContext.feedback.length > 0) {
    const abstractProfile = generateAbstractUserProfile(
      userContext?.favorites || [],
      userContext?.feedback || []
    )
    
    if (abstractProfile) {
      contextSection += `\n${abstractProfile}\n`
    }
  }
  
  // IMPORTANTE: Solo listamos destinos a EVITAR (feedback negativo), no los favoritos
  // Esto reduce el sesgo y permite que el AI recomiende nuevos destinos con características similares
  const destinosAEvitar = userContext?.feedback
    ?.filter(f => f.sentiment === "negative")
    ?.map(f => f.destination_name) || []
  
  if (destinosAEvitar.length > 0) {
    contextSection += `\nIMPORTANTE: Por favor evita recomendar estos destinos donde el usuario NO fue satisfecho:
${destinosAEvitar.map(d => `- ${d}`).join("\n")}\n`
  }

  const prompt = `El usuario ha completado el test de viaje con las siguientes respuestas:

${JSON.stringify(userAnswers, null, 2)}

Los pesos de importancia asignados por el usuario (1-10) son:
${JSON.stringify(weights, null, 2)}
${contextSection}

Basándote ÚNICAMENTE en el perfil del usuario y los pesos asignados, recomienda los 3 mejores destinos de viaje que no hayan sido visitados previamente.

CRÍTICO: No hagas recomendaciones basadas en los destinos favoritos previos. En su lugar, utiliza el TIPO DE EXPERIENCIAS y CARACTERÍSTICAS que el usuario aprecia para encontrar NUEVOS DESTINOS alternativos que también cumplen con esos criterios.

Por ejemplo:
- Si el usuario aprecia "arquitectura y patrimonio" pero ya visitó Japón, recomienda otros países con arquitectura notable
- Si le encanta "gastronomía auténtica", recomienda destinos con diferentes cocinas tradicionales
- El objetivo es diversidad dentro de las preferencias, no repetición`

  try {
    const response = await callOllama(prompt, RECOMMENDATION_PROMPT)
    const jsonStr = extractJSON(response)
    const data = JSON.parse(jsonStr)
    return data.recommendations as OllamaRecommendation[]
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return []
  }
}

// Check if Ollama is available
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
    })
    return response.ok
  } catch {
    return false
  }
}

// Get available models
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
    if (!response.ok) return []
    const data = await response.json()
    return data.models?.map((m: { name: string }) => m.name) || []
  } catch {
    return []
  }
}
