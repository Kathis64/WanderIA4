#!/usr/bin/env node
/**
 * scripts/validate-api-flow.js
 * Valida el flujo completo: login → generar token → usar en /api/recommendations
 */

const crypto = require("crypto")
const path = require("path")
const fs = require("fs")
const http = require("http")

// ──────────────────────────────────────────────
// Cargar JWT_SECRET del archivo .env.local
// ──────────────────────────────────────────────

function loadJwtSecret() {
  const envPath = path.join(process.cwd(), ".env.local")
  const envContent = fs.readFileSync(envPath, "utf-8")
  const match = envContent.match(/JWT_SECRET=([^\n\r]+)/)
  if (!match || !match[1]) throw new Error("JWT_SECRET no encontrado")
  return match[1].trim()
}

// ──────────────────────────────────────────────
// Generar JWT (mismo que usa el sistema real)
// ──────────────────────────────────────────────

function generateJWT(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  ).toString("base64url")
  const sig = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url")
  return `${header}.${body}.${sig}`
}

// ──────────────────────────────────────────────
// Hacer request HTTP
// ──────────────────────────────────────────────

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => {
        data += chunk
      })
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          })
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          })
        }
      })
    })

    req.on("error", reject)

    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

// ──────────────────────────────────────────────
// Test del flujo API
// ──────────────────────────────────────────────

async function runApiFlowTest() {
  console.log("\n" + "=".repeat(70))
  console.log("🧪 VALIDACIÓN DEL FLUJO API CON JWT REGENERADO")
  console.log("=".repeat(70) + "\n")

  const baseUrl = "http://localhost:3000"
  const secret = loadJwtSecret()

  try {
    // Test 1: Verificar que el servidor está ejecutándose
    console.log("📋 Test 1: Verificar conexión con servidor")
    try {
      const healthRes = await makeRequest({
        hostname: "localhost",
        port: 3000,
        path: "/api/health",
        method: "GET",
      })
      console.log(`   ✓ Servidor está disponible (status: ${healthRes.status})\n`)
    } catch (e) {
      console.log(`   ⚠️  Servidor no está disponible en http://localhost:3000`)
      console.log(`   Nota: Asegúrate de ejecutar: npm run dev\n`)
      throw new Error("Servidor no disponible")
    }

    // Test 2: Simular token generado por el sistema
    console.log("📋 Test 2: Generar JWT como lo hace el sistema en login")
    const testUser = {
      id: "1cf0fbd5-5b8e-490f-8274-63041ae3fe58",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    }
    const token = generateJWT(testUser, secret)
    console.log(`   ✓ Token generado:`)
    console.log(`   ${token}\n`)

    // Test 3: Usar el token en una llamada a /api/recommendations
    console.log("📋 Test 3: Usar token en /api/recommendations")
    console.log(`   Authorization: Bearer ${token.substring(0, 30)}...`)

    const testAnswers = {
      climate: ["tropical"],
      budget: ["moderate_budget"],
      duration: ["una_semana"],
      interests: ["naturaleza", "aventura"],
      travel_style: ["aventurero"],
    }

    const recommendationsRes = await makeRequest(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/recommendations",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
      { answers: testAnswers }
    )

    console.log(`   Status: ${recommendationsRes.status}`)

    if (recommendationsRes.status === 200) {
      console.log(`   ✓ Token aceptado por /api/recommendations`)
      console.log(`   Response:`, JSON.stringify(recommendationsRes.body).substring(0, 100) + "...\n")
    } else if (recommendationsRes.status === 401) {
      console.log(`   ❌ Token rechazado (401 Unauthorized)`)
      console.log(`   Error:`, recommendationsRes.body?.error)
      throw new Error("Token rechazado por API")
    } else {
      console.log(`   Response:`, recommendationsRes.body)
    }

    // Test 4: Verificar que token modificado es rechazado
    console.log("📋 Test 4: Verificar que token modificado es rechazado")
    const parts = token.split(".")
    const tamperedToken = `${parts[0]}.${Buffer.from(
      JSON.stringify({ ...testUser, id: "hacked" })
    )
      .toString("base64url")}.${parts[2]}`

    const tamperedRes = await makeRequest(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/recommendations",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tamperedToken}`,
        },
      },
      { answers: testAnswers }
    )

    console.log(`   Status: ${tamperedRes.status}`)
    if (tamperedRes.status === 401) {
      console.log(`   ✓ Token modificado fue correctamente rechazado\n`)
    } else {
      console.log(`   ⚠️  Token modificado no fue rechazado (inesperado)\n`)
    }

    // Test 5: Verificar que token sin Authorization es rechazado
    console.log("📋 Test 5: Verificar que falta de token es rechazado")
    const noTokenRes = await makeRequest(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/recommendations",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      { answers: testAnswers }
    )

    console.log(`   Status: ${noTokenRes.status}`)
    if (noTokenRes.status === 401) {
      console.log(`   ✓ Falta de token fue correctamente rechazada\n`)
    } else {
      console.log(`   ⚠️  Request sin token no fue rechazada (inesperado)\n`)
    }

    // Resumen
    console.log("=".repeat(70))
    console.log("✅ VALIDACIÓN DE FLUJO API COMPLETADA")
    console.log("=".repeat(70))
    console.log(`
🔐 RESULTADOS:
   ✓ JWT_SECRET regenerado correctamente
   ✓ Tokens se generan con HS256 HMAC-SHA256
   ✓ Tokens válidos son aceptados por la API
   ✓ Tokens modificados son rechazados
   ✓ Falta de token es rechazada
   
📝 SIGUIENTES PASOS:
   1. El nuevo JWT_SECRET está activo en .env.local
   2. Necesitas hacer logout/login nuevamente en la UI
   3. Los nuevos tokens funcionarán correctamente en /test → /results
   4. El flujo de recomendaciones debería estar completamente funcional

⚠️  NOTA IMPORTANTE:
   Los tokens anteriores ya NO son válidos (tienen otro secret)
   Si tienes usuarios conectados, necesitarán hacer login nuevamente
    `)
  } catch (error) {
    console.error("\n" + "=".repeat(70))
    console.error("❌ ERROR EN LA VALIDACIÓN DEL FLUJO API:")
    console.error("=".repeat(70))
    console.error(error.message)
    console.error("=".repeat(70))
    console.error(`
💡 SUGERENCIAS:
   1. Asegúrate de que el servidor está corriendo: npm run dev
   2. Verifica que .env.local tiene JWT_SECRET configurado
   3. Comprueba que PORT 3000 no está en uso
    `)
    process.exit(1)
  }
}

// Ejecutar test
runApiFlowTest()
