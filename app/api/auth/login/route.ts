import { NextRequest, NextResponse } from "next/server"
import { authenticateUser, generateJWT } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son requeridos" },
        { status: 400 }
      )
    }

    const user = authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      )
    }

    const token = generateJWT({ id: user.id, email: user.email, name: user.name, role: user.role })

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      message: "Inicio de sesión exitoso",
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("[WanderIA] Login error:", message)

    // Dar pista si better-sqlite3 no está instalado
    if (message.includes("better-sqlite3") || message.includes("Cannot find module")) {
      return NextResponse.json(
        { error: "Base de datos no disponible. Ejecuta: pnpm add better-sqlite3" },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
