import { NextRequest, NextResponse } from "next/server"
import { verifyJWT, getUserById, authenticateUser } from "@/lib/database"
import path from "path"
import fs from "fs"
import crypto from "crypto"

// ──────────────────────────────────────────────
// Hash de contraseñas — SHA-256 + salt aleatorio
// ──────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.createHash("sha256").update(salt + password).digest("hex")
  return `sha256$${salt}$${hash}`
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split("$")
    if (parts.length !== 3 || parts[0] !== "sha256") return false
    const [, salt, hash] = parts
    const computed = crypto.createHash("sha256").update(salt + password).digest("hex")
    return computed === hash
  } catch {
    return false
  }
}

// ──────────────────────────────────────────────
// Conexión SQLite (mejor-sqlite3)
// ──────────────────────────────────────────────

function getDb() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3")

  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = path.join(dataDir, "wanderia.db")
  return new Database(dbPath)
}

export async function POST(request: NextRequest) {
  try {
    // Verificar token JWT
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const payload = verifyJWT(token)
    if (!payload || typeof payload.id !== "string") {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validar que ambas contraseñas estén presentes
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Contraseña actual y nueva son requeridas" },
        { status: 400 }
      )
    }

    // Validar longitud mínima de la nueva contraseña
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Validar que no sean iguales
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña no puede ser igual a la actual" },
        { status: 400 }
      )
    }

    const db = getDb()

    try {
      // Obtener el usuario actual
      const user = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(payload.id) as any

      if (!user) {
        db.close()
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      // Verificar que la contraseña actual sea correcta
      if (!verifyPassword(currentPassword, user.password_hash)) {
        db.close()
        return NextResponse.json(
          { error: "La contraseña actual es incorrecta" },
          { status: 401 }
        )
      }

      // Generar hash de la nueva contraseña
      const newPasswordHash = hashPassword(newPassword)

      // Actualizar la contraseña en la base de datos
      db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(
        newPasswordHash,
        new Date().toISOString(),
        payload.id
      )

      db.close()

      return NextResponse.json(
        {
          success: true,
          message: "Contraseña cambiada exitosamente",
        },
        { status: 200 }
      )
    } catch (err) {
      db.close()
      throw err
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("[WanderIA] Change password error:", message)

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
