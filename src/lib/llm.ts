import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type LLMProvider = "anthropic" | "openai";

type LLMRequest = {
  provider: LLMProvider;
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
};

type LLMResponse = {
  content: string;
  provider: LLMProvider;
  model: string;
};

async function callAnthropic(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<LLMResponse> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Anthropic response");
  }
  return { content: textBlock.text, provider: "anthropic", model: response.model };
}

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<LLMResponse> {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenAI response");
  }
  return { content, provider: "openai", model: response.model };
}

export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const maxTokens = request.maxTokens ?? 2048;
  if (request.provider === "anthropic") {
    return callAnthropic(request.apiKey, request.systemPrompt, request.userPrompt, maxTokens);
  }
  return callOpenAI(request.apiKey, request.systemPrompt, request.userPrompt, maxTokens);
}

export function extractApiCredentials(headers: Headers): {
  provider: LLMProvider;
  apiKey: string;
} {
  const apiKey = headers.get("x-api-key");
  const provider = headers.get("x-ai-provider") as LLMProvider | null;
  if (!apiKey) {
    throw new Error("Missing x-api-key header");
  }
  if (!provider || !["anthropic", "openai"].includes(provider)) {
    throw new Error(
      "Missing or invalid x-ai-provider header (must be 'anthropic' or 'openai')",
    );
  }
  return { provider, apiKey };
}
