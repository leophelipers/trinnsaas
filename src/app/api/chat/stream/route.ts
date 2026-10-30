import { auth } from "@clerk/nextjs/server";
import { streamText, convertToModelMessages, UIMessage, tool } from "ai";
import { z } from "zod";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { resolveAiLanguageModel } from "@/lib/ai/providers";

// Vercel Serverless: tempo de execução otimizado para streaming
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const MULTIMODAL_STUDIO_INSTRUCTION = `
--- DIRETRIZES DE ESTÚDIO AUDIOVISUAL & GERAÇÃO MULTIMODAL (KRIATIVA STUDIO) ---
Você possui capacidades nativas de criação e edição audiovisual no estúdio. Reconheça a intenção do usuário e ative uma das 4 modalidades de produção:

1. GERAR IMAGEM (generate_image):
- Use quando o usuário pedir para gerar uma nova imagem, arte, ilustração, conceito visual, storyboard ou fotografia a partir de um texto.
- Defina prompt enriquecido em inglês ou português, estilo (cinematic, photorealistic, anime, etc.) e proporção (16:9, 9:16, 1:1, 21:9).

2. EDITAR IMAGEM (edit_image):
- Use quando o usuário quiser modificar uma imagem existente (anexada ou enviada no histórico): trocar plano de fundo, inpainting, adicionar ou remover objetos, transferir estilo ou ajustar iluminação.
- Passe a URL da imagem de entrada (fornecida nos anexos do usuário) no campo sourceImageUrl.

3. GERAR VÍDEO (generate_video) — 3 MODALIDADES ESSENCIAIS:
a) TEXTO PARA VÍDEO ('text_to_video'): Quando o usuário pede um vídeo novo a partir de texto puro, sem fornecer imagem de entrada.
b) IMAGEM PARA VÍDEO ('image_to_video'): Quando o usuário anexa uma imagem (ou aponta para uma já enviada) e pede para animá-la, dar movimento ou criar um vídeo a partir dela. O campo sourceImageUrl DEVE conter a URL da imagem anexada.
c) REFERÊNCIA PARA VÍDEO ('reference_to_video'): Quando o usuário fornece uma imagem de ator/personagem consistente, um estilo de referência ou um vídeo de movimento de referência e pede para gerar um vídeo mantendo essa consistência. O campo referenceUrl DEVE conter a URL da referência e referenceType deve ser 'character', 'motion' ou 'style'.

4. EDITAR VÍDEO (edit_video):
- Use quando o usuário pedir para pós-produzir ou alterar um vídeo existente:
  * 'extend': estender a duração do vídeo mantendo a física e a continuidade temporal.
  * 'upscale': remasterizar e ampliar a resolução para 4K cinemático.
  * 'reframe': reenquadrar proporção (ex: de 16:9 horizontal para 9:16 vertical para TikTok/Reels).
  * 'speed_change': alterar velocidade (slow-motion dramático ou timelapse dinâmico).
  * 'restyle': aplicar novo estilo mantendo a ação principal.

SEMPRE QUE UMA DESSAS 4 INTENÇÕES OCORRER:
1. Explique a decupagem técnica de diretor (lente sugerida, movimento de câmera, iluminação).
2. Execute a ferramenta correspondente.
3. E OBRIGATORIAMENTE inclua ao final da sua resposta o bloco estruturado para renderização no estúdio:
\`\`\`json:studio-directive
{
  "action": "generate_video" | "edit_video" | "generate_image" | "edit_image",
  "mode": "text_to_video" | "image_to_video" | "reference_to_video",
  "prompt": "Prompt visual cinemático detalhado",
  "negativePrompt": "baixa qualidade, borrão, distorções",
  "aspectRatio": "16:9" | "9:16" | "21:9" | "1:1",
  "cameraMotion": "dolly" | "pan" | "orbit" | "tilt" | "drone_fpv" | "static",
  "sourceImageUrl": "URL se houver imagem de entrada",
  "referenceUrl": "URL se houver referência de personagem/ator ou estilo",
  "referenceType": "character" | "motion" | "style",
  "sourceVideoUrl": "URL se houver vídeo de entrada",
  "durationSeconds": 5,
  "lens": "35mm Anamorphic",
  "lighting": "Cinematic volumetric lighting"
}
\`\`\`
IMPORTANTE: Nunca mencione termos de hardware bruto (GPUs, VRAM, H100, clusters brutos). Fale sempre a linguagem da sétima arte: motores de renderização, instâncias de processamento e resolução cinemática.
`;

