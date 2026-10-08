# Feature Specification: Roteamento Híbrido Multi-Provedor (Higgsfield API & RunPod ComfyUI)

> **Status:** ATIVO & HOMOLOGADO  
> **Versão:** 1.0.0  
> **Data de Criação:** 2026-10-08  
> **Responsável:** Equipe de Arquitetura Kriativa.app  
> **Classificação:** Arquitetura de Motores de Renderização e Unit Economics  

---

## 1. Visão Geral da Feature

O Kriativa.app adota uma arquitetura de infraestrutura de geração visual e em movimento **híbrida e multi-provedor**. Esta arquitetura permite alternar dinamicamente entre:
1. **Higgsfield Cloud API:** Provedor oficial em nuvem de ponta, utilizado primordialmente para o modelo multimodal **ByteDance Seedance 2.5** (`bytedance/seedance-2.5/text-to-video`), oferecendo áudio nativo sincronizado, durações de até 30 segundos e resolução 720p/1080p sem necessidade de manter containers ComfyUI complexos.
2. **RunPod Serverless ComfyUI:** Clusters dedicados serverless com nós customizados de ComfyUI (Krea-2 Turbo, FastH3 Image-to-Video com áudio e LTX-2.5 Distilled HD), permitindo total controle de tensores, LoRAs e otimizações personalizadas.

O criador de conteúdo pode alternar explicitamente entre provedores e modelos no console de criação (*Studio Dock*), ou usufruir do **Modo Auto**, que direciona de forma inteligente a requisição para o motor mais adequado conforme a resolução, proporção e formato desejados.

---

## 2. Como Funciona a Alternância (Mecanismo de Troca)

A alternância entre Higgsfield e RunPod opera em 4 camadas complementares:

### 2.1 Camada 1: Interface do Criador (Studio Dock)
- **Seleção Direta no Dock:**
  - O seletor de motores do Dock exibe todos os motores ativos com identificação de procedência (ex: *Seedance 2.5 Cinema [Higgsfield API]*, *FastVideo H3 720p [RunPod]*, *LTX-2.5 CinemaScope [RunPod]*).
  - No **Modo Auto ✨**:
    - Síntese de Imagem $\rightarrow$ Krea-2 Turbo (RunPod Serverless).
    - Imagem para Vídeo (I2V) $\rightarrow$ FastH3 i2v (RunPod Serverless).
    - Texto para Vídeo em 480p Preview $\rightarrow$ FastVideo H3 480p (RunPod Serverless).
    - Texto para Vídeo em 720p/1080p Cinemático $\rightarrow$ Seedance 2.5 (Higgsfield API).
- **Proibição Estrita de Termos de Hardware na UI:** Em conformidade com a Regra 4 de Governança, nenhum texto exibe menções a "GPU", "VRAM" ou números de placas brutas na interface voltada ao usuário final.

### 2.2 Camada 2: Roteador BFF (`/api/studio/generate`)
- Ao receber o payload de geração, a função `getEngineProvider(engine)` determina o provedor alvo (`higgsfield` ou `runpod`).
- **Se `provider === "higgsfield"`:**
  - Lê `HF_CREDENTIALS` (ou `HF_KEY`) exclusivamente no ambiente seguro do servidor.
  - Constrói o payload padronizado via `buildHiggsfieldPayload()`.
  - Dispara requisição HTTP POST para `https://api.higgsfield.ai/bytedance/seedance-2.5/text-to-video`.
  - Retorna `jobId` (`request_id`), `endpointId` e `provider: "higgsfield"`.
- **Se `provider === "runpod"`:**
  - Lê `RUNPOD_API_KEY`.
  - Constrói o grafo de nós do ComfyUI via `buildWorkflowPayload()`.
  - Dispara requisição HTTP POST para `https://api.runpod.ai/v2/${endpointId}/run`.
  - Retorna `jobId`, `endpointId` e `provider: "runpod"`.

### 2.3 Camada 3: Monitoramento de Status & Armazenamento Seguro (`/api/studio/status`)
- O cliente consulta periodicamente o status da tarefa passando `provider` nos parâmetros de consulta (`provider=higgsfield` ou `provider=runpod`).
- **Higgsfield Polling:**
  - Consulta `GET https://api.higgsfield.ai/requests/${jobId}/status`.
  - Estados suportados: `queued`, `in_progress`, `completed`, `failed`, `nsfw`.
  - Quando `completed`: baixa o buffer de vídeo do link temporário de CDN da Higgsfield e armazena permanentemente no **Convex Storage**, salvando o `outputStorageId` em `studioGenerations`.
  - Quando moderado (`nsfw`) ou falho (`failed`): dispara `api.studioGenerations.refundGeneration` com estorno atômico de créditos.
- **RunPod Polling:**
  - Consulta `GET https://api.runpod.ai/v2/${endpointId}/status/${jobId}`.
  - Estados suportados: `IN_QUEUE`, `IN_PROGRESS`, `COMPLETED`, `FAILED`, `CANCELLED`.
  - Quando `COMPLETED`: extrai mídias geradas, salva no Convex Storage e chama `completeGeneration`.

### 2.4 Camada 4: Gestão Administrativa, Unit Economics & Feature Flags
- **Feature Flags no Convex:**
  - `studio_engine_seedance25`: Habilita ou desativa globalmente o motor Seedance 2.5.
  - `studio_provider_higgsfield`: Habilita ou suspende tráfego geral para a API Higgsfield.
  - `studio_provider_runpod`: Habilita ou suspende tráfego geral para o RunPod.
  - `studio_prefer_higgsfield`: Controla a preferência automática de roteamento no Modo Auto.
- **Tabela de Unit Economics (`/dashboard/admin/pricing`):**
  - Permite configurar o tempo de execução estimado, custo por segundo, margem de lucro alvo (ex: 85%) e créditos cobrados para cada workflow, seja ele hospedado no RunPod ou via Cloud API Higgsfield.
  - O administrador pode alterar as margens individualmente ou em lote, e os preços em créditos recalculam instantaneamente sem novo deploy.

---

## 3. Segurança & Proteção de Credenciais

- **Credenciais Higgsfield (`HF_CREDENTIALS`):**
  - Formato: `key-id:key-secret`.
  - Armazenado estritamente em `.env.local` no ambiente de desenvolvimento e em variáveis de ambiente seguras na produção (Vercel / Convex).
  - O arquivo `.env.local` está rigorosamente incluído no `.gitignore`.
  - Proibição absoluta de impressão em logs do servidor, resposta de APIs ou commit no Git.

---

## 4. Script de Validação e Verificação Técnica

Foi criado o script [`index.ts`](file:///C:/dev/trinnsaas/index.ts) para validação direta via SDK oficial `@higgsfield/client`:
- Utiliza o método `subscribe` com o modelo `bytedance/seedance-2.5/text-to-video`.
- Parâmetros: `prompt: "A cinematic scene at sunset"`, `duration: 5`, `resolution: "720p"`, `aspect_ratio: "16:9"`.
- Trata estados terminais: `completed` (imprime URL final), `failed` e `nsfw`.
- Como a execução dispara uma chamada tarifada e faturável, o desenvolvedor pode rodar `npx tsx index.ts` localmente com suas credenciais ativas.
