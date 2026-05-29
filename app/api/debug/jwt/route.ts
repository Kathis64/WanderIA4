import { NextRequest, NextResponse } from "next/server"
import { generateJWT, verifyJWT } from "@/lib/database"

/**
 * API de diagnóstico para verificar que el sistema JWT funciona correctamente.
 * 
 * GET: Genera un token de prueba, lo verifica y retorna los resultados
 * POST: Verifica un token existente pasado en el Authorization header
 */

export async function GET() {
  try {
    const jwtSecret = process.env.JWT_SECRET
    const secretInfo = jwtSecret 
      ? `Configured (${jwtSecret.length} chars)` 
      : "NOT SET - Using fallback"

    // Generar un token de prueba
    const testPayload = {
      id: "test-user-id-12345",
      email: "test@wanderia.com",
      name: "Test User",
      role: "user",
    }
    
    const generatedToken = generateJWT(testPayload)
    
    // Verificar el token recién generado
    const verifiedPayload = verifyJWT(generatedToken)
    
    const isValid = verifiedPayload !== null
    const payloadMatches = verifiedPayload && 
      verifiedPayload.id === testPayload.id &&
      verifiedPayload.email === testPayload.email &&
      verifiedPayload.name === testPayload.name

    return NextResponse.json({
      success: true,
      diagnostics: {
        jwt_secret_status: secretInfo,
        token_generated: true,
        token_verified: isValid,
        payload_matches: payloadMatches,
        token_preview: `${generatedToken.substring(0, 50)}...`,
        verified_payload: verifiedPayload ? {
          id: verifiedPayload.id,
          email: verifiedPayload.email,
          name: verifiedPayload.name,
          role: verifiedPayload.role,
          iat: verifiedPayload.iat,
          exp: verifiedPayload.exp,
        } : null,
      },
      test_result: isValid && payloadMatches ? "✅ JWT SYSTEM WORKING" : "❌ JWT SYSTEM BROKEN",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      test_result: "❌ JWT SYSTEM ERROR",
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        success: false,
        error: "Missing or invalid Authorization header",
        expected_format: "Authorization: Bearer <token>",
      }, { status: 400 })
    }
    
    const token = authHeader.split(" ")[1]
    const jwtSecret = process.env.JWT_SECRET
    const secretInfo = jwtSecret 
      ? `Configured (${jwtSecret.length} chars)` 
      : "NOT SET - Using fallback"
    
    // Log the token parts for debugging
    const parts = token.split(".")
    console.log("[JWT Debug] Token parts:", parts.length)
    console.log("[JWT Debug] Header (base64url):", parts[0])
    console.log("[JWT Debug] Payload (base64url):", parts[1])
    console.log("[JWT Debug] Signature (base64url):", parts[2])
    
    // Decode header and payload for inspection
    let decodedHeader = null
    let decodedPayload = null
    
    try {
      decodedHeader = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"))
    } catch {
      console.log("[JWT Debug] Failed to decode header")
    }
    
    try {
      decodedPayload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))
    } catch {
      console.log("[JWT Debug] Failed to decode payload")
    }
    
    // Try to verify the token
    const verifiedPayload = verifyJWT(token)
    
    return NextResponse.json({
      success: verifiedPayload !== null,
      jwt_secret_status: secretInfo,
      token_parts: parts.length,
      decoded_header: decodedHeader,
      decoded_payload: decodedPayload,
      signature_valid: verifiedPayload !== null,
      verified_payload: verifiedPayload,
      test_result: verifiedPayload !== null 
        ? "✅ TOKEN VALID" 
        : "❌ TOKEN INVALID - Signature mismatch or expired",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}
