# Guia de Integração Oficial: Kriativa Desktop
> **Documento:** Instruções Técnicas para Desenvolvedores de Aplicativos Desktop (Tauri / Electron / Flutter / Native)  
> **Versão da API:** v1 (OpenAI-Compatible)  
> **Última Atualização:** 2026-10-30  
> **Base URL:** `https://kriativa.app/api/v1`  
> **URL de Conexão:** `https://kriativa.app/connect`

---

## 1. Visão Geral da Arquitetura

O aplicativo desktop da **Kriativa** combina o **padrão ouro de UX de consumo** (1-Click Login sem digitação de senhas ou cópia manual de tokens) com a **robustez do ecossistema OpenAI** (compatibilidade nativa com SDKs oficiais da OpenAI).

```
┌─────────────────────────┐         ┌─────────────────────────┐
│     Kriativa Desktop    │         │      Kriativa Web       │
│    (Tauri / Electron)   │         │ (https://kriativa.app)  │
└────────────┬────────────┘         └────────────┬────────────┘
             │                                   │
             │ 1. Clica em "Entrar com Kriativa" │
             ├──────────────────────────────────►│ Abre navegador padrão em:
             │                                   │ /connect?app=Kriativa+Desktop&callback=kriativa://auth
             │                                   │
             │                                   │ 2. Usuário clica "Autorizar e Conectar"
             │                                   │    (Gera chave krt_live_...)
             │ 3. Dispara Deep Link customizado  │
             │◄──────────────────────────────────┤ kriativa://auth?key=krt_live_...&name=Leonardo
             │                                   │
             │ 4. Salva token no Keychain do SO  │
             │                                   │
             ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│             Gateway OpenAI (https://kriativa.app/api/v1)    │
│  - GET  /api/v1/auth/verify (Validação & Saldo em tempo real│
│  - GET  /api/v1/models (Catálogo de modelos proprietários)  │
│  - POST /api/v1/chat/completions (Inferência com Streaming) │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Passo 1: Registrar o Protocolo Deep Link (`kriativa://`)

O aplicativo desktop precisa interceptar URLs que comecem com o protocolo customizado `kriativa://`.

### A. Se o app for construído em **Tauri (v2)**:

1. Adicione o plugin de deep link no `src-tauri/Cargo.toml`:
```toml
[dependencies]
tauri-plugin-deep-link = "2.0"
```

2. Registre o esquema no `src-tauri/tauri.conf.json`:
```json
{
  "plugins": {
    "deep-link": {
      "desktop": {
        "schemes": ["kriativa"]
      }
    }
  }
}
```

3. No frontend do Tauri (React / Vue / Svelte / TypeScript):
```typescript
import { onOpenUrl } from '@tauri-apps/plugin-deep-link';

export async function setupDeepLinkListener(onTokenReceived: (key: string, userName: string) => void) {
  await onOpenUrl((urls) => {
    for (const urlStr of urls) {
      if (urlStr.startsWith('kriativa://auth')) {
        const url = new URL(urlStr);
        const apiKey = url.searchParams.get('key');
        const name = url.searchParams.get('name') || 'Criador';

        if (apiKey) {
          onTokenReceived(apiKey, name);
        }
      }
    }
  });
}
```

---

### B. Se o app for construído em **Electron**:

1. No arquivo do processo principal (`main.js` ou `main.ts`):
```typescript
import { app, BrowserWindow, shell } from 'electron';
import path from 'path';

const PROTOCOL_NAME = 'kriativa';

// Registra o protocolo customizado no SO
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL_NAME, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL_NAME);
}

// Garante instância única para capturar URLs no Windows/Linux
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    const url = commandLine.find((arg) => arg.startsWith(`${PROTOCOL_NAME}://`));
    if (url) handleAuthDeepLink(url);
  });
}

// macOS: escuta o evento open-url
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleAuthDeepLink(url);
});

function handleAuthDeepLink(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname === 'auth' || parsed.pathname.includes('auth')) {
      const apiKey = parsed.searchParams.get('key');
      const name = parsed.searchParams.get('name');

      if (apiKey) {
        // Envia para a janela renderizadora
        mainWindow?.webContents.send('auth:success', { apiKey, name });
        mainWindow?.focus();
      }
    }
  } catch (err) {
    console.error('Falha ao processar Deep Link:', err);
  }
}
```

---

## 3. Passo 2: O Fluxo de Login ("Entrar com Kriativa")

Quando o usuário clicar no botão **"Entrar com Kriativa"** na interface do desktop:

```typescript
import { shell } from 'electron'; // ou @tauri-apps/plugin-shell

export function startKriativaLogin() {
  const appName = encodeURIComponent('Kriativa Desktop');
  const callbackUrl = encodeURIComponent('kriativa://auth');
  
  // Abre o navegador padrão do sistema operacional
  const connectUrl = `https://kriativa.app/connect?app=${appName}&callback=${callbackUrl}&type=desktop`;
  
  shell.openExternal(connectUrl);
}
```

### O que o navegador retorna no Deep Link:
Quando o usuário clica em **"Autorizar e Conectar"** na página web, o navegador dispara:
```text
kriativa://auth?key=krt_live_0f8b1a2c3d4e5f6g7h8i9j0k&userId=user_2t1x9...&name=Leonardo+Phelipe&email=leo%40kriativa.app
```

> **Fallback de UX:** Caso o firewall ou o sistema operacional do usuário bloqueie o Deep Link automático, a página web `/connect` exibe um botão de cópia manual da chave e um botão "Abrir Aplicativo Novamente". Portanto, inclua também no seu app uma opção: *"Ou cole a Chave de API manualmente"*.

---

## 4. Passo 3: Armazenamento Seguro da Chave de API

**Nunca salve a chave em texto puro (`localStorage` ou arquivo `.json` desprotegido).**

- **No Electron:** Utilize o `safeStorage` nativo do Electron (criptografa usando o Keychain no macOS, DPAPI no Windows e libsecret no Linux) ou a biblioteca `keytar`.
- **No Tauri:** Utilize o `tauri-plugin-stronghold` ou a crate `keyring-rs`.

```typescript
// Exemplo com safeStorage no Electron (Main Process)
import { safeStorage } from 'electron';
import fs from 'fs';