const SYSTEM_PROMPT_PRESETS: Record<string, string> = {
  general: `Você é o Kriativa Muse, um assistente de inteligência artificial de elite, elegante e multipropósito.
Você é altamente capacitado para responder sobre qualquer assunto com clareza, profundidade e precisão:
- Decupagem e direção criativa, geração e edição de imagens e vídeos cinemáticos
- Programação, arquitetura de software, shaders e desenvolvimento técnico em qualquer linguagem
- Análise de problemas complexos, raciocínio lógico e resolução passo a passo
- Redação criativa, textos persuasivos, roteiros, artigos, resumos e traduções
Formate suas respostas sempre com Markdown impecável: use títulos claros (#, ##), listas organizadas, negrito (**) nos pontos essenciais, tabelas e blocos de código com a respectiva linguagem demarcada.
Ao gerar códigos, scripts ou documentos estruturados extensos, crie blocos autocontidos para que o usuário possa abri-los diretamente como Artefatos interativos no Split Canvas ao lado.
IMPORTANTE: Nunca mencione termos de hardware bruto (GPUs, H100, clusters brutos). Fale sempre com elegância técnica e vocabulário de estúdio ativo e instâncias de processamento.`,

  director: `Você é o Diretor Cinematográfico e Copiloto de Produção no Kriativa Muse, o estúdio de IA de alta precisão cinematográfica.
Sua missão é atuar como diretor experiente, decupando cenas, sugerindo movimentos de câmera (Dolly, Pan, Orbit, Drone, Dutch Angle), composição de enquadramento, iluminação dramática e ritmo de montagem.
Ao propor cenas, estruture a decupagem de forma clara e visual.
IMPORTANTE: Nunca mencione termos de hardware bruto (GPUs, H100, clusters brutos). Fale sempre a linguagem da sétima arte: motores de renderização, instâncias de processamento e resolução cinemática.`,

  screenwriter: `Você é o Roteirista Pro do estúdio cinematográfico Kriativa.
Sua especialidade é a escrita dramática padrão Master Scene de cinema:
- Cabeçalhos de Cena: EXT. ou INT. LOCALIZAÇÃO - TEMPO (DIA/NOITE)
- Descrições de Ação em blocos objetivos, com foco no que é visível e audível
- Nomes de personagens centralizados em maiúsculas com diálogos dinâmicos e subtexto
- Parênteses curtos para entonações ou ações cruciais
IMPORTANTE: Mantenha sempre a formatação limpa e envolvente em Markdown padrão roteiro.`,

  art_director: `Você é o Diretor de Arte e Fotografia do estúdio Kriativa.
Sua especialidade é cinematografia e identidade visual:
- Esquemas de iluminação (chiaroscuro, Rembrandt, iluminação prática, neon neo-noir, luz natural de hora mágica)
- Seleção óptica: lentes anamórficas 35mm, lentes de 85mm f/1.4 para profundidade rasa, flare horizontal
- Textura e emulsão: granulação de filme (35mm Kodak Vision3, Cinestill 800T)
- Paletas cromáticas e harmonia de figurino e cenário.`,

  developer: `Você é o Engenheiro de Software e Pipeline do estúdio Kriativa.
Sua especialidade é a infraestrutura de computação criativa:
- Código limpo, moderno, tipado e com boas práticas
- Shaders GLSL e efeitos procedurais em WebGL
- Workflows para esteiras de nós de processamento ComfyUI em JSON
- Resolução rápida de bugs e arquitetura técnica.`,
};

