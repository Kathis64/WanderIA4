"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useWeights } from "@/context/weights-context"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { WeightsConfigPanel, WeightsConfigButton } from "@/components/weights-config"
import { testQuestions } from "@/lib/test-questions"
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Brain, Zap, WifiOff, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────

interface AiOption {
  value: string
  label: string
  icon: string // nombre del icono Lucide como string
}

interface AiQuestion {
  id: string
  category: string
  question: string
  type: "single" | "multiple"
  maxSelections?: number
  options: AiOption[]
}

// Categorías que Ollama debe generar (25 preguntas para mayor diversidad)
const AI_CATEGORIES = [
  "climate", "budget", "duration", "interests", "travel_style",
  "continent", "activities", "food", "accommodation", "companion",
  "safety", "language", "mobility", "season", "nightlife",
  "nature", "culture", "adventure_level", "connectivity", "photography",
  "sustainability", "shopping", "crowds", "water_activities", "season",
]

type Answers = Record<string, string | string[]>

// ──────────────────────────────────────────────
// Helper: resolver icono Lucide desde string
// ──────────────────────────────────────────────

// Mapeo inteligente de valores a iconos por defecto (para respuestas genéricas)
const VALUE_TO_ICON_MAP: Record<string, string> = {
  // Temperatura y clima
  "frio": "Snowflake",
  "cold": "Snowflake",
  "templado": "CloudSun",
  "moderate_temp": "CloudSun",
  "calido": "Sun",
  "hot": "Sun",
  "tropical": "Palmtree",
  
  // Presupuesto
  "bajo": "Wallet",
  "economico": "Wallet",
  "budget": "Wallet",
  "medio": "DollarSign",
  "moderado_budget": "DollarSign",
  "moderate_budget": "DollarSign",
  "alto": "Gem",
  "expensive": "Gem",
  "premium": "Crown",
  "luxury": "Crown",
  
  // Duración
  "corto": "Clock",
  "short": "Clock",
  "fin_semana": "Clock",
  "weekend": "Clock",
  "semana": "Calendar",
  "una_semana": "Calendar",
  "dos_semanas": "CalendarDays",
  "largo": "CalendarRange",
  "extended": "CalendarRange",
  "mes_mas": "CalendarRange",
  
  // Intereses y actividades
  "cultura": "Landmark",
  "cultural": "Landmark",
  "arquitectura": "Castle",
  "naturaleza": "TreePine",
  "nature": "TreePine",
  "montanas": "Mountain",
  "mountains": "Mountain",
  "aventura": "Mountain",
  "adventure": "Zap",
  "gastronomia": "UtensilsCrossed",
  "food": "UtensilsCrossed",
  "relax": "Bed",
  "relajacion": "Bed",
  "relax_sunset": "Sunset",
  "historia": "Sparkles",
  "history": "Sparkles",
  
  // Estilos de viaje
  "mochilero": "Backpack",
  "backpacker": "Backpack",
  "comfort": "Hotel",
  "lujo": "Crown",
  "luxury_travel": "Crown",
  
  // Continentes
  "europa": "Globe",
  "europe": "Globe",
  "asia": "Compass",
  "americas": "Map",
  "america": "Map",
  "africa": "Sun",
  "oceania": "Waves",
  
  // Actividades
  "senderismo": "Footprints",
  "hiking": "Footprints",
  "playa": "Waves",
  "beach": "Waves",
  "museos": "Building",
  "museums": "Building",
  "compras": "ShoppingBag",
  "shopping": "ShoppingBag",
  "fotografia": "Camera",
  "photography": "Camera",
  "vida_nocturna": "Music",
  "nightlife": "Music",
  
  // Comida
  "local": "Soup",
  "tipica": "Soup",
  "internacional": "Pizza",
  "international": "Pizza",
  "saludable": "Salad",
  "healthy": "Salad",
  "gourmet": "Beef",
  "fine_dining": "Beef",
  
  // Alojamiento
  "hostal": "Home",
  "hostel": "Home",
  "hotel": "Hotel",
  "apartamento": "Home",
  "apartment": "Home",
  "airbnb": "Home",
  "glamping": "Tent",
  "resort": "Building2",
  
  // Compañía
  "solo": "User",
  "alone": "User",
  "pareja": "Heart",
  "couple": "Heart",
  "amigos": "Users",
  "friends": "Users",
  "familia": "Baby",
  "family": "Baby",
  
  // Seguridad
  "muy_seguro": "ShieldCheck",
  "very_safe": "ShieldCheck",
  "seguro": "Shield",
  "safe": "Shield",
  "moderado_safety": "AlertTriangle",
  "moderate_safety": "AlertTriangle",
  "aventurero": "Compass",
  "adventurous": "Compass",
  
  // Idioma
  "espanol": "MessageCircle",
  "spanish": "MessageCircle",
  "ingles": "Globe",
  "english": "Globe",
  "frances": "Languages",
  "french": "Languages",
  "aprender": "BookOpen",
  "learn": "BookOpen",
  
  // Estación
  "primavera": "Flower",
  "spring": "Flower",
  "verano": "Sun",
  "summer": "Sun",
  "otono": "Leaf",
  "autumn": "Leaf",
  "fall": "Leaf",
  "invierno": "Snowflake",
  "winter": "Snowflake",
  
  // Vida nocturna
  "fiestas": "Music",
  "parties": "Music",
  "discotecas": "Music",
  "bares": "Wine",
  "bars": "Wine",
  "cenas": "UtensilsCrossed",
  "dining": "UtensilsCrossed",
  "tranquila": "Moon",
  "quiet": "Moon",
  
  // Naturaleza
  "bosques": "TreePine",
  "forests": "TreePine",
  "playas": "Waves",
  "beaches": "Waves",
  "desiertos": "Sun",
  "deserts": "Sun",
  "selva": "Feather",
  "jungle": "Feather",
  "oceano": "Waves",
  "ocean": "Waves",
  
  // Transporte
  "caminando": "Footprints",
  "walking": "Footprints",
  "transporte": "Train",
  "public": "Train",
  "auto": "Car",
  "car": "Car",
  "tours": "Compass",
  "organized": "Compass",
  
  // Conectividad
  "esencial": "Wifi",
  "essential": "Wifi",
  "importante": "Signal",
  "important": "Signal",
  "ocasional": "Battery",
  "occasional": "Battery",
  "desconexion": "WifiOff",
  "disconnect": "WifiOff",
  
  // Fotografía
  "paisajes": "Camera",
  "landscapes": "Camera",
  "personas": "Users",
  "people": "Users",
  "no_foto": "XCircle",
  "not_photo": "XCircle",
  
  // Sostenibilidad
  "muy_importante": "Leaf",
  "very_important": "Leaf",
  "importante_sustain": "Flower",
  "important_sustain": "Flower",
  "moderado_sustain": "Globe",
  "indiferente_sustain": "Compass",
  "indifferent": "Compass",
  
  // Multitudes
  "solitario": "User",
  "solitary": "User",
  "poco": "Users",
  "few": "Users",
  "indiferente_crowds": "Globe",
  
  // Agua
  "buceo": "Fish",
  "diving": "Fish",
  "surf": "Waves",
  "nado": "Waves",
  "swimming": "Waves",
  "ninguna": "XCircle",
  "none": "XCircle",
  
  // Movilidad
  "sin_restricciones": "Footprints",
  "no_restrictions": "Footprints",
  "poco_caminar": "Car",
  "little_walking": "Car",
  "accesible": "HeartPulse",
  "accessible": "HeartPulse",
  "flexible": "Compass",
  
  // Compras
  "mercados": "ShoppingBag",
  "markets": "ShoppingBag",
  "centros": "Building",
  "centers": "Building",
  "artesanias": "Palette",
  "crafts": "Palette",
  "no_shopping": "XCircle",
  "not_shopping": "XCircle",
}

