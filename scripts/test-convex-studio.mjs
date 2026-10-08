import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function testConvexStudio() {
  console.log("=== TESTANDO FUNÇÕES CONVEX DO ESTÚDIO CINEMATOGRÁFICO ===");

  // 1. Testa resolução de menções no prompt
  console.log("\n[Teste 1] Testando resolveMentionsInPrompt...");
  const promptSample = "Tomada cinematográfica de @Elena pilotando @CyberCar em frente ao @BarNeon estilo @Kodak35mm";
  const mentionRes = await client.query(api.studioElements.resolveMentionsInPrompt, {
    prompt: promptSample,
  });
  console.log("Resultado da resolução de menções:", JSON.stringify(mentionRes, null, 2));

  // 2. Consulta tabela de precificação
  console.log("\n[Teste 2] Testando getStudioPricing...");
  const pricing = await client.query(api.studioGenerations.getStudioPricing, {});
  console.log("Workflows ativos retornados:", pricing.length);
  for (const w of pricing) {
    console.log(`- Motor: ${w.engine} | Tipo: ${w.type} | Créditos: ${w.creditsPerUnit} | Ativo: ${w.isActive}`);
  }

  console.log("\n=== TESTES CONVEX CONCLUÍDOS COM SUCESSO ===");
}

testConvexStudio().catch(console.error);