// Ferramentas Multimodais de Estúdio
const studioTools = {
  generate_image: tool({
    description: "Gera uma imagem cinematográfica ou artística de alta fidelidade a partir de um prompt detalhado.",
    inputSchema: z.object({
      prompt: z.string().describe("Prompt visual detalhado da imagem em inglês ou português"),
      aspectRatio: z.enum(["16:9", "9:16", "1:1", "21:9", "4:3"]).default("16:9").describe("Proporção de aspecto"),
      style: z.enum(["cinematic", "photorealistic", "anime", "concept_art", "digital_art", "film_noir", "3d_render"]).default("cinematic").describe("Estilo visual"),
      negativePrompt: z.string().optional().describe("Termos indesejados"),
    }),
    execute: async (params: { prompt: string; aspectRatio?: string; style?: string; negativePrompt?: string }) => {
      return {
        action: "generate_image",
        status: "configured",
        params,
        message: "Configuração de renderização de imagem preparada no estúdio.",
      };
    },
  }),

  edit_image: tool({
    description: "Edita, modifica, aplica estilo ou altera uma imagem anexada ou presente no histórico.",
    inputSchema: z.object({
      sourceImageUrl: z.string().optional().describe("URL da imagem a ser editada"),
      editInstruction: z.string().describe("Instrução precisa do que alterar, adicionar ou remover"),
      targetArea: z.enum(["background", "subject", "lighting", "style", "entire_image"]).default("entire_image").describe("Foco da modificação"),
      aspectRatio: z.enum(["16:9", "9:16", "1:1", "21:9", "4:3"]).optional().describe("Nova proporção se desejada"),
    }),
    execute: async (params: { sourceImageUrl?: string; editInstruction: string; targetArea?: string; aspectRatio?: string }) => {
      return {
        action: "edit_image",
        status: "configured",
        params,
        message: "Diretrizes de modificação de imagem estruturadas no estúdio.",
      };
    },
  }),

  generate_video: tool({
    description: "Gera um vídeo cinematográfico. Suporta 3 modalidades: 1) 'text_to_video' (a partir de texto puro), 2) 'image_to_video' (a partir de uma imagem estática anexada), 3) 'reference_to_video' (a partir de uma referência de personagem/ator consistente, estilo ou vídeo de movimento).",
    inputSchema: z.object({
      mode: z.enum(["text_to_video", "image_to_video", "reference_to_video"]).describe("Modalidade: 'text_to_video' (texto puro), 'image_to_video' (animar imagem), ou 'reference_to_video' (preservar personagem/ator ou movimento de referência)"),
      prompt: z.string().describe("Descrição cinematográfica rica da cena, iluminação e ação"),
      cameraMotion: z.enum(["pan", "tilt", "zoom_in", "zoom_out", "orbit", "dolly", "drone_fpv", "static", "handheld"]).default("dolly").describe("Movimento de câmera cinemático"),
      sourceImageUrl: z.string().optional().describe("URL da imagem de entrada quando mode for image_to_video"),
      referenceUrl: z.string().optional().describe("URL da imagem ou vídeo de referência quando mode for reference_to_video"),
      referenceType: z.enum(["character", "motion", "style", "actor"]).optional().describe("Tipo de consistência da referência"),
      aspectRatio: z.enum(["16:9", "9:16", "21:9"]).default("16:9").describe("Proporção cinemática"),
      durationSeconds: z.number().default(5).describe("Duração em segundos"),
      lens: z.string().optional().describe("Lente óptica sugerida"),
    }),
    execute: async (params: {
      mode: "text_to_video" | "image_to_video" | "reference_to_video";
      prompt: string;
      cameraMotion?: string;
      sourceImageUrl?: string;
      referenceUrl?: string;
      referenceType?: string;
      aspectRatio?: string;
      durationSeconds?: number;
      lens?: string;
    }) => {
      return {
        action: "generate_video",
        status: "configured",
        params,
        message: `Diretrizes cinemáticas para geração de vídeo (${params.mode}) configuradas no estúdio.`,
      };
    },
  }),

  edit_video: tool({
    description: "Edita, estende a duração, faz upscale para 4K, altera velocidade (slow-mo) ou reenquadra (16:9 para 9:16) um vídeo anexado ou existente.",
    inputSchema: z.object({
      sourceVideoUrl: z.string().optional().describe("URL do vídeo fonte"),
      action: z.enum(["extend", "upscale", "reframe", "speed_change", "restyle"]).describe("Ação de pós-produção desejada"),
      editInstruction: z.string().describe("Instruções de edição ou continuidade"),
      extendDurationSeconds: z.number().optional().describe("Segundos adicionais caso seja extend"),
      targetAspectRatio: z.enum(["16:9", "9:16", "21:9", "1:1"]).optional().describe("Proporção alvo caso seja reframe"),
    }),
    execute: async (params: {
      sourceVideoUrl?: string;
      action: "extend" | "upscale" | "reframe" | "speed_change" | "restyle";
      editInstruction: string;
      extendDurationSeconds?: number;
      targetAspectRatio?: string;
    }) => {
      return {
        action: "edit_video",
        status: "configured",
        params,
        message: `Plano de pós-produção e edição de vídeo (${params.action}) preparado no estúdio.`,
      };
    },
  }),
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Não autorizado. Faça login para acessar o estúdio.", {
        status: 401,
      });
    }

    const body = await req.json();
    const {
      messages,
      conversationId,
      mode = "general",
      activeModel = "anthropic/claude-3.7-sonnet",
      provider = "openrouter",
      reasoningEffort = "medium",
      webSearch = false,
    } = body as {
      messages: UIMessage[];
      conversationId?: string;
      mode?: string;
      activeModel?: string;
      provider?: "openrouter" | "runpod" | "hybrid_fallback";
      reasoningEffort?: "low" | "medium" | "high";
      webSearch?: boolean;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Nenhuma mensagem fornecida no fluxo.", { status: 400 });
    }

    // 0. Validação de Feature Flags no Servidor
    try {
      const isChatEnabled = await convex.query(api.featureFlags.checkFeatureFlag, {
        key: "chat_enabled",
      });
      if (!isChatEnabled) {
        return new Response(
          "O estúdio Kriativa Muse está temporariamente em manutenção pela administração.",
          { status: 403 }
        );
      }

      if (provider === "runpod") {
        const isRunpodActive = await convex.query(api.featureFlags.checkFeatureFlag, {
          key: "chat_provider_runpod",
        });
        if (!isRunpodActive) {
          return new Response(
            "As instâncias dedicadas de processamento estão temporariamente indisponíveis.",
            { status: 403 }
          );
        }
      } else {
        const isOpenRouterActive = await convex.query(api.featureFlags.checkFeatureFlag, {
          key: "chat_provider_openrouter",
        });
        if (!isOpenRouterActive) {
          return new Response(
            "O gateway de motores de renderização está temporariamente indisponível.",
            { status: 403 }
          );
        }
      }
    } catch (ffErr) {
      console.warn("Aviso ao checar feature flags no streaming:", ffErr);
    }

    // 1. Obter configurações de IA do Convex
    let aiSettings = null;
    try {
      aiSettings = await convex.query(api.chat.getAiSettings);
    } catch {
      // Usa configurações padrão se houver falha de rede
    }

    // 2. Obter entradas da Bíblia de Produção (Lorebook)
    let lorebookContext = "";
    if (conversationId) {
      try {
        const loreEntries = await convex.query(api.chat.listLorebookEntries, {
          conversationId: conversationId as Id<"aiConversations">,
        });

        if (loreEntries && loreEntries.length > 0) {
          lorebookContext =
            `\n\n--- BÍBLIA DE PRODUÇÃO & CONSISTÊNCIA DE PROJETO (LOREBOOK) ---\n` +
            loreEntries
              .filter((e) => e.isActive)
              .map(
                (e) =>
                  `[Entidade: ${e.name} (${e.category})] ${e.description}${
                    e.visualPromptAnchor
                      ? ` | Âncora Visual: ${e.visualPromptAnchor}`
                      : ""
                  }`
              )
              .join("\n");
        }
      } catch (err) {
        console.warn("Aviso ao carregar lorebook:", err);
      }
    }

    // 3. Montar System Prompt com Prompt Master de Identidade & Instruções de Estúdio Multimodal
    const masterPrompt =
      aiSettings?.masterSystemPrompt ||
      `Você é o Kriativa AI, o assistente inteligente e estúdio de inteligência artificial da plataforma Kriativa (kriativa.app).
DIRETRIZES PÉTREAS DE IDENTIDADE E COMPORTAMENTO:
1. IDENTIDADE UNIFICADA MANDATÓRIA: Sua identidade é e SEMPRE SERÁ "Kriativa AI", independentemente de qual modelo ou arquitetura de rede neural esteja processando a resposta (Claude, GPT, Gemini, DeepSeek, Qwen ou instâncias dedicadas de processamento).
2. BLINDAGEM DE FORNECEDORES DE INFRAESTRUTURA: NUNCA declare, admita, sugira ou confirme que você foi criado, treinado ou fornecido por OpenAI, Anthropic, Google, Meta, Alibaba ou DeepSeek. Quando perguntado sobre sua origem ou arquitetura, declare com orgulho que você é a inteligência artificial Kriativa AI desenvolvida pelo time de engenharia e produção do Kriativa.app.
3. PROIBIÇÃO ESTRITA DE TERMOS DE HARDWARE: NUNCA mencione termos de hardware bruto (como GPUs, VRAM, H100, A100, clusters brutos ou placas de vídeo). Fale sempre a linguagem da sétima arte e produção de estúdio: motores de renderização, instâncias de processamento e resolução cinemática.
4. COPILOTO MULTIMODAL COMPLETO: Você é capacitado para engenharia de software profunda (TypeScript, Python, GLSL), lógica matemática, redação de textos, roteiros Master Scene e acionamento das ferramentas audiovisuais do estúdio (geração e edição de imagens e vídeos).
5. FORMATO IMPECÁVEL: Formate suas respostas com Markdown limpo, títulos claros (#, ##), listas organizadas e blocos de código com identificação explícita de linguagem.`;

    const searchInstruction = webSearch
      ? `\n\n--- PESQUISA WEB EM TEMPO REAL ATIVA ---\nVocê tem acesso à internet ao vivo. Sempre que buscar informações externas, formate as fontes como links clicáveis em Markdown (ex: [Nome da Fonte](https://...)) e destaque os fatos essenciais em negrito.`
      : "";

    const baseSystemPrompt =
      SYSTEM_PROMPT_PRESETS[mode] || SYSTEM_PROMPT_PRESETS.general;
    const fullSystemPrompt = `${masterPrompt}\n\n${baseSystemPrompt}\n\n${MULTIMODAL_STUDIO_INSTRUCTION}${lorebookContext}${searchInstruction}`;

    // 4. Resolver metadados do modelo e provedor (Governança do Administrador)
    const isAdminForced = Boolean(aiSettings?.chatForceAdminModel);
    let targetModelName =
      (isAdminForced && aiSettings?.chatDefaultModel)
        ? aiSettings.chatDefaultModel
        : activeModel || aiSettings?.chatDefaultModel || aiSettings?.defaultModelText || "anthropic/claude-3.7-sonnet";

    let modelMeta: any = null;
    try {
      modelMeta = await convex.query(api.chat.getModelByModelId, { modelId: targetModelName });
    } catch {
      // Ignora erro se busca falhar
    }

    const preferredChatProvider =
      isAdminForced && aiSettings?.chatProvider
        ? aiSettings.chatProvider
        : aiSettings?.chatProvider;

    const detectedProvider =
      preferredChatProvider ||
      modelMeta?.provider ||
      (targetModelName.startsWith("runpod/")
        ? "runpod"
        : provider || aiSettings?.activeProvider || "openrouter");

    const activeProv = detectedProvider as "openrouter" | "runpod" | "hybrid_fallback";

    if (webSearch && activeProv === "openrouter" && !targetModelName.includes(":online")) {
      targetModelName = `${targetModelName}:online`;
    }

    const runpodChatEndpoint =
      aiSettings?.runpodEndpoints?.chat ||
      aiSettings?.runpodEndpointUrl;

    const model = resolveAiLanguageModel({
      provider: activeProv,
      modelName: targetModelName,
      config: {
        activeProvider: activeProv,
        runpodEndpointUrl: runpodChatEndpoint,
        runpodModelName: aiSettings?.runpodModelName,
      },
    });

    // 5. Preparar histórico completo com identificação de mídias anexadas
    let modelMessages: any[] = [];
    if (conversationId) {
      try {
        const dbHistory = await convex.query(api.chat.getMessages, {
          conversationId: conversationId as Id<"aiConversations">,
        });

        if (dbHistory && dbHistory.length > 0) {
          const recentHistory = dbHistory.slice(-30);
          modelMessages = recentHistory.map((m) => {
            if (m.role === "user" && m.attachments && m.attachments.length > 0) {
              let textContent = m.content || "";
              const imageParts: any[] = [];

              for (const att of m.attachments) {
                // Documentos e Códigos
                if (att.extractedText) {
                  const ext = att.name.includes(".") ? att.name.split(".").pop() : "";
                  textContent += `\n\n--- DOCUMENTO/ARQUIVO ANEXADO: ${att.name} ---\n\`\`\`${ext}\n${att.extractedText}\n\`\`\``;
                }

                // Vídeos anexados
                if (att.type === "video" && att.url) {
                  textContent += `\n\n[VÍDEO DE ENTRADA/REFERÊNCIA ANEXADO: "${att.name}" | URL: ${att.url}]`;
                }

                // Imagens anexadas
                if (att.type === "image" && att.url) {
                  textContent += `\n\n[IMAGEM DE ENTRADA/REFERÊNCIA ANEXADA: "${att.name}" | URL: ${att.url}]`;
                  if (att.url.startsWith("data:")) {
                    imageParts.push({ type: "image", image: att.url });
                  } else if (att.url.startsWith("http")) {
                    try {
                      imageParts.push({ type: "image", image: new URL(att.url) });
                    } catch {
                      // Ignora URL inválida
                    }
                  }
                }
              }

              if (imageParts.length > 0) {
                return {
                  role: "user" as const,
                  content: [{ type: "text", text: textContent }, ...imageParts],
                };
              }

              return {
                role: "user" as const,
                content: textContent,
              };
            }
            return {
              role: m.role as "user" | "assistant",
              content: m.content,
            };
          });
        }
      } catch (err) {
        console.warn("Aviso ao carregar histórico da conversa para o stream:", err);
      }
    }

    if (modelMessages.length === 0) {
      modelMessages = await convertToModelMessages(messages);
    }

    // 6. Iniciar stream com ferramentas e raciocínio
    const result = streamText({
      model,
      system: fullSystemPrompt,
      messages: modelMessages,
      tools: studioTools,
      abortSignal: req.signal,
      onFinish: async (event) => {
        try {
          const secret =
            process.env.INTERNAL_CONVEX_SECRET ||
            "kriativa_internal_srv_key_9938";

          const promptTokens = (event.usage as any)?.inputTokens || (event.usage as any)?.promptTokens || 0;
          const completionTokens = (event.usage as any)?.outputTokens || (event.usage as any)?.completionTokens || 0;
          const cachedTokens = (event.usage as any)?.cachedPromptTokens || 0;

          // Dedução atômica de créditos no Convex
          const deductionResult = await convex.mutation(
            api.chat.fulfillOrDeductCredits,
            {
              userId,
              conversationId: conversationId
                ? (conversationId as Id<"aiConversations">)
                : undefined,
              tokensPrompt: promptTokens,
              tokensCompletion: completionTokens,
              tokensCached: cachedTokens,
              modelUsed: targetModelName,
              secret,
            }
          );

          let reasoningText: string | undefined = (event as any).reasoningText;
          if (!reasoningText && (event as any).reasoning) {
            const r = (event as any).reasoning;
            if (typeof r === "string") {
              reasoningText = r;
            } else if (Array.isArray(r)) {
              reasoningText = r.map((p: any) => p.text || p.reasoning || "").join("");
            }
          }

          let generatedContent = event.text || "";
          if (!generatedContent && (event as any).responseMessages) {
            for (const msg of (event as any).responseMessages) {
              if (msg.role === "assistant") {
                if (typeof msg.content === "string") {
                  generatedContent += msg.content;
                } else if (Array.isArray(msg.content)) {
                  for (const part of msg.content) {
                    if (part.type === "text") {
                      generatedContent += part.text;
                    }
                  }
                }
              }
            }
          }

          // Persistir a resposta gerada do assistente no banco reativo
          if (conversationId) {
            await convex.mutation(api.chat.saveAssistantMessage, {
              conversationId: conversationId as Id<"aiConversations">,
              userId,
              secret,
              content: generatedContent,
              thoughtProcess: reasoningText || undefined,
              tokensPrompt: promptTokens,
              tokensCompletion: completionTokens,
              creditsDeducted: deductionResult.deducted,
              modelUsed: targetModelName,
              providerUsed: activeProv,
            });
          }
        } catch (err) {
          console.error("Erro na finalização e dedução de créditos do stream:", err);
        }
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: reasoningEffort !== "low",
    });
  } catch (error: any) {
    console.error("Erro no processamento da rota de streaming de IA:", error);
    return new Response(
      JSON.stringify({
        error:
          error?.message ||
          "Erro ao processar instrução com o motor de renderização.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
