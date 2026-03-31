import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAnthropicClient } from "@/lib/anthropic";
import { SYSTEM_PROMPT } from "./system-prompt";

interface SuggestRequestBody {
  exercise: string;
  machineType: string;
  nearby: string[];
  workoutDay: string;
  previousSuggestions: string[];
}

export async function POST(request: NextRequest) {
  // Check if AI feature is enabled
  if (process.env.NEXT_PUBLIC_FEATURE_AI_SUGGESTIONS !== "true") {
    return NextResponse.json(
      { error: "AI suggestions feature is not enabled" },
      { status: 404 }
    );
  }

  // Check auth
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: SuggestRequestBody = await request.json();
    const { exercise, machineType, nearby, workoutDay, previousSuggestions } =
      body;

    const userMessage = `I'm currently at the ${machineType} doing ${exercise} on ${workoutDay} day.

Nearby equipment: ${nearby.join(", ")}

${previousSuggestions.length > 0 ? `Previously suggested (avoid repeating): ${previousSuggestions.join(", ")}` : "No previous suggestions yet."}

Suggest ONE complement exercise I can do without leaving this area.`;

    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    // Extract text content from the response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    const suggestion = JSON.parse(textBlock.text);
    return NextResponse.json(suggestion);
  } catch (error) {
    console.error("AI suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
