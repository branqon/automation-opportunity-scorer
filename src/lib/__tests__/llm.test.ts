import { describe, expect, it } from "vitest";
import { extractApiCredentials } from "@/lib/llm";

describe("extractApiCredentials", () => {
  it("extracts valid anthropic credentials", () => {
    const headers = new Headers({
      "x-api-key": "sk-ant-test-key",
      "x-ai-provider": "anthropic",
    });

    const result = extractApiCredentials(headers);

    expect(result.provider).toBe("anthropic");
    expect(result.apiKey).toBe("sk-ant-test-key");
  });

  it("extracts valid openai credentials", () => {
    const headers = new Headers({
      "x-api-key": "sk-openai-test-key",
      "x-ai-provider": "openai",
    });

    const result = extractApiCredentials(headers);

    expect(result.provider).toBe("openai");
    expect(result.apiKey).toBe("sk-openai-test-key");
  });

  it("throws when api key is missing", () => {
    const headers = new Headers({
      "x-ai-provider": "anthropic",
    });

    expect(() => extractApiCredentials(headers)).toThrow(
      "Missing x-api-key header",
    );
  });

  it("throws when provider is missing", () => {
    const headers = new Headers({
      "x-api-key": "sk-test-key",
    });

    expect(() => extractApiCredentials(headers)).toThrow(
      "Missing or invalid x-ai-provider header",
    );
  });

  it("throws when provider is invalid", () => {
    const headers = new Headers({
      "x-api-key": "sk-test-key",
      "x-ai-provider": "gemini",
    });

    expect(() => extractApiCredentials(headers)).toThrow(
      "Missing or invalid x-ai-provider header",
    );
  });
});
