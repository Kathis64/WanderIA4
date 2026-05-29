import { NextRequest, NextResponse } from "next/server"
import { verifyJWT, createFavorite, getFavoritesByUser, removeFavorite, updateFavorite, isFavorite } from "@/lib/database"

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}

// GET: List user's favorite destinations
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.id as string
    const favorites = getFavoritesByUser(userId)

    return NextResponse.json({
      success: true,
      favorites,
      count: favorites.length,
    })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    )
  }
}

// POST: Add or update a favorite destination
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.id as string
    const body = await request.json()
    const { destination_name, destination_country, rating = 5 } = body

    if (!destination_name || !destination_country) {
      return NextResponse.json(
        { error: "Missing required fields: destination_name, destination_country" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Check if already exists
    if (isFavorite(userId, destination_name)) {
      // Need to get the favorite ID first to update it
      const favorites = getFavoritesByUser(userId)
      const existing = favorites.find(f => f.destination_name === destination_name)
      
      if (!existing) {
        // Shouldn't happen, but fallback
        const favorite = createFavorite(userId, destination_name, destination_country, rating)
        return NextResponse.json(
          {
            success: true,
            message: "Favorite added",
            favorite,
          },
          { status: 201 }
        )
      }

      const updated = updateFavorite(existing.id, rating)
      if (!updated) {
        return NextResponse.json(
          { error: "Failed to update favorite" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Favorite updated",
        favorite: updated,
      })
    } else {
      // Create new
      const favorite = createFavorite(userId, destination_name, destination_country, rating)
      if (!favorite) {
        return NextResponse.json(
          { error: "Failed to create favorite" },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          message: "Favorite added",
          favorite,
        },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error("Error adding favorite:", error)
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    )
  }
}

// DELETE: Remove a favorite destination
export async function DELETE(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.id as string
    const { searchParams } = new URL(request.url)
    const destinationName = searchParams.get("destination_name")

    if (!destinationName) {
      return NextResponse.json(
        { error: "Missing destination_name parameter" },
        { status: 400 }
      )
    }

    const success = removeFavorite(userId, destinationName)
    if (!success) {
      return NextResponse.json(
        { error: "Failed to remove favorite" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Favorite removed",
    })
  } catch (error) {
    console.error("Error deleting favorite:", error)
    return NextResponse.json(
      { error: "Failed to delete favorite" },
      { status: 500 }
    )
  }
}
