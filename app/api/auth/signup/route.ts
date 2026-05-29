import { NextRequest, NextResponse } from "next/server"
import { createUser, isAdult, generateJWT } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, birthDate } = body

    if (!name || !email || !password || !birthDate) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    // Validar si es mayor de 18 años
    if (!isAdult(birthDate)) {
      return NextResponse.json(
        { error: "Debes ser mayor de 18 años para registrarte" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Correo electrónico inválido" },
        { status: 400 }
      )
    }

    const user = createUser(name, email, password, birthDate)

    if (!user) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 409 }
      )
    }

    const token = generateJWT({ id: user.id, email: user.email, name: user.name, role: user.role })

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      message: "Registro exitoso",
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("[WanderIA] Signup error:", message)

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
