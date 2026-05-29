import { NextRequest, NextResponse } from "next/server"
import {
  verifyJWT,
  isUserAdmin,
  getAllDestinations,
  createDestination,
  getDestinationByName,
} from "@/lib/database"

// Middleware to verify admin access
function verifyAdminAccess(request: NextRequest): { valid: boolean; userId?: string; error?: string } {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, error: "Token de autorización requerido" }
  }

  const token = authHeader.substring(7)
  const payload = verifyJWT(token)

  if (!payload || typeof payload.id !== "string") {
    return { valid: false, error: "Token inválido o expirado" }
  }

  if (!isUserAdmin(payload.id)) {
    return { valid: false, error: "Acceso denegado. Se requiere rol de administrador" }
  }

  return { valid: true, userId: payload.id }
}

// GET /api/admin/destinations - Get all destinations
export async function GET(request: NextRequest) {
  try {
    const access = verifyAdminAccess(request)
    if (!access.valid) {
      return NextResponse.json(
        { error: access.error },
        { status: access.error?.includes("administrador") ? 403 : 401 }
      )
    }

    const destinations = getAllDestinations()

    return NextResponse.json({
      success: true,
      destinations,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("[WanderIA Admin] Get destinations error:", message)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST /api/admin/destinations - Create new destination
export async function POST(request: NextRequest) {
  try {
    const access = verifyAdminAccess(request)
    if (!access.valid) {
      return NextResponse.json(
        { error: access.error },
        { status: access.error?.includes("administrador") ? 403 : 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      country,
      description,
      culture,
      gastronomy,
      climate_spring,
      climate_summer,
      climate_autumn,
      climate_winter,
      climate_best_season,
      cost_min,
      cost_max,
      cost_currency,
      budget_level,
      image_query,
      tips,
      tags_climate,
      tags_safety,
      tags_language,
      tags_seasons,
      tags_nightlife,
      tags_nature,
      tags_culture,
      tags_adventure,
      tags_connectivity,
      tags_transport,
      is_active,
    } = body

    // Validate required fields
    if (!name || !country || !description || !culture || !gastronomy) {
      return NextResponse.json(
        { error: "Campos requeridos: nombre, país, descripción, cultura, gastronomía" },
        { status: 400 }
      )
    }

    // Check if destination already exists
    const existing = getDestinationByName(name)
    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un destino con el nombre "${name}". Use la función de edición para modificarlo.` },
        { status: 409 }
      )
    }

    const destination = createDestination({
      name,
      country,
      description,
      culture,
      gastronomy,
      climate_spring: climate_spring || "",
      climate_summer: climate_summer || "",
      climate_autumn: climate_autumn || "",
      climate_winter: climate_winter || "",
      climate_best_season: climate_best_season || "",
      cost_min: cost_min || 0,
      cost_max: cost_max || 0,
      cost_currency: cost_currency || "USD",
      budget_level: budget_level || 2,
      image_query: image_query || "",
      tips: tips || "",
      tags_climate: tags_climate || "",
      tags_safety: tags_safety || "",
      tags_language: tags_language || "",
      tags_seasons: tags_seasons || "",
      tags_nightlife: tags_nightlife || "",
      tags_nature: tags_nature || "",
      tags_culture: tags_culture || "",
      tags_adventure: tags_adventure || "",
      tags_connectivity: tags_connectivity || "",
      tags_transport: tags_transport || "",
      is_active: is_active !== undefined ? is_active : 1,
    })

    if (!destination) {
      return NextResponse.json(
        { error: "Error al crear el destino" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      destination,
      message: "Destino creado exitosamente",
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("[WanderIA Admin] Create destination error:", message)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
