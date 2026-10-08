import { auth } from "@clerk/nextjs/server";
import { streamText, convertToModelMessages, UIMessage } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { resolveAiLanguageModel } from "@/lib/ai/providers";

// Vercel Serverless: máximo tempo de execução para streaming de IA
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const SYSTEM_PROMPT_PRESETS: Record<string, string> = {
  general: `Você é o Kriativa Muse, um assistente de inteligência artificial de elite, elegante e multipropósito.
Você é altamente capacitado para responder sobre qualquer assunto com clareza, profundidade e precisão:
- Programação, arquitetura de software, shaders e desenvolvimento técnico em qualquer linguagem
- Análise de problemas complexos, raciocínio lógico e resolução passo a passo
- Redação criativa, textos persuasivos, roteiros, artigos, resumos e traduções
- Estruturação de ideias, planejamento estratégico e brainstorm
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

    // 0. Validação de Feature Flags no Servidor (Conforme Governança AGENTS.md)
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

    // 2. Obter entradas da Bíblia de Produção (Lorebook) para contexto persistente
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

    // 3. Montar System Prompt com instruções de formatação rica e pesquisa
    const searchInstruction = webSearch
      ? `\n\n--- PESQUISA WEB EM TEMPO REAL ATIVA ---\nVocê tem acesso à internet ao vivo. Sempre que buscar informações externas, formate as fontes como links clicáveis em Markdown (ex: [Nome da Fonte](https://...)) e destaque os fatos essenciais em negrito.`
      : "";

    const baseSystemPrompt =
      SYSTEM_PROMPT_PRESETS[mode] || SYSTEM_PROMPT_PRESETS.general;
    const fullSystemPrompt = `${baseSystemPrompt}${lorebookContext}${searchInstruction}`;

    // 4. Resolver metadados do modelo e o provedor correspondente
    let targetModelName = activeModel || aiSettings?.defaultModelText || "anthropic/claude-3.7-sonnet";
    let modelMeta: any = null;
    try {
      modelMeta = await convex.query(api.chat.getModelByModelId, { modelId: targetModelName });
    } catch {
      // Ignora erro se busca falhar
    }

    const detectedProvider =
      modelMeta?.provider ||
      (targetModelName.startsWith("runpod/") ? "runpod" : provider || aiSettings?.activeProvider || "openrouter");

    const activeProv = detectedProvider as "openrouter" | "runpod" | "hybrid_fallback";

    if (webSearch && activeProv === "openrouter" && !targetModelName.includes(":online")) {
      targetModelName = `${targetModelName}:online`;
    }

    const model = resolveAiLanguageModel({
      provider: activeProv,
      modelName: targetModelName,
      config: {
        activeProvider: activeProv,
        runpodEndpointUrl: aiSettings?.runpodEndpointUrl,
        runpodModelName: aiSettings?.runpodModelName,
      },
    });

    // 5. Preparar histórico completo da conversa para o modelo
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
                // Se o anexo contiver texto extraído (documento, código, roteiro), anexa ao prompt
                if (att.extractedText) {
                  const ext = att.name.includes(".") ? att.name.split(".").pop() : "";
                  textContent += `\n\n--- DOCUMENTO/ARQUIVO ANEXADO: ${att.name} ---\n\`\`\`${ext}\n${att.extractedText}\n\`\`\``;
                }

                // Se o anexo for imagem, envia para a visão multimodal da IA
                if (att.type === "image" && att.url) {
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

    // 6. Iniciar stream de texto com suporte nativo a raciocínio e telemetria
    const result = streamText({
      model,
      system: fullSystemPrompt,
      messages: modelMessages,
      abortSignal: req.signal,
      onFinish: async (event) => {
        try {
          const secret =
            process.env.INTERNAL_CONVEX_SECRET ||
            "kriativa_internal_srv_key_9938";

          const promptTokens = (event.usage as any)?.inputTokens || (event.usage as any)?.promptTokens || 0;
          const completionTokens = (event.usage as any)?.outputTokens || (event.usage as any)?.completionTokens || 0;
          const cachedTokens = (event.usage as any)?.cachedPromptTokens || 0;

          // Dedução atômica de créditos no Convex (com suporte a modelos customizados, taxas específicas e usuários ilimitados / admins)
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
              if (msg.role === "assistant" && typeof msg.content === "string") {
                generatedContent += msg.content;
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

    // Retorna o fluxo no formato UI Message Stream compatível com useChat da Vercel
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
