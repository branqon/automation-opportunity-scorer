import { NextRequest, NextResponse } from "next/server";
import { callLLM, extractApiCredentials } from "@/lib/llm";
import { ANALYZE_PROCESS_SYSTEM_PROMPT } from "@/lib/ai-prompts";

export async function POST(request: NextRequest) {
  let provider, apiKey;
  try {
    ({ provider, apiKey } = extractApiCredentials(request.headers));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid credentials" },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const description = body.description;
  if (
    typeof description !== "string" ||
    description.trim().length < 20
  ) {
    return NextResponse.json(
      { error: "Description must be at least 20 characters" },
      { status: 400 },
    );
  }

  try {
    const response = await callLLM({
      provider,
      apiKey,
      systemPrompt: ANALYZE_PROCESS_SYSTEM_PROMPT,
      userPrompt: description.trim(),
      maxTokens: 2048,
    });

    const analysis = JSON.parse(response.content);

    return NextResponse.json({
      analysis,
      meta: {
        provider: response.provider,
        model: response.model,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to analyze process",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