function resolveIcon(iconName: string | undefined | null): LucideIcon {
  if (!iconName) return LucideIcons.HelpCircle as LucideIcon
  
  const icons = LucideIcons as unknown as Record<string, LucideIcon>
  
  // 1. Intenta con el nombre exacto primero
  if (icons[iconName]) {
    return icons[iconName]
  }
  
  // 2. Intenta normalizar el nombre (CapitalCase)
  const capitalized = iconName.charAt(0).toUpperCase() + iconName.slice(1)
  if (icons[capitalized]) {
    return icons[capitalized]
  }
  
  // 3. Intenta buscar en el mapeo por valor
  const lowerValue = iconName.toLowerCase().replace(/\s+/g, "_")
  const mappedIcon = VALUE_TO_ICON_MAP[lowerValue]
  if (mappedIcon && icons[mappedIcon]) {
    return icons[mappedIcon]
  }
  
  // 4. Si contiene palabras clave, mapear a iconos relevantes
  const lower = iconName.toLowerCase()
  if (lower.includes("clima") || lower.includes("weather")) return icons.CloudSun as LucideIcon
  if (lower.includes("presupuesto") || lower.includes("budget") || lower.includes("precio")) return icons.DollarSign as LucideIcon
  if (lower.includes("tiempo") || lower.includes("duration")) return icons.Clock as LucideIcon
  if (lower.includes("cultura") || lower.includes("culture") || lower.includes("arte")) return icons.Landmark as LucideIcon
  if (lower.includes("naturaleza") || lower.includes("nature")) return icons.TreePine as LucideIcon
  if (lower.includes("aventura") || lower.includes("adventure")) return icons.Zap as LucideIcon
  if (lower.includes("comida") || lower.includes("food") || lower.includes("gastronomia")) return icons.UtensilsCrossed as LucideIcon
  if (lower.includes("alojamiento") || lower.includes("accommodation") || lower.includes("hotel")) return icons.Hotel as LucideIcon
  if (lower.includes("playa") || lower.includes("beach") || lower.includes("ocean")) return icons.Waves as LucideIcon
  if (lower.includes("montaña") || lower.includes("mountain")) return icons.Mountain as LucideIcon
  if (lower.includes("seguridad") || lower.includes("safety")) return icons.Shield as LucideIcon
  if (lower.includes("idioma") || lower.includes("language")) return icons.Languages as LucideIcon
  if (lower.includes("foto") || lower.includes("photo") || lower.includes("camera")) return icons.Camera as LucideIcon
  if (lower.includes("compras") || lower.includes("shopping")) return icons.ShoppingBag as LucideIcon
  
  // 5. Fallback final
  return icons.HelpCircle as LucideIcon
}