export function storeApiKey(key: string) {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(key);
    fs.writeFileSync(getTokenPath(), encrypted);
  }
}

export function getApiKey(): string | null {
  if (!fs.existsSync(getTokenPath())) return null;
  const encrypted = fs.readFileSync(getTokenPath());
  return safeStorage.decryptString(encrypted);
}
```

---

## 5. Passo 4: Validar a Sessão & Buscar Saldo em Tempo Real

Assim que o app obtém a chave (ou na inicialização do aplicativo), faça uma chamada para validar a chave e exibir o saldo do usuário:

### Endpoint: `GET /api/v1/auth/verify` (ou `GET /api/v1/me`)

```typescript
export interface KriativaUserSession {
  valid: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isUnlimited: boolean;
    credits: {
      total: number;
      paid: number;
      bonus: number;
    };
  };
  key: {
    name: string;
  };
}

export async function verifyKriativaSession(apiKey: string): Promise<KriativaUserSession> {
  const response = await fetch('https://kriativa.app/api/v1/auth/verify', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Chave de API inválida ou revogada. Faça login novamente.');
    }
    throw new Error(`Erro na API (${response.status})`);
  }

  return response.json();
}
```

---

## 6. Passo 5: Consumo dos Modelos de IA (OpenAI SDK)

A API da Kriativa é **100% compatível com a biblioteca oficial da OpenAI**. Você não precisa de bibliotecas customizadas!

### Instalação:
```bash
npm install openai
```

### Configuração do Cliente:
```typescript
import OpenAI from 'openai';

export function createKriativaAiClient(apiKey: string) {
  return new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://kriativa.app/api/v1',
  });
}
```

### Catálogo de Modelos Disponíveis:

| ID do Modelo | Especialidade | Características |
| :--- | :--- | :--- |
| `kriativa-code` | **Engenharia de Software & Código** | Especialista em TypeScript, Rust, Python, shaders GLSL e depuração técnica. |
| `kriativa-mind` | **Direção Geral & Raciocínio Híbrido** | Modelo principal multipropósito para redação, roteiros e raciocínio avançado. |
| `kriativa-reasoning`| **Inferência Profunda (Instância Dedicada)**| Raciocínio com cadeia de pensamento (CoT) para arquiteturas complexas. |
| `kriativa-fast` | **Iterações Ultrarrápidas** | Baixo consumo de créditos e resposta instantânea para chat e autocomplete. |

> **Nota:** Você também pode consultar o catálogo dinamicamente chamando `client.models.list()`, que consulta `GET /api/v1/models`.

### Exemplo de Chat com Streaming (Server-Sent Events):

```typescript
const ai = createKriativaAiClient(apiKey);

async function askKriativa(prompt: string, onToken: (text: string) => void) {
  const stream = await ai.chat.completions.create({
    model: 'kriativa-mind',
    messages: [
      { role: 'system', content: 'Você é o assistente inteligente da Kriativa Desktop.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || '';
    if (delta) {
      onToken(delta);
    }
  }
}
```

---

## 7. Passo 6: Tratamento de Erros & Status Codes

Seu app deve mapear os seguintes códigos de resposta HTTP:

| Código HTTP | Erro | Como Tratar no App Desktop |
| :--- | :--- | :--- |
| `200 OK` | Sucesso | Renderize os dados ou processe o stream normalmente. |
| `401 Unauthorized` | `invalid_api_key` | Chave inexistente, expirada ou revogada. Limpe a chave salva e exiba a tela de login. |
| `402 Payment Required` | `insufficient_credits` | O usuário não possui plano ilimitado e seus créditos acabaram. Exiba um modal amigável com botão para recarga: `https://kriativa.app/dashboard/credits`. |
| `429 Too Many Requests`| `rate_limit_exceeded` | Limite temporário de concorrência. Implemente retry com backoff exponencial. |
| `500 Server Error` | `server_error` | Falha temporária no gateway ou nas instâncias de processamento. |

---

## 8. Checklist de Implementação para o Desenvolvedor

- [ ] Esquema de Deep Link `kriativa://` registrado no instalador do SO (Windows Registry, macOS `Info.plist`, Linux `.desktop`).
- [ ] Botão **"Entrar com Kriativa"** abrindo `https://kriativa.app/connect?app=Kriativa+Desktop&callback=kriativa://auth&type=desktop`.
- [ ] Listener de Deep Link capturando o parâmetro `?key=krt_live_...`.
- [ ] Armazenamento da chave criptografada em cofre seguro do sistema operacional.
- [ ] Campo opcional de fallback para inserção manual da chave caso o deep link falhe.
- [ ] Chamada de inicialização em `GET /api/v1/auth/verify` para carregar nome e saldo de créditos.
- [ ] Cliente OpenAI configurado com `baseURL: "https://kriativa.app/api/v1"`.
- [ ] Modal de alerta para status HTTP 402 direcionando para a página de créditos da Kriativa.
