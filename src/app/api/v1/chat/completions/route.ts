import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutos para longas gerações no OpenCode

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Title, HTTP-Referer, User-Agent",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validação de Autenticação via Chave de API Bearer
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: {
            message:
              "Chave de API não informada. Forneça o cabeçalho 'Authorization: Bearer krt_live_...'",
            type: "invalid_request_error",
            param: null,
            code: "invalid_api_key",
          },
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const apiKey = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            message: "Token de API vazio.",
            type: "invalid_request_error",
            param: null,
            code: "invalid_api_key",
          },
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // 2. Validação atômica da chave no Convex
    const internalSecret =
      process.env.INTERNAL_CONVEX_SECRET || "kriativa_internal_srv_key_9938";

    const authCheck = await convex.mutation(
      api.apiKeys.validateApiKeyInternal,
      {
        key: apiKey,
        secret: internalSecret,
      }
    );

    if (!authCheck.valid) {
      return NextResponse.json(
        {
          error: {
            message: authCheck.error || "Chave de API inválida ou revogada.",
            type: "authentication_error",
            param: null,
            code: "invalid_api_key",
          },
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const userId = authCheck.userId;
    const isUnlimited = Boolean(authCheck.isUnlimited);
    const totalCredits = authCheck.totalCredits ?? 0;

    // 3. Verificação de Saldo de Créditos
    if (!isUnlimited && totalCredits <= 0) {
      return NextResponse.json(
        {
          error: {
            message:
              "Saldo de créditos insuficiente no Kriativa Studio. Recarregue créditos para continuar utilizando no OpenCode.",
            type: "insufficient_quota",
            param: null,
            code: "insufficient_credits",
          },
        },
        { status: 402, headers: CORS_HEADERS }
      );
    }

    // 4. Parse do Payload OpenAI vindo do OpenCode
    const body = await req.json();
    const requestedModel = body.model || "kriativa-code";

    // 5. Consulta Dinâmica das Rotas Configuradas pelo Administrador no Convex
    const routeConfig = await convex.query(
      api.developerApi.getRouteConfigInternal,
      {
        modelSlug: requestedModel,
      }
    );

    if (!routeConfig.isEnabled) {
      return NextResponse.json(
        {
          error: {
            message: `O motor "${routeConfig.displayName}" está temporariamente desativado pela administração.`,
            type: "invalid_request_error",
            param: "model",
            code: "model_disabled",
          },
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const canonicalId = routeConfig.canonicalId;

    // 6. Roteamento Invisível (Configurado via Admin: OpenRouter vs RunPod)
    let upstreamUrl = "https://openrouter.ai/api/v1/chat/completions";
    let upstreamApiKey = process.env.OPENROUTER_API_KEY || "";
    let upstreamModel = routeConfig.targetModel;

    let aiSettings: any = null;
    try {
      aiSettings = await convex.query(api.chat.getAiSettings, {});
    } catch {
      // Ignora erro
    }

    if (routeConfig.provider === "runpod") {
      const runpodEndpoint =
        routeConfig.runpodEndpointUrl ||
        aiSettings?.runpodEndpointUrl ||
        process.env.RUNPOD_ENDPOINT_URL;

      if (runpodEndpoint) {
        let cleanEndpoint = runpodEndpoint.replace(/\/+$/, "");
        if (!cleanEndpoint.endsWith("/chat/completions")) {
          if (cleanEndpoint.endsWith("/v1")) {
            cleanEndpoint += "/chat/completions";
          } else {
            cleanEndpoint += "/openai/v1/chat/completions";
          }
        }
        upstreamUrl = cleanEndpoint;
        upstreamApiKey =
          process.env.RUNPOD_API_KEY || "runpod-default-token";
        upstreamModel = routeConfig.targetModel;
      }
    }

    // Injeção do Prompt Master de Identidade (Kriativa AI)
    let processedMessages = Array.isArray(body.messages) ? [...body.messages] : [];
    const masterPrompt =
      aiSettings?.masterSystemPrompt ||
      "Você é o Kriativa AI, o assistente inteligente da plataforma Kriativa. Sua identidade é e sempre será Kriativa AI. Nunca mencione termos de hardware bruto.";

    const existingSystemIdx = processedMessages.findIndex((m: any) => m.role === "system");
    if (existingSystemIdx >= 0) {
      processedMessages[existingSystemIdx] = {
        ...processedMessages[existingSystemIdx],
        content: `${masterPrompt}\n\n${processedMessages[existingSystemIdx].content || ""}`,
      };
    } else {
      processedMessages.unshift({
        role: "system",
        content: masterPrompt,
      });
    }

    // Prepara payload para o upstream garantindo inclusão de métricas de tokens no stream
    const upstreamBody = {
      ...body,
      messages: processedMessages,
      model: upstreamModel,
      stream_options: body.stream
        ? { include_usage: true, ...(body.stream_options || {}) }
        : body.stream_options,
    };

    const upstreamHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${upstreamApiKey}`,
      "HTTP-Referer": "https://kriativa.app",
      "X-Title": "Kriativa OpenCode Gateway",
    };

    // 7. Chamada de inferência ao provedor real configurado
    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: upstreamHeaders,
      body: JSON.stringify(upstreamBody),
    });

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text();
      let parsedErr = null;
      try {
        parsedErr = JSON.parse(errText);
      } catch {}

      return NextResponse.json(
        parsedErr || {
          error: {
            message: `Falha no motor de inferência da Kriativa: ${upstreamRes.statusText}`,
            type: "upstream_error",
            code: upstreamRes.status,
          },
        },
        { status: upstreamRes.status, headers: CORS_HEADERS }
      );
    }

    // 8. Se não for streaming, substitui o ID do modelo na resposta pelo nome proprietário
    if (!body.stream) {
      const data = await upstreamRes.json();
      data.model = canonicalId; // Retorna sempre o identificador da Kriativa

      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;

      if (promptTokens > 0 || completionTokens > 0) {
        try {
          await convex.mutation(api.chat.fulfillOrDeductCredits, {
            userId: userId!,
            tokensPrompt: promptTokens,
            tokensCompletion: completionTokens,
            modelUsed: canonicalId,
            secret: internalSecret,
          });
        } catch (deductErr) {
          console.error("Falha ao debitar créditos (não-stream):", deductErr);
        }
      }

      return NextResponse.json(data, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    // 9. Streaming em tempo real (SSE) compatível com OpenCode com blindagem total de marca
    const textDecoder = new TextDecoder("utf-8");
    const textEncoder = new TextEncoder();
    let accumulatedPromptTokens = 0;
    let accumulatedCompletionTokens = 0;
    let estimatedOutputChars = 0;
    let lineBuffer = "";

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        try {
          const text = textDecoder.decode(chunk, { stream: true });
          lineBuffer += text;
          const parts = lineBuffer.split("\n");
          // Mantém a última linha incompleta no buffer
          lineBuffer = parts.pop() || "";

          for (const line of parts) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
              const jsonStr = trimmed.slice(6);
              try {
                const parsed = JSON.parse(jsonStr);
                // BLINDAGEM: O cliente OpenCode só vê o modelo proprietário Kriativa
                parsed.model = canonicalId;

                if (parsed.usage) {
                  if (parsed.usage.prompt_tokens) {
                    accumulatedPromptTokens = parsed.usage.prompt_tokens;
                  }
                  if (parsed.usage.completion_tokens) {
                    accumulatedCompletionTokens = parsed.usage.completion_tokens;
                  }
                }

                if (parsed.choices?.[0]?.delta?.content) {
                  estimatedOutputChars += parsed.choices[0].delta.content.length;
                }

                controller.enqueue(
                  textEncoder.encode(`data: ${JSON.stringify(parsed)}\n\n`)
                );
              } catch {
                controller.enqueue(textEncoder.encode(`${line}\n`));
              }
            } else if (trimmed === "data: [DONE]") {
              controller.enqueue(textEncoder.encode("data: [DONE]\n\n"));
            } else if (line.length > 0) {
              controller.enqueue(textEncoder.encode(`${line}\n`));
            }
          }
        } catch {
          controller.enqueue(chunk);
        }
      },
      async flush(controller) {
        if (lineBuffer.trim().length > 0) {
          const trimmed = lineBuffer.trim();
          if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              parsed.model = canonicalId;
              controller.enqueue(
                textEncoder.encode(`data: ${JSON.stringify(parsed)}\n\n`)
              );
            } catch {
              controller.enqueue(textEncoder.encode(`${lineBuffer}\n`));
            }
          } else {
            controller.enqueue(textEncoder.encode(`${lineBuffer}\n`));
          }
        }

        const promptTokens = accumulatedPromptTokens;
        const completionTokens =
          accumulatedCompletionTokens > 0
            ? accumulatedCompletionTokens
            : Math.ceil(estimatedOutputChars / 3.8);

        if (promptTokens > 0 || completionTokens > 0) {
          try {
            await convex.mutation(api.chat.fulfillOrDeductCredits, {
              userId: userId!,
              tokensPrompt: promptTokens,
              tokensCompletion: completionTokens,
              modelUsed: canonicalId,
              secret: internalSecret,
            });
          } catch (deductErr) {
            console.error(
              "Falha ao debitar créditos no término do stream SSE:",
              deductErr
            );
          }
        }
      },
    });

    return new Response(upstreamRes.body?.pipeThrough(transformStream), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: any) {
    console.error("Erro no OpenCode Gateway (/api/v1/chat/completions):", err);
    return NextResponse.json(
      {
        error: {
          message: err?.message || "Erro interno no gateway de processamento.",
          type: "server_error",
          code: 500,
        },
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