// ──────────────────────────────────────────────
// Componente de tarjeta de opción (compatible con preguntas IA y estáticas)
// ──────────────────────────────────────────────

interface OptionCardProps {
  value: string
  label: string
  iconName?: string       // para preguntas de IA (string)
  IconComponent?: LucideIcon // para preguntas estáticas (componente)
  isSelected: boolean
  onSelect: () => void
}

function OptionCard({ value, label, iconName, IconComponent, isSelected, onSelect }: OptionCardProps) {
  // Garantizar que SIEMPRE hay un icono válido
  let Icon: LucideIcon
  
  if (IconComponent) {
    // Si viene un componente directamente, usarlo
    Icon = IconComponent
  } else if (iconName) {
    // Si viene nombre de icono, resolver con inteligencia
    Icon = resolveIcon(iconName)
  } else {
    // Fallback: intentar derivar icono del label o valor
    const derivedIcon = resolveIcon(label || value)
    Icon = derivedIcon || (LucideIcons.HelpCircle as LucideIcon)
  }
  
  return (
    <button
      key={value}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all duration-200",
        "hover:border-foreground/30 hover:bg-secondary/60 active:scale-95",
        isSelected
          ? "border-foreground bg-foreground text-background shadow-md"
          : "border-border bg-card text-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-6 w-6 flex-shrink-0",
          isSelected ? "text-background" : "text-muted-foreground"
        )}
      />
      <span className="text-xs font-medium leading-tight">{label}</span>
    </button>
  )
}

