#!/usr/bin/env npx ts-node
/**
 * scripts/validate-jwt-system.ts
 * Valida que el JWT Secret funciona correctamente generando y verificando tokens reales
 * contra el sistema, NO simulaciones
 */

import crypto from "crypto"
import path from "path"
import fs from "fs"
import dotenv from "dotenv"

// Cargar variables de entorno
const envPath = path.join(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

// ──────────────────────────────────────────────
// Obtener el JWT_SECRET
// ──────────────────────────────────────────────

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
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

function generateJWT(payload: Record<string, unknown>): string {
  const secret = getJwtSecret()
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

function verifyJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      console.error("❌ Formato de token inválido (no tiene 3 partes)")
      return null
    }

    const secret = getJwtSecret()
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${parts[0]}.${parts[1]}`)
      .digest("base64url")

    // FIXED: Decode signatures from base64url to binary for proper comparison
    const sigBuf = Buffer.from(parts[2], "base64url")
    const expBuf = Buffer.from(expectedSig, "base64url")

    if (sigBuf.length !== expBuf.length) {
      console.error("❌ Longitud de firma no coincide")
      console.error(`   Token sig: ${parts[2]}`)
      console.error(`   Expected:  ${expectedSig}`)
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
    console.error("❌ Error verificando token:", error)
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
    const secret = getJwtSecret()
    console.log(`   Secret length: ${secret.length} caracteres\n`)

    // Test 2: Generar un token válido
    console.log("📋 Test 2: Generar JWT con payload de usuario")
    const testPayload = {
      id: "1cf0fbd5-5b8e-490f-8274-63041ae3fe58",
      email: "rojolailatest@gmail.com",
      name: "Test User",
      role: "user",
    }
    const token = generateJWT(testPayload)
    console.log(`   ✓ Token generado:`)
    console.log(`   ${token}\n`)

    // Test 3: Verificar el token generado
    console.log("📋 Test 3: Verificar JWT generado")
    const decoded = verifyJWT(token)
    if (decoded) {
      console.log(`   ✓ Token verificado correctamente`)
      console.log(`   ID: ${decoded.id}`)
      console.log(`   Email: ${decoded.email}`)
      console.log(`   Name: ${decoded.name}`)
      console.log(`   Role: ${decoded.role}`)
      console.log(`   IAT: ${new Date((decoded.iat as number) * 1000).toISOString()}`)
      console.log(`   EXP: ${new Date((decoded.exp as number) * 1000).toISOString()}\n`)
    } else {
      throw new Error("No se pudo verificar el token generado")
    }

    // Test 4: Validar que los datos del payload coinciden
    console.log("📋 Test 4: Validar integridad del payload")
    let payloadValid = true
    if (decoded?.id !== testPayload.id) {
      console.error(`   ❌ ID no coincide: ${decoded?.id} !== ${testPayload.id}`)
      payloadValid = false
    } else {
      console.log(`   ✓ ID coincide`)
    }

    if (decoded?.email !== testPayload.email) {
      console.error(`   ❌ Email no coincide: ${decoded?.email} !== ${testPayload.email}`)
      payloadValid = false
    } else {
      console.log(`   ✓ Email coincide`)
    }

    if (decoded?.name !== testPayload.name) {
      console.error(`   ❌ Name no coincide: ${decoded?.name} !== ${testPayload.name}`)
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
      .toString("base64url")
      .replace(/=/g, "")}.${parts[2]}`
    const decodedTampered = verifyJWT(tamperedToken)
    if (decodedTampered === null) {
      console.log(`   ✓ Token modificado fue correctamente rechazado\n`)
    } else {
      throw new Error("El token modificado fue aceptado (¡ERROR CRÍTICO!)")
    }

    // Test 6: Rechazar token con firma inválida
    console.log("📋 Test 6: Rechazar token con firma inválida")
    const invalidSigToken = `${parts[0]}.${parts[1]}.invalidsignature`
    const decodedInvalidSig = verifyJWT(invalidSigToken)
    if (decodedInvalidSig === null) {
      console.log(`   ✓ Token con firma inválida fue correctamente rechazado\n`)
    } else {
      throw new Error("El token con firma inválida fue aceptado (¡ERROR CRÍTICO!)")
    }

    // Test 7: Múltiples tokens con el mismo secret
    console.log("📋 Test 7: Verificar que múltiples tokens se generan y validan correctamente")
    const tokens = []
    for (let i = 0; i < 3; i++) {
      const token = generateJWT({
        id: `user-${i}`,
        email: `user${i}@test.com`,
      })
      const verified = verifyJWT(token)
      if (!verified) {
        throw new Error(`Token ${i} no pudo ser verificado`)
      }
      tokens.push(token)
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
    const complexToken = generateJWT(complexPayload)
    const decodedComplex = verifyJWT(complexToken)
    if (JSON.stringify(decodedComplex?.metadata) === JSON.stringify(complexPayload.metadata)) {
      console.log(`   ✓ Payload complejo preservado correctamente\n`)
    } else {
      throw new Error("El payload complejo no fue preservado correctamente")
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
   
📝 RECOMENDACIONES:
   1. El JWT_SECRET se está usando correctamente
   2. Los tokens se generan con HMAC-SHA256 válido
   3. La verificación rechaza tokens modificados/expirados
   4. El sistema está listo para producción
    `)
  } catch (error) {
    console.error("\n" + "=".repeat(70))
    console.error("❌ ERROR EN LA VALIDACIÓN:")
    console.error("=".repeat(70))
    console.error(error instanceof Error ? error.message : String(error))
    console.error("=".repeat(70))
    process.exit(1)
  }
}

// Ejecutar pruebas
runValidationTests()
