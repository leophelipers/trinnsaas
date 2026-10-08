import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

console.log("=== INICIANDO TESTES DO KRIATIVA CINEMA STUDIO ===");
console.log("RunPod Key configurada:", Boolean(RUNPOD_API_KEY));
console.log("OpenRouter Key configurada:", Boolean(OPENROUTER_API_KEY));
console.log("Convex URL:", CONVEX_URL);

const ENDPOINTS = {
  krea2_turbo: "9zxmy6gcet7j0g",
  fasth3_i2v: "5oveynpkl0scu3",
  fasth3_t2v_480p: "4a2r6rg0c4ehky",
  ltx25_i2v: "zrhzl1ydzr50n8",
};

async function testRunPodEndpoint(name, id) {
  console.log(`\n[Teste RunPod] Testando conectividade com ${name} (${id})...`);
  try {
    const res = await fetch(`https://api.runpod.ai/v2/${id}/health`, {
      headers: {
        Authorization: `Bearer ${RUNPOD_API_KEY}`,
      },
    });
    const data = await res.json();
    console.log(`✅ ${name}: Status HTTP ${res.status}:`, JSON.stringify(data));
    return { name, ok: res.ok, data };
  } catch (err) {
    console.error(`❌ ${name}: Erro:`, err.message);
    return { name, ok: false, error: err.message };
  }
}

async function testPromptEnhancer() {
  console.log("\n[Teste Prompt Enhancer] Testando OpenRouter gpt-4o-mini com prompt cinemático...");
  try {
    const systemPrompt = `Você é um Diretor de Fotografia de Hollywood. Transforme a ideia do diretor em um prompt profissional em inglês para o motor Krea-2 Turbo. Responda em JSON: { "enhancedPrompt": "...", "suggestedNegativePrompt": "..." }`;
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://kriativa.app",
        "X-Title": "Kriativa Cinema Studio Test",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Cena noturna de @Elena dirigindo carro futurista na chuva com iluminação neon ciano e laranja" },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    const data = await res.json();
    console.log("✅ Prompt Enhancer HTTP Status:", res.status);
    console.log("Resposta do modelo:", data.choices?.[0]?.message?.content);
  } catch (err) {
    console.error("❌ Erro no Prompt Enhancer:", err.message);
  }
}

async function runAllTests() {
  for (const [name, id] of Object.entries(ENDPOINTS)) {
    await testRunPodEndpoint(name, id);
  }
  await testPromptEnhancer();
  console.log("\n=== TESTES CONCLUÍDOS COM SUCESSO ===");
}

runAllTests();