// ──────────────────────────────────────────────
// Contenido del test
// ──────────────────────────────────────────────

function TestContent() {
  const { token } = useAuth()
  const { weights } = useWeights()
  const router = useRouter()

  const [aiQuestions, setAiQuestions] = useState<AiQuestion[]>([])
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "connected" | "offline">("checking")
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Decidir qué preguntas usar
  const questions = aiQuestions.length > 0 ? aiQuestions : testQuestions
  const usingAI = aiQuestions.length > 0
  const totalSteps = questions.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  // Pregunta actual (puede ser de IA o estática)
  const currentQuestion = questions[currentStep] as AiQuestion | typeof testQuestions[0]
  const currentAnswer = answers[currentQuestion.id]

  // ── Cargar preguntas desde Ollama (con caché en localStorage) ──
  useEffect(() => {
    const CACHE_KEY = "wanderia_ai_questions_v2"
    const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 horas en ms

    // Opciones de relleno por categoría — garantiza mínimo 4 opciones con sentido
    const FALLBACK_OPTIONS: Record<string, AiQuestion["options"]> = {
      climate: [
        { value: "frio",     label: "Frío",     icon: "Snowflake" },
        { value: "templado", label: "Templado", icon: "CloudSun"  },
        { value: "calido",   label: "Cálido",   icon: "Sun"       },
        { value: "tropical", label: "Tropical", icon: "Palmtree"  },
      ],
      budget: [
        { value: "bajo",    label: "Económico", icon: "Wallet"      },
        { value: "medio",   label: "Moderado",  icon: "DollarSign"  },
        { value: "alto",    label: "Cómodo",    icon: "Gem"         },
        { value: "premium", label: "Premium",   icon: "Crown"       },
      ],
      duration: [
        { value: "fin_semana", label: "Fin de semana", icon: "Clock"        },
        { value: "una_semana", label: "1 semana",      icon: "Calendar"     },
        { value: "dos_semanas",label: "2 semanas",     icon: "CalendarDays" },
        { value: "mes_mas",    label: "1 mes o más",   icon: "CalendarRange"},
      ],
      travel_style: [
        { value: "mochilero", label: "Mochilero", icon: "Backpack"      },
        { value: "comfort",   label: "Confort",   icon: "Hotel"         },
        { value: "cultural",  label: "Cultural",  icon: "Landmark"      },
        { value: "lujo",      label: "Lujo",      icon: "Crown"         },
      ],
      continent: [
        { value: "europa",   label: "Europa",   icon: "Globe"    },
        { value: "asia",     label: "Asia",     icon: "Compass"  },
        { value: "americas", label: "Américas", icon: "Map"      },
        { value: "africa",   label: "África",   icon: "Sun"      },
        { value: "oceania",  label: "Oceanía",  icon: "Waves"    },
      ],
      activities: [
        { value: "senderismo",    label: "Senderismo",     icon: "Footprints"     },
        { value: "playa",         label: "Playa",          icon: "Waves"          },
        { value: "museos",        label: "Museos",         icon: "Landmark"       },
        { value: "vida_nocturna", label: "Vida nocturna",  icon: "Moon"           },
        { value: "fotografia",    label: "Fotografía",     icon: "Camera"         },
        { value: "compras",       label: "Compras",        icon: "ShoppingBag"    },
      ],
      food: [
        { value: "local",      label: "Local auténtica", icon: "Soup"           },
        { value: "gourmet",    label: "Gourmet",         icon: "UtensilsCrossed"},
        { value: "street",     label: "Comida callejera",icon: "Pizza"          },
        { value: "saludable",  label: "Saludable",       icon: "Salad"          },
      ],
      accommodation: [
        { value: "hostal",  label: "Hostal",        icon: "Bed"      },
        { value: "hotel",   label: "Hotel",         icon: "Hotel"    },
        { value: "airbnb",  label: "Apartamento",   icon: "Home"     },
        { value: "resort",  label: "Resort",        icon: "Building2"},
      ],
      companion: [
        { value: "solo",    label: "Solo/a",    icon: "User"       },
        { value: "pareja",  label: "En pareja", icon: "Heart"      },
        { value: "amigos",  label: "Con amigos",icon: "Users"      },
        { value: "familia", label: "Familia",   icon: "Baby"       },
      ],
      safety: [
        { value: "muy_seguro", label: "Muy seguro",  icon: "Shield"      },
        { value: "seguro",     label: "Seguro",      icon: "ShieldCheck" },
        { value: "moderado",   label: "Moderado",    icon: "AlertTriangle"},
        { value: "aventurero", label: "Me adapto",   icon: "Compass"     },
      ],
      language: [
        { value: "espanol", label: "Español",    icon: "MessageCircle" },
        { value: "ingles",  label: "Inglés",     icon: "Globe"         },
        { value: "frances", label: "Francés",    icon: "Languages"     },
        { value: "aprender",label: "Aprender",   icon: "BookOpen"      },
      ],
      season: [
        { value: "primavera", label: "Primavera", icon: "Flower"  },
        { value: "verano",    label: "Verano",    icon: "Sun"     },
        { value: "otono",     label: "Otoño",     icon: "Leaf"    },
        { value: "invierno",  label: "Invierno",  icon: "Snowflake"},
      ],
      nightlife: [
        { value: "fiestas",   label: "Discotecas",   icon: "Music"        },
        { value: "bares",     label: "Bares",        icon: "Wine"         },
        { value: "cenas",     label: "Cenas",        icon: "UtensilsCrossed"},
        { value: "tranquila", label: "Tranquila",    icon: "Moon"         },
      ],
      nature: [
        { value: "montanas",  label: "Montañas", icon: "Mountain"  },
        { value: "playas",    label: "Playas",   icon: "Waves"     },
        { value: "bosques",   label: "Bosques",  icon: "TreePine"  },
        { value: "desiertos", label: "Desiertos",icon: "Sun"       },
      ],
      culture: [
        { value: "arquitectura", label: "Arquitectura", icon: "Landmark"  },
        { value: "arte",         label: "Arte",         icon: "Palette"   },
        { value: "tradiciones",  label: "Tradiciones",  icon: "BookOpen"  },
        { value: "gastronomia",  label: "Gastronomía",  icon: "Soup"      },
      ],
      adventure_level: [
        { value: "relajado", label: "Relajado",  icon: "Sunset"    },
        { value: "moderado", label: "Moderado",  icon: "Compass"   },
        { value: "activo",   label: "Activo",    icon: "Footprints"},
        { value: "extremo",  label: "Extremo",   icon: "Zap"       },
      ],
      connectivity: [
        { value: "esencial",   label: "Esencial",    icon: "Wifi"    },
        { value: "importante", label: "Importante",  icon: "Signal"  },
        { value: "ocasional",  label: "Ocasional",   icon: "WifiOff" },
        { value: "desconectar",label: "Desconectar", icon: "Leaf"    },
      ],
      photography: [
        { value: "paisajes",    label: "Paisajes",    icon: "Camera"    },
        { value: "arquitectura",label: "Arquitectura",icon: "Landmark"  },
        { value: "personas",    label: "Personas",    icon: "Users"     },
        { value: "no_foto",     label: "No prioritario", icon: "XCircle"   },
      ],
      sustainability: [
        { value: "muy_importante", label: "Muy importante", icon: "Leaf"    },
        { value: "importante",     label: "Importante",     icon: "Flower"  },
        { value: "moderado",       label: "Moderado",       icon: "Globe"   },
        { value: "indiferente",    label: "Indiferente",    icon: "Compass" },
      ],
      shopping: [
        { value: "mercados",    label: "Mercados locales", icon: "ShoppingBag"   },
        { value: "centros",     label: "Centros comerciales", icon: "Building"  },
        { value: "artesanias",  label: "Artesanías",       icon: "Palette"      },
        { value: "no_shopping", label: "No es prioridad",  icon: "XCircle"            },
      ],
      crowds: [
        { value: "solitario",  label: "Lugares solitarios", icon: "User"       },
        { value: "poco",       label: "Pocos turistas",     icon: "Users"      },
        { value: "moderado",   label: "Moderado",           icon: "Users" },
        { value: "indiferente",label: "Me da igual",        icon: "Globe"      },
      ],
      water_activities: [
        { value: "buceo",   label: "Buceo",    icon: "Waves"  },
        { value: "surf",    label: "Surf",     icon: "Waves" },
        { value: "nado",    label: "Nadar",    icon: "Waves"  },
        { value: "ninguna", label: "Ninguna",  icon: "XCircle"      },
      ],
      mobility: [
        { value: "sin_restricciones", label: "Sin restricciones", icon: "Footprints"},
        { value: "poco_caminar",      label: "Poco caminar",      icon: "Car"       },
        { value: "accesible",         label: "Accesible",         icon: "HeartPulse"},
        { value: "flexible",          label: "Flexible",          icon: "Compass"   },
      ],
    }

    /** Asegura que toda pregunta tenga al menos 4 opciones CON ICONOS VÁLIDOS */
    function ensureMinOptions(q: AiQuestion): AiQuestion {
      // Validar que cada opción existente tenga un icono válido
      const validatedOptions = q.options.map(opt => {
        let validIcon = opt.icon
        if (!validIcon || validIcon === "" || validIcon === "?" || validIcon === "HelpCircle") {
          // Derivar icono del value o label
          const derived = VALUE_TO_ICON_MAP[opt.value.toLowerCase()] ||
                         VALUE_TO_ICON_MAP[opt.label.toLowerCase().replace(/\s+/g, "_")] ||
                         "HelpCircle"
          validIcon = derived
        }
        return { ...opt, icon: validIcon }
      })
      
      if (validatedOptions.length >= 4) return { ...q, options: validatedOptions }
      
      const extras = FALLBACK_OPTIONS[q.category] ?? [
        { value: "si",          label: "Sí",             icon: "Check"    },
        { value: "no",          label: "No",             icon: "X"        },
        { value: "tal_vez",     label: "Tal vez",        icon: "HelpCircle"},
        { value: "indiferente", label: "Me es igual",    icon: "Compass"  },
      ]
      const existing = new Set(validatedOptions.map(o => o.value))
      const toAdd = extras.filter(e => !existing.has(e.value))
      return { ...q, options: [...validatedOptions, ...toAdd].slice(0, Math.max(4, validatedOptions.length)) }
    }

    async function loadAiQuestions() {
      // ── 1. Intentar cargar desde caché ──
      try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (raw) {
          const cached: { ts: number; questions: AiQuestion[] } = JSON.parse(raw)
          const age = Date.now() - cached.ts
          if (age < CACHE_TTL && cached.questions.length >= 10) {
            const withMinOptions = cached.questions.map(ensureMinOptions)
            setAiQuestions(withMinOptions)
            setOllamaStatus("connected")
            setLoadingQuestions(false)
            return
          }
        }
      } catch {
        // caché corrupto — ignorar y regenerar
        localStorage.removeItem(CACHE_KEY)
      }

      // ── 2. Verificar si Ollama está disponible ──
      try {
        const healthRes = await fetch("/api/ollama", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const health = await healthRes.json()
        if (health.status !== "connected") {
          setOllamaStatus("offline")
          setLoadingQuestions(false)
          return
        }
        setOllamaStatus("connected")
      } catch {
        setOllamaStatus("offline")
        setLoadingQuestions(false)
        return
      }

      // ── 3. Generar preguntas en lotes, guardando progreso ──
      const allQuestions: AiQuestion[] = []
      const batchSize = 5
      const batches: string[][] = []

      for (let i = 0; i < AI_CATEGORIES.length; i += batchSize) {
        batches.push(AI_CATEGORIES.slice(i, i + batchSize))
      }

      for (let b = 0; b < batches.length; b++) {
        try {
          const res = await fetch("/api/ollama", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              action: "generate_questions_batch",
              categories: batches[b],
            }),
          })

          if (res.ok) {
            const data = await res.json()
            if (data.questions && Array.isArray(data.questions)) {
              // Aplicar mínimo de 4 opciones en cada pregunta recibida
              const fixed = (data.questions as AiQuestion[]).map(ensureMinOptions)
              allQuestions.push(...fixed)
            }
          }
        } catch {
          // Si falla un lote, continuamos con los demás
        }

        setLoadingProgress(Math.round(((b + 1) / batches.length) * 100))
      }

      if (allQuestions.length >= 10) {
        setAiQuestions(allQuestions)
        // Guardar en caché para las próximas 24h
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), questions: allQuestions }))
        } catch {
          // localStorage lleno — ignorar
        }
      }
      setLoadingQuestions(false)
    }

    loadAiQuestions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // ── Selección de respuestas ──
  const handleSelect = useCallback(
    (value: string) => {
      const q = currentQuestion
      if (q.type === "single") {
        setAnswers((prev) => ({ ...prev, [q.id]: value }))
      } else {
        const current = (answers[q.id] as string[]) || []
        if (current.includes(value)) {
          setAnswers((prev) => ({ ...prev, [q.id]: current.filter((v) => v !== value) }))
        } else if (!q.maxSelections || current.length < q.maxSelections) {
          setAnswers((prev) => ({ ...prev, [q.id]: [...current, value] }))
        }
      }
    },
    [answers, currentQuestion]
  )

  const isOptionSelected = (value: string) => {
    if (currentQuestion.type === "single") return currentAnswer === value
    return Array.isArray(currentAnswer) && currentAnswer.includes(value)
  }

  const canProceed = () => {
    if (currentQuestion.type === "single") return !!currentAnswer
    return Array.isArray(currentAnswer) && currentAnswer.length > 0
  }

  // ── Envío del test ──
  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
      return
    }

    setSubmitting(true)
    setError("")

    try {
      // Convertir las respuestas de preguntas IA (IDs dinámicos) al formato esperado
      const formattedAnswers: Record<string, string | string[]> = {}

      if (usingAI) {
        // Las preguntas de IA tienen IDs basados en la categoría
        for (const q of aiQuestions) {
          const ans = answers[q.id]
          if (ans !== undefined) {
            // Mapear categoría al campo que espera el backend
            formattedAnswers[q.category] = ans
          }
        }
      } else {
        // Preguntas estáticas: usar mapeo directo
        formattedAnswers.climate = answers.climate as string
        formattedAnswers.budget = answers.budget as string
        formattedAnswers.duration = answers.duration as string
        formattedAnswers.interests = (answers.interests as string[]) || []
        formattedAnswers.travelStyle = answers.travelStyle as string
        formattedAnswers.continent = answers.continent as string
        formattedAnswers.activities = (answers.activities as string[]) || []
        formattedAnswers.food = answers.food as string
        formattedAnswers.accommodation = answers.accommodation as string
        formattedAnswers.companion = answers.companion as string
        formattedAnswers.safety = answers.safety as string
        formattedAnswers.language = answers.language as string
        formattedAnswers.season = answers.season as string
        formattedAnswers.nightlife = answers.nightlife as string
        formattedAnswers.natureType = answers.natureType as string
        formattedAnswers.cultureType = answers.cultureType as string
        formattedAnswers.adventureLevel = answers.adventureLevel as string
        formattedAnswers.transport = answers.transport as string
        formattedAnswers.connectivity = answers.connectivity as string
        formattedAnswers.photography = answers.photography as string
        formattedAnswers.crowdPreference = answers.crowdPreference as string
        formattedAnswers.shopping = answers.shopping as string
        formattedAnswers.sustainability = answers.sustainability as string
        formattedAnswers.waterActivities = answers.waterActivities as string
      }

      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: formattedAnswers,
          weights,
        }),
      })

      if (!res.ok) throw new Error("Error al obtener recomendaciones")

      const data = await res.json()
      sessionStorage.setItem("wanderia_results", JSON.stringify(data))
      router.push("/results")
    } catch {
      setError("Error al generar recomendaciones. Inténtalo de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }

  // ── Pantalla de carga de preguntas ──
  if (loadingQuestions) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground">
              <Brain className="h-8 w-8 animate-pulse text-background" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {ollamaStatus === "checking"
                  ? "Conectando con la IA..."
                  : "Generando preguntas personalizadas..."}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {ollamaStatus === "connected"
                  ? loadingProgress === 0
                    ? "Cargando preguntas guardadas..."
                    : "Ollama está creando un test único para ti"
                  : "Verificando disponibilidad de Ollama"}
              </p>
            </div>
            {ollamaStatus === "connected" && loadingProgress > 0 && (
              <div className="w-64">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Generando preguntas</span>
                  <span>{loadingProgress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-500"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // ── Test principal ──
  const q = currentQuestion as AiQuestion

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Indicador de fuente de preguntas */}
          {ollamaStatus === "offline" && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Ollama no disponible — usando preguntas estándar</span>
            </div>
          )}
          {usingAI && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-foreground" />
                <span>Preguntas generadas por IA · en caché 24h</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("wanderia_ai_questions_v2")
                  window.location.reload()
                }}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                title="Borrar caché y regenerar preguntas"
              >
                <RotateCcw className="h-3 w-3" />
                Regenerar
              </button>
            </div>
          )}

          {/* Header con progreso */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Pregunta {currentStep + 1} de {totalSteps}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
              <WeightsConfigButton />
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-10 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Pregunta */}
          <h2 className="mb-8 text-center text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl text-balance">
            {q.question}
          </h2>

          {/* Opciones */}
          <div
            className={cn(
              "mx-auto grid gap-3",
              q.options.length <= 4
                ? "max-w-lg grid-cols-2 sm:grid-cols-4"
                : q.options.length === 5
                ? "max-w-xl grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
                : "max-w-xl grid-cols-2 sm:grid-cols-3"
            )}
          >
            {usingAI
              ? (q as AiQuestion).options.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    iconName={opt.icon}
                    isSelected={isOptionSelected(opt.value)}
                    onSelect={() => handleSelect(opt.value)}
                  />
                ))
              : (currentQuestion as typeof testQuestions[0]).options.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    IconComponent={opt.icon}
                    isSelected={isOptionSelected(opt.value)}
                    onSelect={() => handleSelect(opt.value)}
                  />
                ))}
          </div>

          {q.type === "multiple" && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Selecciona hasta {q.maxSelections} opciones
            </p>
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Navegación */}
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                currentStep === 0
                  ? "cursor-not-allowed text-muted-foreground/40"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed() || submitting}
              className={cn(
                "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                canProceed() && !submitting
                  ? "bg-foreground text-background hover:opacity-90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : currentStep === totalSteps - 1 ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Ver Resultados
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <WeightsConfigPanel />
    </div>
  )
}

export default function TestPage() {
  return (
    <ProtectedRoute>
      <TestContent />
    </ProtectedRoute>
  )
}
