"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";
import { useApiKeys } from "@/components/providers/api-key-provider";
import type { LLMProvider } from "@/lib/llm";

type ConnectionStatus = "idle" | "testing" | "success" | "error";

export function SettingsModal() {
  const {
    anthropicKey,
    openaiKey,
    provider,
    setAnthropicKey,
    setOpenaiKey,
    setProvider,
    activeKey,
  } = useApiKeys();

  const [open, setOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  async function testConnection() {
    if (!activeKey) {
      setConnectionStatus("error");
      setStatusMessage("Please enter an API key first.");
      return;
    }

    setConnectionStatus("testing");
    setStatusMessage("Testing connection...");

    try {
      const response = await fetch("/api/ai/analyze-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": activeKey,
          "x-ai-provider": provider,
        },
        body: JSON.stringify({
          description:
            "Test connection: a simple manual data entry process where employees copy information from emails into a spreadsheet each morning, taking about 30 minutes per day.",
        }),
      });

      if (response.ok) {
        setConnectionStatus("success");
        setStatusMessage("Connection successful! API key is valid.");
      } else {
        const data = await response.json();
        setConnectionStatus("error");
        setStatusMessage(data.error ?? "Connection failed.");
      }
    } catch {
      setConnectionStatus("error");
      setStatusMessage("Network error. Could not reach the API.");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-line/70 bg-surface px-3 py-1.5 text-xs text-muted-foreground transition hover:border-accent hover:text-foreground"
      >
        <Settings className="h-3.5 w-3.5" />
        AI Settings
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="relative mx-4 w-full max-w-lg rounded-card border border-line/80 bg-surface/95 p-6 shadow-card backdrop-blur">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition hover:bg-surface-subtle hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="font-display text-lg font-semibold text-foreground">
              AI Configuration
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure your LLM provider and API keys for AI-powered analysis.
            </p>

            <div className="mt-6 flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Provider
                <select
                  className="min-h-11 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-foreground outline-none ring-0 transition focus:border-accent focus-visible:border-accent"
                  value={provider}
                  onChange={(e) =>
                    setProvider(e.target.value as LLMProvider)
                  }
                >
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT-4o)</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Anthropic API Key
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  className="min-h-11 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-foreground outline-none ring-0 transition placeholder:text-muted-foreground/50 focus:border-accent focus-visible:border-accent"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                OpenAI API Key
                <input
                  type="password"
                  placeholder="sk-..."
                  className="min-h-11 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-foreground outline-none ring-0 transition placeholder:text-muted-foreground/50 focus:border-accent focus-visible:border-accent"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
              </label>

              <div className="flex flex-col gap-3">
                <button
                  onClick={testConnection}
                  disabled={connectionStatus === "testing"}
                  className="min-h-11 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-60"
                >
                  {connectionStatus === "testing"
                    ? "Testing..."
                    : "Test Connection"}
                </button>

                {connectionStatus !== "idle" && (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      connectionStatus === "success"
                        ? "border-accent/40 bg-accent-soft/50 text-accent-strong"
                        : connectionStatus === "error"
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-line bg-surface-subtle text-muted-foreground"
                    }`}
                  >
                    {statusMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
