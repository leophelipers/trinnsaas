# SPEC: Kriativa Voice & Modo de Criação Ilimitada no Studio
> **Status:** HOMOLOGADO  
> **Data de Criação:** 2026-10-27  
> **Última Atualização:** 2026-10-27  
> **Autor / Agente Responsável:** Antigravity  
> **Feature Flags Associadas:** `voice_generation_enabled`, `studio_unlimited_mode`

---

## 1. Objetivo & Justificativa de Negócio
- **Cumprimento Integral da Página de Vendas:**
  1. **Pilar 03 (Kriativa Voice):** Disponibilizar a ferramenta de geração de vozes e narrações neurais (Voice Swift e Voice Pro) e transcrição de áudio (Voice Transcribe) prometida na Landing Page de Pré-Lançamento.
  2. **Promessa "IA Ilimitada sem contador de créditos":** Permitir que assinantes do plano ilimitado (`unlimitedStudio`, `unlimitedPlanActive`, `unlimitedAiChat` ou administradores) criem imagens e renderizem vídeos cinemáticos sem necessidade de saldo de créditos ou bloqueios por contador.
  3. **Branding White-Label dos Motores:** Eliminar nomes de fornecedores de infraestrutura (RunPod, Higgsfield, Krea-2, FastH3) do Studio Dock, substituindo-os pelos nomes oficiais da marca (Kriativa Vision Swift/Pro e Kriativa Motion Swift/Pro/Cinema).

---

## 2. Requisitos Funcionais
1. [x] **Kriativa Voice (Síntese TTS):** Geração neural de áudio (.mp3) em pt-BR com catálogo de vozes cinematográficas (Narrador Cinema, Documentário, Jovem Criadora, Noticiário e Criador Ágil), salvamento no Convex Storage e histórico reativo.
2. [x] **Kriativa Voice (Transcrição):** Upload de arquivos de áudio/vídeo (.mp3, .wav, .m4a, .mp4) e extração de texto automatizada.
3. [x] **Bypass Ilimitado no Studio (`studioGenerations.ts`):** Usuários ilimitados não têm saldo deduzido nem são bloqueados ao renderizar imagens ou vídeos.
4. [x] **UI Adaptativa do Studio Dock:** Quando o criador for ilimitado, o botão exibe `"RENDERIZAR CENA ✨ ILIMITADO"` e oculta contadores de créditos avulsos.
5. [x] **Nomenclatura Proprietária:** Unificação de todos os motores nos seletores do estúdio sob a marca Kriativa.

---

## 3. Modelo de Dados (Convex Schema)

```typescript
// 21. GERAÇÕES DE VOZ E LOCUÇÃO NEURAL (KRIATIVA VOICE)
voiceGenerations: defineTable({
  userId: v.string(), // clerkId
  projectId: v.optional(v.string()),
  type: v.union(v.literal("tts"), v.literal("transcribe")),
  tier: v.union(v.literal("swift"), v.literal("pro"), v.literal("transcribe")),
  text: v.string(),
  voiceId: v.string(),
  voiceName: v.string(),
  audioLanguage: v.optional(v.string()),
  outputStorageId: v.optional(v.id("_storage")),
  outputUrl: v.optional(v.string()),
  durationSeconds: v.optional(v.number()),
  creditsCharged: v.number(),
  status: v.union(v.literal("queued"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
  errorMessage: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_status", ["status"])
  .index("by_createdAt", ["createdAt"]),
```

---

## 4. Segurança, Antifraude & Feature Flags
- `voice_generation_enabled`: Controle de ativação global do Kriativa Voice.
- `studio_unlimited_mode`: Controle de autorização do bypass ilimitado no estúdio.
- Transações do plano ilimitado gravadas no livro-razão `creditTransactions` com valor `0` para auditoria contínua sem quebra do ledger.
