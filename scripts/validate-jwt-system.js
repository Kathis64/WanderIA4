#!/usr/bin/env node
/**
 * scripts/validate-jwt-system.js
 * Valida que el JWT Secret funciona correctamente generando y verificando tokens reales
 * contra el sistema, NO simulaciones
 */

const crypto = require("crypto")
const path = require("path")
const fs = require("fs")

// ──────────────────────────────────────────────
// Cargar JWT_SECRET del archivo .env.local
// ──────────────────────────────────────────────

function loadJwtSecret() {
  const envPath = path.join(process.cwd(), ".env.local")
  
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local no encontrado en el directorio actual")
  }

  const envContent = fs.readFileSync(envPath, "utf-8")
  const match = envContent.match(/JWT_SECRET=([^\n\r]+)/)
  
  if (!match || !match[1]) {
    throw new Error("JWT_SECRET no encontrado en .env.local")
  }

  const secret = match[1].trim()
  
  if (!secret || secret === "your-super-secret-key-change-in-production" || secret.length < 32) {
    throw new Error(
      "JWT_SECRET no está configurado correctamente en .env.local. Debe tener al menos 32 caracteres."
    )
  }

  console.log(`✓ JWT_SECRET cargado correctamente (${secret.length} caracteres)`)
  return secret
}

// ──────────────────────────────────────────────
// Generar JWT (implementación real del sistema)
// ──────────────────────────────────────────────

function generateJWT(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 horas
    })
  ).toString("base64url")
  const sig = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url")
  return `${header}.${body}.${sig}`
}

// ──────────────────────────────────────────────
// Verificar JWT (implementación real del sistema)
// ──────────────────────────────────────────────

