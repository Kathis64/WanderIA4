import { NextRequest, NextResponse } from "next/server"
import {
  verifyJWT,
  isUserAdmin,
  getDestinationById,
  updateDestination,
  deleteDestination,
  toggleDestinationActive,
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

// GET /api/admin/destinations/[id] - Get single destination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = verifyAdminAccess(request)
    if (!access.valid) {
      return NextResponse.json(
        { error: access.error },
        { status: access.error?.includes("administrador") ? 403 : 401 }
      )
    }

    const { id } = await params
    const destination = getDestinationById(id)

    if (!destination) {
      return NextResponse.json(
        { error: "Destino no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      destination,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("[WanderIA Admin] Get destination error:", message)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/destinations/[id] - Update destination
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = verifyAdminAccess(request)
    if (!access.valid) {
      return NextResponse.json(
        { error: access.error },
        { status: access.error?.includes("administrador") ? 403 : 401 }
      )
    }

    const { id } = await params
    const existing = getDestinationById(id)

    if (!existing) {
      return NextResponse.json(
        { error: "Destino no encontrado" },
        { status: 404 }
      )
    }

    const body = await request.json()

    // If name is being changed, check for conflicts
    if (body.name && body.name !== existing.name) {
      const nameConflict = getDestinationByName(body.name)
      if (nameConflict) {
        return NextResponse.json(
          { error: `Ya existe otro destino con el nombre "${body.name}"` },
          { status: 409 }
        )
      }
    }

    const updated = updateDestination(id, body)

    if (!updated) {
      return NextResponse.json(
        { error: "Error al actualizar el destino" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      destination: updated,
      message: "Destino actualizado exitosamente",
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("[WanderIA Admin] Update destination error:", message)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/destinations/[id] - Delete destination
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = verifyAdminAccess(request)
    if (!access.valid) {
      return NextResponse.json(
        { error: access.error },
        { status: access.error?.includes("administrador") ? 403 : 401 }
      )
    }

    const { id } = await params
    const existing = getDestinationById(id)

    if (!existing) {
      return NextResponse.json(
        { error: "Destino no encontrado" },
        { status: 404 }
      )
    }

    const deleted = deleteDestination(id)

    if (!deleted) {
      return NextResponse.json(
        { error: "Error al eliminar el destino" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Destino "${existing.name}" eliminado exitosamente`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("[WanderIA Admin] Delete destination error:", message)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/destinations/[id] - Toggle active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = verifyAdminAccess(request)
    if (!access.valid) {
      return NextResponse.json(
        { error: access.error },
        { status: access.error?.includes("administrador") ? 403 : 401 }
      )
    }

    const { id } = await params
    const toggled = toggleDestinationActive(id)

    if (!toggled) {
      return NextResponse.json(
        { error: "Destino no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      destination: toggled,
      message: toggled.is_active ? "Destino activado" : "Destino desactivado",
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("[WanderIA Admin] Toggle destination error:", message)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
