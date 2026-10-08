import { createOpenAI } from "@ai-sdk/openai";

export interface AiProviderConfig {
  activeProvider: "openrouter" | "runpod" | "hybrid_fallback";
  openRouterApiKey?: string;
  runpodEndpointUrl?: string;
  runpodApiKey?: string;
  runpodModelName?: string;
}

export interface ModelDefinition {
  id: string;
  name: string;
  provider: "openrouter" | "runpod";
  category: "general" | "reasoning" | "speed" | "creative" | "dedicated";
  badge: string;
  supportsReasoning: boolean;
  costEstimate: string;
}

export const AVAILABLE_MODELS: ModelDefinition[] = [
  // CLAUDE
  {
    id: "anthropic/claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet (Raciocínio & Direção Híbrida)",
    provider: "openrouter",
    category: "reasoning",
    badge: "Principal",
    supportsReasoning: true,
    costEstimate: "~1 crédito / 2.5k tokens",
  },
  {
    id: "anthropic/claude-3.5-haiku",
    name: "Claude 3.5 Haiku (Velocidade & Diálogos Ágeis)",
    provider: "openrouter",
    category: "speed",
    badge: "Ágil",
    supportsReasoning: false,
    costEstimate: "~1 crédito / 10k tokens",
  },

  // CHATGPT / OPENAI
  {
    id: "openai/gpt-4o",
    name: "GPT-4o (Versátil & Multimodal de Elite)",
    provider: "openrouter",
    category: "general",
    badge: "Versátil",
    supportsReasoning: false,
    costEstimate: "~1 crédito / 4k tokens",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini (Ultrarrápido & Econômico)",
    provider: "openrouter",
    category: "speed",
    badge: "Econômico",
    supportsReasoning: false,
    costEstimate: "~1 crédito / 20k tokens",
  },
  {
    id: "openai/o3-mini",
    name: "o3-mini (Raciocínio Lógico & Engenharia)",
    provider: "openrouter",
    category: "reasoning",
    badge: "Raciocínio",
    supportsReasoning: true,
    costEstimate: "~1 crédito / 5k tokens",
  },

  // GEMINI
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash (Ultrarrápido & Multimodal)",
    provider: "openrouter",
    category: "speed",
    badge: "Velocidade",
    supportsReasoning: false,
    costEstimate: "~1 crédito / 15k tokens",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro (Análise Profunda & Longo Contexto)",
    provider: "openrouter",
    category: "reasoning",
    badge: "Profundo",
    supportsReasoning: true,
    costEstimate: "~1 crédito / 3k tokens",
  },

  // QWEN
  {
    id: "qwen/qwen-2.5-72b-instruct",
    name: "Qwen 2.5 72B (Roteiros, Diálogos & Narrativa)",
    provider: "openrouter",
    category: "creative",
    badge: "Narrativa",
    supportsReasoning: false,
    costEstimate: "~1 crédito / 10k tokens",
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct",
    name: "Qwen 2.5 Coder 32B (Código, Shaders & Pipeline)",
    provider: "openrouter",
    category: "creative",
    badge: "Código",
    supportsReasoning: false,
    costEstimate: "~1 crédito / 12k tokens",
  },
  {
    id: "qwen/qwq-32b",
    name: "QwQ 32B (Raciocínio Aberto & Pensamento)",
    provider: "openrouter",
    category: "reasoning",
    badge: "Raciocínio",
    supportsReasoning: true,
    costEstimate: "~1 crédito / 10k tokens",
  },

  // GEMMA
  {
    id: "google/gemma-2-27b-it",
    name: "Gemma 2 27B (Lógica Refinada & Texto Preciso)",
    provider: "openrouter",
    category: "general",
    badge: "Gemma 2",
    supportsReasoning: false,
    costEstimate: "~1 crédito / 10k tokens",
  },
  {
    id: "google/gemma-2-9b-it",
    name: "Gemma 2 9B (Respostas Instantâneas & Leve)",
    provider: "openrouter",
    category: "speed",
    badge: "Ultraleve",
    supportsReasoning: false,
    costEstimate: "~1 crédito / 25k tokens",
  },

  // DEEPSEEK
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1 (Cinema Mind Profundo & CoT)",
    provider: "openrouter",
    category: "reasoning",
    badge: "Raciocínio",
    supportsReasoning: true,
    costEstimate: "~1 crédito / 2.5k tokens",
  },

  // RUNPOD
  {
    id: "runpod/dedicated-vllm",
    name: "Instância de Processamento RunPod (vLLM Node)",
    provider: "runpod",
    category: "dedicated",
    badge: "Nó Dedicado",
    supportsReasoning: true,
    costEstimate: "Taxa fixa de infraestrutura",
  },
];

/**
 * Cria o cliente de inferência OpenRouter configurado com headers de estúdio
 */
export function getOpenRouterClient(apiKeyOverride?: string) {
  const apiKey =
    apiKeyOverride ||
    process.env.OPENROUTER_API_KEY ||
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
    "";

  return createOpenAI({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    headers: {
      "HTTP-Referer": "https://kriativa.app",
      "X-Title": "Kriativa Muse Creative Studio",
    },
  });
}

/**
 * Cria o cliente para nó auto-hospedado no RunPod com endpoint compatível OpenAI vLLM
 */
export function getRunPodClient(endpointUrl?: string, apiKeyOverride?: string) {
  const url =
    endpointUrl ||
    process.env.RUNPOD_ENDPOINT_URL ||
    "https://api.runpod.ai/v2/default/openai/v1";

  const apiKey =
    apiKeyOverride ||
    process.env.RUNPOD_API_KEY ||
    "runpod-default-token";

  return createOpenAI({
    name: "runpod",
    baseURL: url,
    apiKey,
  });
}

/**
 * Retorna a instância do modelo do Language Model Vercel AI SDK
 */
export function resolveAiLanguageModel(options: {
  provider: "openrouter" | "runpod" | "hybrid_fallback";
  modelName: string;
  config?: AiProviderConfig;
}) {
  const { provider, modelName, config } = options;

  // Rota RunPod direta ou nós dedicados
  if (provider === "runpod" || modelName.startsWith("runpod/")) {
    const runpodClient = getRunPodClient(
      config?.runpodEndpointUrl,
      config?.runpodApiKey
    );
    const cleanModel = modelName.replace(/^runpod\//, "").trim();
    // Se o nome for o genérico "dedicated-vllm" ou vazio, usa o configurado no painel
    const targetModel =
      cleanModel && cleanModel !== "dedicated-vllm" && cleanModel !== "runpod"
        ? cleanModel
        : config?.runpodModelName || "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";

    return runpodClient(targetModel);
  }

  // Rota padrão OpenRouter
  const openRouterClient = getOpenRouterClient(config?.openRouterApiKey);
  const targetOpenRouterModel =
    modelName === "runpod/dedicated-vllm"
      ? "anthropic/claude-3.7-sonnet"
      : modelName || "anthropic/claude-3.7-sonnet";

  return openRouterClient(targetOpenRouterModel);
}
