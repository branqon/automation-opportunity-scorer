"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { LLMProvider } from "@/lib/llm";

type ApiKeyState = {
  anthropicKey: string;
  openaiKey: string;
  provider: LLMProvider;
  isConfigured: boolean;
  activeKey: string;
  setAnthropicKey: (key: string) => void;
  setOpenaiKey: (key: string) => void;
  setProvider: (provider: LLMProvider) => void;
};

const ApiKeyContext = createContext<ApiKeyState | null>(null);

export function useApiKeys() {
  const context = useContext(ApiKeyContext);
  if (!context)
    throw new Error("useApiKeys must be used within ApiKeyProvider");
  return context;
}

const STORAGE_KEYS = {
  anthropicKey: "aos-anthropic-key",
  openaiKey: "aos-openai-key",
  provider: "aos-provider",
} as const;

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [anthropicKey, setAnthropicKeyState] = useState("");
  const [openaiKey, setOpenaiKeyState] = useState("");
  const [provider, setProviderState] = useState<LLMProvider>("anthropic");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedAnthropicKey =
      localStorage.getItem(STORAGE_KEYS.anthropicKey) ?? "";
    const storedOpenaiKey =
      localStorage.getItem(STORAGE_KEYS.openaiKey) ?? "";
    const storedProvider =
      (localStorage.getItem(STORAGE_KEYS.provider) as LLMProvider) || "anthropic";

    setAnthropicKeyState(storedAnthropicKey);
    setOpenaiKeyState(storedOpenaiKey);
    setProviderState(storedProvider);
    setMounted(true);
  }, []);

  const setAnthropicKey = useCallback((key: string) => {
    setAnthropicKeyState(key);
    localStorage.setItem(STORAGE_KEYS.anthropicKey, key);
  }, []);

  const setOpenaiKey = useCallback((key: string) => {
    setOpenaiKeyState(key);
    localStorage.setItem(STORAGE_KEYS.openaiKey, key);
  }, []);

  const setProvider = useCallback((p: LLMProvider) => {
    setProviderState(p);
    localStorage.setItem(STORAGE_KEYS.provider, p);
  }, []);

  const activeKey = provider === "anthropic" ? anthropicKey : openaiKey;
  const isConfigured = mounted && activeKey.length > 0;

  const value: ApiKeyState = {
    anthropicKey,
    openaiKey,
    provider,
    isConfigured,
    activeKey,
    setAnthropicKey,
    setOpenaiKey,
    setProvider,
  };

  return <ApiKeyContext value={value}>{children}</ApiKeyContext>;
}
