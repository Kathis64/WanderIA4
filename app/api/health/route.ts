import { NextResponse } from "next/server"

// Health check endpoint for Docker/Kubernetes
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "WanderIA",
    version: "1.0.0",
  })
}
