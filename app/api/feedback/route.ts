import { NextRequest, NextResponse } from "next/server"
import {
  verifyJWT,
  createRecommendationFeedback,
  getFeedbackByUser,
  getFeedbackBySession,
  updateRecommendationFeedback,
  removeFeedback,
} from "@/lib/database"

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}

// GET: List feedback for a session or user
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
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    let feedback
    if (sessionId) {
      feedback = getFeedbackBySession(sessionId)
    } else {
      feedback = getFeedbackByUser(userId)
    }

    return NextResponse.json({
      success: true,
      feedback,
      count: feedback.length,
    })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    )
  }
}

// POST: Create feedback for a recommendation
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
    const {
      session_id,
      recommendation_id,
      destination_name,
      destination_country,
      feedback_text,
      sentiment = "neutral",
      helpful_score = 5,
    } = body

    if (
      !session_id ||
      !recommendation_id ||
      !destination_name ||
      !destination_country ||
      !feedback_text
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields: session_id, recommendation_id, destination_name, destination_country, feedback_text",
        },
        { status: 400 }
      )
    }

    if (!["positive", "neutral", "negative"].includes(sentiment)) {
      return NextResponse.json(
        { error: "Sentiment must be one of: positive, neutral, negative" },
        { status: 400 }
      )
    }

    if (helpful_score < 0 || helpful_score > 10) {
      return NextResponse.json(
        { error: "helpful_score must be between 0 and 10" },
        { status: 400 }
      )
    }

    const feedback = createRecommendationFeedback(
      session_id,
      recommendation_id,
      userId,
      destination_name,
      destination_country,
      feedback_text,
      sentiment,
      helpful_score
    )

    if (!feedback) {
      return NextResponse.json(
        { error: "Failed to create feedback" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Feedback created",
        feedback,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating feedback:", error)
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    )
  }
}

// PATCH: Update feedback
export async function PATCH(request: NextRequest) {
  try {
    const token = extractToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const feedbackId = searchParams.get("id")

    if (!feedbackId) {
      return NextResponse.json(
        { error: "Missing feedback id parameter" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { feedback_text, sentiment, helpful_score } = body

    const updated = updateRecommendationFeedback(
      feedbackId,
      feedback_text,
      sentiment,
      helpful_score
    )

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update feedback" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Feedback updated",
      feedback: updated,
    })
  } catch (error) {
    console.error("Error updating feedback:", error)
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    )
  }
}

// DELETE: Remove feedback
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

    const { searchParams } = new URL(request.url)
    const feedbackId = searchParams.get("id")

    if (!feedbackId) {
      return NextResponse.json(
        { error: "Missing feedback id parameter" },
        { status: 400 }
      )
    }

    const success = removeFeedback(feedbackId)
    if (!success) {
      return NextResponse.json(
        { error: "Failed to remove feedback" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Feedback removed",
    })
  } catch (error) {
    console.error("Error deleting feedback:", error)
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    )
  }
}
