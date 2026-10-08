import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await req.json();
    const {
      prompt,
      engine = "krea2_turbo",
      cameraMotion,
      lens,
      lighting,
      framing,
      aspectRatio,
    } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "O prompt original é obrigatório." },
        { status: 400 }
      );
    }

    const openRouterApiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    // Se a chave não estiver configurada no ambiente, retorna uma composição estilística heurística imediata
    if (!openRouterApiKey) {
      const cameraPart = cameraMotion ? `, ${cameraMotion} camera movement` : "";
      const lensPart = lens ? `, shot on ${lens}` : "";
      const lightingPart = lighting ? `, ${lighting} lighting` : "";
      const framingPart = framing ? `, ${framing}` : "";

      const enhancedFallback = `${prompt.trim()}${framingPart}${cameraPart}${lensPart}${lightingPart}, 8k UHD, cinematic color grading, master production`;
      return NextResponse.json({
        enhancedPrompt: enhancedFallback,
        suggestedNegativePrompt: "blurry, low quality, distorted, oversaturated, deformed",
        suggestedAudioPrompt: "cinematic ambient sound, subtle atmospheric foley",
      });
    }

    // Prompts de sistema customizados por arquitetura de tensores de cada motor
    let engineSpecificGuidance = "";
    if (engine === "krea2_turbo") {
      engineSpecificGuidance = `
Motor alvo: Krea-2 Turbo (Geração de Imagens Fotorrealistas Ultrarrápidas).
Requisitos de Otimização:
- Foque em detalhes táteis, poros de pele reais, dispersão de subsuperfície (subsurface scattering), microdetalhes de vestuário e texturas de materiais.
- Especifique enquadramento óptico (Hasselblad H6D-100c, lente ótica de médio formato, aberração cromática natural sutil).
- NUNCA use clichês vazios como "photorealistic", "hyperrealistic". Use vocabulário de iluminação real (Rembrandt, chiaroscuro, catchlight nos olhos, luz volumétrica).
- Mantenha o prompt em inglês para máxima eficácia no CLIP/SDXL.`;
    } else if (engine === "fasth3_i2v" || engine === "fasth3_t2v_480p" || engine === "fasth3_t2v_720p") {
      engineSpecificGuidance = `
Motor alvo: FastH3 (Geração e Animação de Vídeo com Áudio Nativo Sincronizado).
Requisitos de Otimização:
- Este motor aceita e sintetiza ÁUDIO e VÍDEO sincronizados em uma única passagem.
- No prompt de vídeo: Descreva a progressão do movimento no tempo (ex: "starts with a slow push-in, the subject turns slightly while wind gently sways hair, subtle natural breathing movement").
- Sugira também um "audioPrompt" dedicado (sons ambientes, foley, passos, chuva, ruído de motor, respiração).
- Mantenha a ação física plausível e elegante.`;
    } else if (engine === "ltx25_i2v") {
      engineSpecificGuidance = `
Motor alvo: LTX-2.5 Distilled HD (DiT Transformer de Vídeo Cinemático 720p 24fps).
Requisitos de Otimização:
- Foque na cadência de cinema de 24fps, emulsão de filme 35mm (Kodak Vision3 500T), granulação orgânica e flares anamórficos.
- Descreva movimentos de câmera majestosos (Slow Steadicam tracking, Dutch tilt gradual, Dolly in).
- Enfatize a profundidade de campo rasa e a separação de planos com desfoque de fundo (bokeh cinematográfico cremoso).`;
    }

    const opticalDetails = [
      cameraMotion ? `Movimento de Câmera Desejado: ${cameraMotion}` : null,
      lens ? `Lente/Óptica: ${lens}` : null,
      lighting ? `Iluminação: ${lighting}` : null,
      framing ? `Enquadramento: ${framing}` : null,
      aspectRatio ? `Proporção: ${aspectRatio}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const systemPrompt = `Você é um Diretor de Fotografia de Hollywood e Engenheiro de Prompts Sênior da Kriativa.
Sua missão é pegar a ideia bruta fornecida pelo diretor e transformá-la em uma descrição de cena profissional impecável em INGLÊS, altamente otimizada para o motor de geração de mídia.

${engineSpecificGuidance}

Instruções Estritas:
1. Responda ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "enhancedPrompt": "prompt positivo em inglês detalhado e visualmente rico",
  "suggestedNegativePrompt": "prompt negativo em inglês para evitar defeitos",
  "suggestedAudioPrompt": "descrição concisa da sonoplastia e efeitos sonoros da cena em inglês",
  "cameraDirection": "resumo de 1 frase em português explicando a escolha de decupagem"
}
2. Se o usuário forneceu menções como @Elena ou @CyberCar, PRESERVE as menções exatamente como estão no prompt para que o sistema de consistência consiga reconhecê-las!
3. Não adicione nenhum texto introdutório fora do JSON.`;

    const userMessage = `Prompt Bruto do Diretor:
"${prompt.trim()}"

Configurações Adicionais Selecionadas:
${opticalDetails || "Nenhuma configuração específica selecionada."}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": "https://kriativa.app",
        "X-Title": "Kriativa Cinema Studio Prompt Enhancer",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter Prompt Enhancer error:", response.status, await response.text());
      // Fallback gracioso
      return NextResponse.json({
        enhancedPrompt: `${prompt.trim()}, ${framing || "cinematic shot"}, ${lens || "35mm prime"}, ${lighting || "dramatic lighting"}, master quality, 8k resolution`,
        suggestedNegativePrompt: "blurry, distorted, oversaturated, deformed anatomy, watermark",
        suggestedAudioPrompt: "cinematic ambience, high fidelity soundscape",
        cameraDirection: "Enquadramento cinemático com iluminação equilibrada.",
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json({
        enhancedPrompt: parsed.enhancedPrompt || prompt,
        suggestedNegativePrompt: parsed.suggestedNegativePrompt || "",
        suggestedAudioPrompt: parsed.suggestedAudioPrompt || "",
        cameraDirection: parsed.cameraDirection || "",
      });
    } catch {
      return NextResponse.json({
        enhancedPrompt: content || prompt,
        suggestedNegativePrompt: "blurry, distorted, oversaturated",
        suggestedAudioPrompt: "",
        cameraDirection: "Cena refinada.",
      });
    }
  } catch (err: any) {
    console.error("Erro na rota /api/studio/enhance-prompt:", err);
    return NextResponse.json(
      { error: "Falha interna ao enriquecer o prompt." },
      { status: 500 }
    );
  }
}
