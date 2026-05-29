import { NextRequest, NextResponse } from "next/server"
import sqlite3 from "sqlite3"
import path from "path"

// Obtener la ruta de la base de datos
const dbPath = path.join(process.cwd(), "data", "wanderia.db")

// Helper para obtener conexión a BD
function getDb() {
  return new sqlite3.Database(dbPath)
}

// Helper para obtener un registro
function getRecord(db: sqlite3.Database, query: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = body

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token y email requeridos" },
        { status: 400 }
      )
    }

    const db = getDb()

    // Buscar el token en la base de datos
    const tokenRecord = await getRecord(
      db,
      "SELECT * FROM password_reset_tokens WHERE token = ? AND user_id = (SELECT id FROM users WHERE email = ?) AND used = 0 AND expires_at > ?",
      [token, email, new Date().toISOString()]
    )

    db.close()

    if (tokenRecord) {
      return NextResponse.json({ valid: true }, { status: 200 })
    } else {
      return NextResponse.json(
        { valid: false, error: "Token inválido o expirado" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("[VERIFY TOKEN] Error:", error)
    return NextResponse.json({ valid: false, error: "Error verificando token" }, { status: 500 })
  }
}