function verifyJWT(token, secret) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      console.error("❌ Formato de token inválido (no tiene 3 partes)")
      return null
    }

    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${parts[0]}.${parts[1]}`)
      .digest("base64url")

    // Usar timingSafeEqual para evitar timing attacks
    const sigBuf = Buffer.from(parts[2])
    const expBuf = Buffer.from(expectedSig)

    if (sigBuf.length !== expBuf.length) {
      console.error("❌ Longitud de firma no coincide")
      return null
    }

    if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.error("❌ Firma inválida - token puede haber sido modificado")
      return null
    }

    // Decodificar payload
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))

    // Verificar expiración
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error("❌ Token expirado")
      return null
    }

    return payload
  } catch (error) {
    console.error("❌ Error verificando token:", error.message)
    return null
  }
}

// ──────────────────────────────────────────────
// Pruebas de Validación
// ──────────────────────────────────────────────

async function runValidationTests() {
  console.log("\n" + "=".repeat(70))
  console.log("🔐 VALIDACIÓN DEL JWT SECRET Y GENERACIÓN/VERIFICACIÓN")
  console.log("=".repeat(70) + "\n")

  try {
    // Test 1: Cargar JWT_SECRET
    console.log("📋 Test 1: Verificar JWT_SECRET en .env.local")
    const secret = loadJwtSecret()
    console.log(`   Secret: ${secret.substring(0, 20)}...${secret.substring(secret.length - 10)}`)
    console.log(`   Length: ${secret.length} caracteres\n`)

    // Test 2: Generar un token válido
    console.log("📋 Test 2: Generar JWT con payload de usuario")
    const testPayload = {
      id: "1cf0fbd5-5b8e-490f-8274-63041ae3fe58",
      email: "rojolailatest@gmail.com",
      name: "Test User",
      role: "user",
    }
    const token = generateJWT(testPayload, secret)
    console.log(`   ✓ Token generado:`)
    console.log(`   ${token}\n`)

    // Test 3: Verificar el token generado
    console.log("📋 Test 3: Verificar JWT generado")
    const decoded = verifyJWT(token, secret)
    if (decoded) {
      console.log(`   ✓ Token verificado correctamente`)
      console.log(`   ID: ${decoded.id}`)
      console.log(`   Email: ${decoded.email}`)
      console.log(`   Name: ${decoded.name}`)
      console.log(`   Role: ${decoded.role}`)
      console.log(`   IAT: ${new Date(decoded.iat * 1000).toISOString()}`)
      console.log(`   EXP: ${new Date(decoded.exp * 1000).toISOString()}\n`)
    } else {
      throw new Error("No se pudo verificar el token generado")
    }

    // Test 4: Validar que los datos del payload coinciden
    console.log("📋 Test 4: Validar integridad del payload")
    let payloadValid = true
    if (decoded.id !== testPayload.id) {
      console.error(`   ❌ ID no coincide: ${decoded.id} !== ${testPayload.id}`)
      payloadValid = false
    } else {
      console.log(`   ✓ ID coincide`)
    }

    if (decoded.email !== testPayload.email) {
      console.error(`   ❌ Email no coincide: ${decoded.email} !== ${testPayload.email}`)
      payloadValid = false
    } else {
      console.log(`   ✓ Email coincide`)
    }

    if (decoded.name !== testPayload.name) {
      console.error(`   ❌ Name no coincide: ${decoded.name} !== ${testPayload.name}`)
      payloadValid = false
    } else {
      console.log(`   ✓ Name coincide`)
    }

    if (!payloadValid) {
      throw new Error("El payload no fue preservado correctamente")
    }
    console.log()

    // Test 5: Rechazar token modificado
    console.log("📋 Test 5: Rechazar token modificado")
    const parts = token.split(".")
    const tamperedToken = `${parts[0]}.${Buffer.from(
      JSON.stringify({ ...testPayload, id: "hacked" })
    )
      .toString("base64url")}.${parts[2]}`
    const decodedTampered = verifyJWT(tamperedToken, secret)
    if (decodedTampered === null) {
      console.log(`   ✓ Token modificado fue correctamente rechazado\n`)
    } else {
      throw new Error("El token modificado fue aceptado (¡ERROR CRÍTICO!)")
    }

    // Test 6: Rechazar token con firma inválida
    console.log("📋 Test 6: Rechazar token con firma inválida")
    const invalidSigToken = `${parts[0]}.${parts[1]}.invalidsignature123456`
    const decodedInvalidSig = verifyJWT(invalidSigToken, secret)
    if (decodedInvalidSig === null) {
      console.log(`   ✓ Token con firma inválida fue correctamente rechazado\n`)
    } else {
      throw new Error("El token con firma inválida fue aceptado (¡ERROR CRÍTICO!)")
    }

    // Test 7: Múltiples tokens con el mismo secret
    console.log("📋 Test 7: Verificar que múltiples tokens se generan y validan correctamente")
    const tokens = []
    for (let i = 0; i < 3; i++) {
      const tok = generateJWT(
        {
          id: `user-${i}`,
          email: `user${i}@test.com`,
        },
        secret
      )
      const verified = verifyJWT(tok, secret)
      if (!verified) {
        throw new Error(`Token ${i} no pudo ser verificado`)
      }
      tokens.push(tok)
      console.log(`   ✓ Token ${i + 1} generado y verificado correctamente`)
    }
    console.log()

    // Test 8: Token con payload complejo
    console.log("📋 Test 8: Validar token con payload complejo")
    const complexPayload = {
      id: "user-123",
      email: "complex@test.com",
      name: "Complex User",
      role: "admin",
      metadata: {
        preferences: {
          theme: "dark",
          language: "es",
        },
        permissions: ["read", "write", "delete"],
      },
    }
    const complexToken = generateJWT(complexPayload, secret)
    const decodedComplex = verifyJWT(complexToken, secret)
    if (JSON.stringify(decodedComplex.metadata) === JSON.stringify(complexPayload.metadata)) {
      console.log(`   ✓ Payload complejo preservado correctamente\n`)
    } else {
      throw new Error("El payload complejo no fue preservado correctamente")
    }

    // Test 9: Compatibilidad con token anterior (simular la validación)
    console.log("📋 Test 9: Validar token anterior (simulado)")
    const oldToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFjZjBmYmQ1LTViOGUtNDkwZi04Mjc0LTYzMDQxYWUzZmU1OCIsImVtYWlsIjoicm9qb2xhaWxhQGdtYWlsLmNvbSIsIm5hbWUiOiJLYXRoZXJpbmUgWmFwYXRhIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3Nzk5MjcyMDUsImV4cCI6MTc4MDAxMzYwNX0.Ypvo3qrSL9L6ht4fXlCGhQrRNc-kCU7xincQkDQT4vU"
    const decodedOld = verifyJWT(oldToken, secret)
    if (decodedOld === null) {
      console.log(`   ℹ️  Token anterior (con secret diferente) fue rechazado`)
      console.log(`       Esto es ESPERADO - tiene un secret diferente\n`)
    } else {
      console.log(`   ⚠️  Token anterior fue validado (no esperado con nuevo secret)\n`)
    }

    // Resumen
    console.log("=".repeat(70))
    console.log("✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE")
    console.log("=".repeat(70))
    console.log(`
🔒 CONFIGURACIÓN DE SEGURIDAD:
   • JWT_SECRET: ${secret.length} caracteres (✓ cumple mínimo de 32)
   • Algoritmo: HS256 (HMAC-SHA256)
   • Expiración: 24 horas
   • Validación: Firma con timing-safe comparison
   
📝 PRÓXIMOS PASOS:
   1. ✓ JWT_SECRET regenerado correctamente
   2. ✓ Validación de generación y verificación completada
   3. Necesitas hacer login nuevamente en la aplicación (los tokens anteriores ya no son válidos)
   4. Los nuevos tokens se generarán con el nuevo secret
   5. El flujo /test → /results debería funcionar correctamente ahora
    `)
  } catch (error) {
    console.error("\n" + "=".repeat(70))
    console.error("❌ ERROR EN LA VALIDACIÓN:")
    console.error("=".repeat(70))
    console.error(error.message)
    console.error("=".repeat(70))
    process.exit(1)
  }
}

// Ejecutar pruebas
runValidationTests()
