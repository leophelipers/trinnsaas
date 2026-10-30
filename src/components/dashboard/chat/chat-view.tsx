"use client";

import { useState, useRef, useEffect, useMemo, ChangeEvent, KeyboardEvent, DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Sparkles,
  Send,
  Square,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowDown,
  ArrowUp,
  Columns,
  BookOpen,
  Film,
  Clapperboard,
  RotateCcw,
  Zap,
  Coins,
  X,
  Sliders,
  Cpu,
  ArrowLeft,
  LayoutDashboard,
  AlertCircle,
  Globe,
  Mic,
  MicOff,
  Volume2,
  UploadCloud,
  Trash2,
  Maximize2,
  Minimize2,
  Eraser,
  FileCode,
  Eye,
  Loader2,
  Plus,
  Menu,
  Video,
  Brain,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LorebookDrawer } from "./lorebook-drawer";
import { ChatCanvas } from "./chat-canvas";
import { MarkdownRenderer } from "./markdown-renderer";
import { ContextualSelectionMenu } from "./contextual-selection-menu";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { useChatMobileSidebar } from "./chat-layout-wrapper";

interface ChatViewProps {
  conversationId: Id<"aiConversations">;
}

type StudioMode = "general" | "director" | "screenwriter" | "art_director" | "developer";
type ReasoningEffort = "low" | "medium" | "high";

interface PromptAttachment {
  name: string;
  type: string;
  url: string;
  size: number;
  file?: File;
  storageId?: Id<"_storage">;
  extractedText?: string;
  isImage?: boolean;
  isVideo?: boolean;
  isCode?: boolean;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const router = useRouter();
  const { openMobileSidebar } = useChatMobileSidebar();
  // Dados reativos do Convex
  const conversation = useQuery(api.chat.getConversation, { conversationId });
  const dbMessages = useQuery(api.chat.getMessages, { conversationId }) || [];
  const currentUser = useQuery(api.users.current);
  const userCredits = useQuery(api.credits.getMyCredits);
  const loreEntries = useQuery(api.chat.listLorebookEntries, { conversationId }) || [];
  const availableModels = useQuery(api.chat.listAvailableModels) || [];
  const aiSettings = useQuery(api.chat.getAiSettings);
  const isModelForcedByAdmin = Boolean(aiSettings?.chatForceAdminModel);

  const createConversation = useMutation(api.chat.createConversation);
  const saveUserMessage = useMutation(api.chat.saveUserMessage);
  const deleteMessageMutation = useMutation(api.chat.deleteMessage);
  const createTask = useMutation(api.tasks.add);
  const generateUploadUrl = useMutation(api.chat.generateUploadUrl);

  // Validação em tempo real de Feature Flags (Conforme Governança AGENTS.md)
  const { isEnabled } = useFeatureFlags();
  const isCanvasEnabled = isEnabled("chat_canvas_artifacts");
  const isLorebookEnabled = isEnabled("chat_lorebook_memory");
  const isUploadEnabled = isEnabled("chat_file_upload");

  // Estados locais da UI
  const [mode, setMode] = useState<StudioMode>("general");
  const [selectedModel, setSelectedModel] = useState<string>("meta-llama/llama-3.3-70b-instruct:free");
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>("medium");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isPersonaDropdownOpen, setIsPersonaDropdownOpen] = useState(false);
  const [isLorebookOpen, setIsLorebookOpen] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<{ title: string; content: string; language?: string } | null>(null);
  const [showAutoScrollButton, setShowAutoScrollButton] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [promptInput, setPromptInput] = useState("");
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const [isExpandedPrompt, setIsExpandedPrompt] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [taskNotice, setTaskNotice] = useState<string | null>(null);

  // Referências para menus suspensos
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const personaDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (plusMenuRef.current && !plusMenuRef.current.contains(target)) {
        setIsPlusMenuOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(target)) {
        setIsModelDropdownOpen(false);
      }
      if (personaDropdownRef.current && !personaDropdownRef.current.contains(target)) {
        setIsPersonaDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Estados de Modais Customizados (substituição aos alerts JS)
  const [messageToDelete, setMessageToDelete] = useState<Id<"aiMessages"> | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [voiceAlertModalOpen, setVoiceAlertModalOpen] = useState(false);

  // Estado de Reconhecimento de Voz (Microfone / Transcrição em Tempo Real)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  // Cronômetro para o bloco de Raciocínio (Thinking Accordion)
  const [thinkingTime, setThinkingTime] = useState(0);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUnlimitedAdminsActive = isEnabled("chat_unlimited_admins");
  const isUnlimited = Boolean(
    (currentUser?.role === "admin" && isUnlimitedAdminsActive) || (currentUser as any)?.unlimitedAiChat
  );
  const totalCredits = userCredits?.totalCredits ?? currentUser?.customCredits ?? 0;

  // Atualiza modelo com base nas diretrizes do Admin ou no padrão da conversa
  useEffect(() => {
    if (isModelForcedByAdmin && aiSettings?.chatDefaultModel) {
      setSelectedModel(aiSettings.chatDefaultModel);
    } else if (conversation?.activeModel) {
      setSelectedModel(conversation.activeModel);
    } else if (aiSettings?.chatDefaultModel) {
      setSelectedModel(aiSettings.chatDefaultModel);
    }
  }, [conversation?.activeModel, isModelForcedByAdmin, aiSettings?.chatDefaultModel]);

  const currentModelMeta = availableModels.find((m) => m.modelId === selectedModel);
  const currentProvider =
    currentModelMeta?.provider ||
    (selectedModel.startsWith("runpod/") ? "runpod" : "openrouter");

  // Vercel AI SDK useChat com transporte customizado incluindo webSearch
  const {
    messages,
    sendMessage,
    stop,
    status,
    error,
  } = useChat({
    id: conversationId,
    transport: new DefaultChatTransport({
      api: "/api/chat/stream",
      credentials: "include",
      body: {
        conversationId,
        mode,
        activeModel: selectedModel,
        provider: currentProvider,
        reasoningEffort,
        webSearch: webSearchEnabled,
      },
    }),
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // Gerenciamento do cronômetro de raciocínio durante streaming
  useEffect(() => {
    let interval: any = null;
    if (isStreaming) {
      setThinkingTime(0);
      interval = setInterval(() => {
        setThinkingTime((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Auto-scroll inteligente: rola para baixo se o usuário estiver próximo ao rodapé
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    setShowAutoScrollButton(distanceToBottom > 150);
  };

  useEffect(() => {
    if (!showAutoScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [dbMessages, messages, isStreaming, showAutoScrollButton]);

  // Inicialização e Controle do Reconhecimento de Voz (Speech-to-Text)
  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      speechRecognitionRef.current?.stop();
      setIsRecordingVoice(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceAlertModalOpen(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "pt-BR";

      recognition.onstart = () => {
        setIsRecordingVoice(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (transcript.trim()) {
          setPromptInput((prev) => {
            const separator = prev && !prev.endsWith(" ") ? " " : "";
            return `${prev}${separator}${transcript.trim()}`;
          });
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === "network") {
          console.warn("Reconhecimento de voz: serviço de transcrição do navegador indisponível na rede atual.");
        } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          console.warn("Reconhecimento de voz: permissão de microfone não autorizada.");
        } else if (event.error !== "no-speech") {
          console.warn("Aviso no reconhecimento de voz:", event.error);
        }
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Falha ao iniciar microfone:", err);
      setIsRecordingVoice(false);
    }
  };

  // Utilitários de leitura de arquivos e documentos
  const isCodeOrDoc = (name: string, mime: string) => {
    const codeExts = /\.(ts|tsx|js|jsx|py|html|css|json|sql|sh|yaml|yml|md|txt|csv|xml|rs|go|java|c|cpp|h|php)$/i;
    return codeExts.test(name) || mime.startsWith("text/") || mime.includes("json") || mime.includes("javascript");
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result as string) || "";
        if (text.length > 200000) {
          resolve(text.substring(0, 200000) + "\n\n[...arquivo truncado nos primeiros 200KB para caber na janela de contexto...]");
        } else {
          resolve(text);
        }
      };
      reader.onerror = () => resolve("");
      reader.readAsText(file);
    });
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (newFiles: File[]) => {
    if (!newFiles.length) return;
    setIsUploadingFiles(true);

    try {
      const processed: PromptAttachment[] = [];

      for (const f of newFiles) {
        const isImg = f.type.startsWith("image/");
        const isVid = f.type.startsWith("video/");
        const isCode = isCodeOrDoc(f.name, f.type);

        let dataUrl = "";
        let textContent = "";

        if (isImg) {
          dataUrl = await readFileAsDataUrl(f);
        } else if (isCode) {
          textContent = await readFileAsText(f);
        } else if (isVid) {
          dataUrl = URL.createObjectURL(f);
        }

        processed.push({
          name: f.name,
          type: f.type || (isCode ? "text/plain" : isVid ? "video/mp4" : "application/octet-stream"),
          url: dataUrl || URL.createObjectURL(f),
          size: f.size,
          file: f,
          extractedText: textContent || undefined,
          isImage: isImg,
          isVideo: isVid,
          isCode: isCode,
        });
      }

      setAttachments((prev) => [...prev, ...processed]);
    } finally {
      setIsUploadingFiles(false);
    }
  };

  // Suporte a colar imagens diretamente do Clipboard (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!isUploadEnabled) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      processFiles(imageFiles);
    }
  };

  // Envio de mensagem com upload seguro de anexos
  const handleSend = async (overrideText?: string) => {
    const text = (overrideText || promptInput).trim();
    if (!text && attachments.length === 0) return;
    if (isStreaming) return;

    const isModelFree =
      selectedModel.endsWith(":free") ||
      selectedModel === "openrouter/free" ||
      selectedModel.includes(":free") ||
      currentModelMeta?.badge?.toLowerCase().includes("grátis") ||
      currentModelMeta?.badge?.toLowerCase().includes("gratuito");

    if (!isUnlimited && totalCredits <= 0 && !isModelFree) {
      setCreditModalOpen(true);
      return;
    }

    // Se estiver gravando voz, para antes de enviar
    if (isRecordingVoice) {
      speechRecognitionRef.current?.stop();
      setIsRecordingVoice(false);
    }

    try {
      // 1. Processar upload para Convex Storage de imagens e arquivos
      const finalAttachments = await Promise.all(
        attachments.map(async (a) => {
          let storageId = a.storageId;
          let finalUrl = a.url;

          if (a.file && !storageId) {
            try {
              const uploadUrl = await generateUploadUrl();
              const uploadRes = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": a.type || "application/octet-stream" },
                body: a.file,
              });
              if (uploadRes.ok) {
                const resJson = await uploadRes.json();
                if (resJson.storageId) {
                  storageId = resJson.storageId;
                }
              }
            } catch (upErr) {
              console.warn("Falha no upload para Convex Storage, mantendo Data URL:", upErr);
            }
          }

          return {
            type: (a.isImage ? "image" : a.isVideo ? "video" : a.isCode ? "code" : "document") as "image" | "video" | "document" | "code" | "audio",
            url: finalUrl,
            storageId,
            name: a.name,
            mimeType: a.type,
            sizeBytes: a.size,
            extractedText: a.extractedText,
          };
        })
      );

      // 2. Salvar no Convex de forma otimista
      await saveUserMessage({
        conversationId,
        content: text,
        attachments: finalAttachments.length > 0 ? finalAttachments : undefined,
      });

      // 3. Limpar input e disparar stream com o AI SDK
      setPromptInput("");
      setAttachments([]);
      setIsExpandedPrompt(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      await sendMessage({
        text,
      });
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  // Submissão ao teclar Enter (sem Shift)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-redimensionamento do textarea
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPromptInput(e.target.value);
    if (!isExpandedPrompt) {
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 260)}px`;
    }
  };

  // Upload de arquivos via seletor
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
    e.target.value = "";
  };

  // Drag and Drop de arquivos
  const handleDragOver = (e: DragEvent) => {
    if (!isUploadEnabled) return;
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    if (!isUploadEnabled) return;
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: DragEvent) => {
    if (!isUploadEnabled) return;
    e.preventDefault();
    setIsDraggingFile(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Exclusão de Mensagem Individual
  const handleConfirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    setIsDeletingMessage(true);
    try {
      await deleteMessageMutation({ messageId: messageToDelete });
      setMessageToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir mensagem:", err);
    } finally {
      setIsDeletingMessage(false);
    }
  };

  // Ação Direct-to-Studio: cria tarefa de cena
  const handleCreateSceneTask = async (sceneText: string) => {
    try {
      const titleMatch = sceneText.match(/(?:SCENE|CENA|EXT\.|INT\.)[^\n]+/i);
      const title = titleMatch ? titleMatch[0].trim() : "Cena Criada no Kriativa Muse";

      await createTask({
        text: `[Cena Estúdio] ${title}`,
      });

      setTaskNotice(`Cena "${title}" adicionada com sucesso ao seu Studio!`);
      setTimeout(() => setTaskNotice(null), 4000);
    } catch (err) {
      console.error("Erro ao criar tarefa de cena:", err);
    }
  };

  // Abrir artefato no Split Canvas
  const handleOpenArtifact = (artifact: { title: string; content: string; language: string }) => {
    setActiveArtifact(artifact);
    setIsCanvasOpen(true);
  };

  // Ações do Menu Contextual de Seleção na Resposta da IA
  const handleInsertSelectionToPrompt = (quoteText: string) => {
    setPromptInput((prev) => `${prev ? `${prev}\n\n` : ""}${quoteText}`);
    textareaRef.current?.focus();
  };

  const handleRewriteSelection = (selectedSnippet: string) => {
    const prompt = `Por favor, reescreva este trecho com mais riqueza, impacto dramático e detalhes aprofundados:\n\n> "${selectedSnippet}"`;
    setPromptInput(prompt);
    textareaRef.current?.focus();
  };

  const handleExplainSelection = (selectedSnippet: string) => {
    const prompt = `Por favor, explique detalhadamente o significado, contexto e relevância deste trecho:\n\n> "${selectedSnippet}"`;
    setPromptInput(prompt);
    textareaRef.current?.focus();
  };

  // Mensagem ativa do assistente (durante streaming e até sincronizar no banco Convex)
  const lastSdkAssistant = useMemo(() => {
    const last = messages[messages.length - 1];
    if (last && last.role === "assistant") {
      let reasoning = "";
      let text = "";
      if (last.parts && Array.isArray(last.parts)) {
        for (const p of last.parts) {
          if (p.type === "reasoning") reasoning += p.text || "";
          if (p.type === "text") text += p.text || "";
          if ((p as any).type === "tool-invocation") {
            const inv = (p as any).toolInvocation;
            if (
              inv &&
              (inv.toolName === "generate_video" ||
                inv.toolName === "edit_video" ||
                inv.toolName === "generate_image" ||
                inv.toolName === "edit_image")
            ) {
              const directiveJson = JSON.stringify({ action: inv.toolName, ...inv.args }, null, 2);
              if (!text.includes(inv.toolName)) {
                text += `\n\n\`\`\`json:studio-directive\n${directiveJson}\n\`\`\``;
              }
            }
          }
        }
      }
      if (!text && (last as any).content) {
        text = (last as any).content;
      }
      return {
        id: last.id,
        reasoning,
        text,
      };
    }
    return null;
  }, [messages]);

  // Verifica se a última resposta do assistente já foi persistida e refletida em dbMessages
  const isLastAssistantInDb = useMemo(() => {
    if (!lastSdkAssistant || !lastSdkAssistant.text) return true;
    const lastDb = dbMessages[dbMessages.length - 1];
    if (lastDb && lastDb.role === "assistant") {
      if (lastDb.content.trim() === lastSdkAssistant.text.trim()) {
        return true;
      }
      if (
        lastDb.content.length > 0 &&
        Math.abs(lastDb.content.length - lastSdkAssistant.text.length) < 5
      ) {
        return true;
      }
    }
    return false;
  }, [lastSdkAssistant, dbMessages]);

  const showActiveResponse = (isStreaming || !isLastAssistantInDb) && Boolean(lastSdkAssistant);

  const modeConfig: Record<
    StudioMode,
    { label: string; shortLabel: string; icon: string; description: string }
  > = {
    general: {
      label: "Geral & Multipropósito",
      shortLabel: "Geral",
      icon: "⚡",
      description: "Programação, redação, análise, raciocínio lógico e soluções",
    },
    director: {
      label: "Diretor de Cinema",
      shortLabel: "Diretor",
      icon: "🎬",
      description: "Decupagem cinematográfica, enquadramentos e ritmo dramático",
    },
    screenwriter: {
      label: "Roteirista Pro",
      shortLabel: "Roteiro",
      icon: "✍️",
      description: "Estrutura Master Scene, diálogos verossímeis e beats dramáticos",
    },
    developer: {
      label: "Engenharia de Software",
      shortLabel: "Código",
      icon: "💻",
      description: "TypeScript, React, Shaders GLSL, WebGL e arquitetura",
    },
    art_director: {
      label: "Direção de Arte & Luz",
      shortLabel: "Arte",
      icon: "🎨",
      description: "Iluminação dramática, paletas cromáticas e estética",
    },
  };

  const handleNewChat = async () => {
    try {
      const newId = await createConversation({
        title: "Nova Conversa",
        activeModel: selectedModel,
        provider: currentProvider,
        systemPromptPreset: mode,
      });
      router.push(`/chat/${newId}`);
    } catch (err) {
      console.error("Erro ao criar nova conversa:", err);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex h-full min-h-0 flex-1 min-w-0 bg-[#050507] text-[#F8FAFC] overflow-hidden relative selection:bg-[#FF5500] selection:text-white"
    >
      {/* Overlay de Drag and Drop de Arquivos */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#07080F]/90 backdrop-blur-md border-2 border-dashed border-[#FF5500] pointer-events-none animate-in fade-in duration-150">
          <UploadCloud className="h-16 w-16 text-[#FF5500] animate-bounce mb-3" />
          <p className="text-base font-semibold text-white">Solte seus arquivos aqui para anexar</p>
          <p className="text-xs text-neutral-400 mt-1">Imagens, vídeos, roteiros, PDFs e códigos</p>
        </div>
      )}

      {/* Menu Contextual Flutuante ao Selecionar Texto na Resposta */}
      <ContextualSelectionMenu
        containerRef={messagesContainerRef}
        onInsertToPrompt={handleInsertSelectionToPrompt}
        onRewriteSelection={handleRewriteSelection}
        onExplainSelection={handleExplainSelection}
      />

      {/* Coluna Central do Chat */}
      <div className="flex flex-col flex-1 min-w-0 h-full relative">
        {/* Header Superior Limpo Estilo Claude & OpenAI */}
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-3 sm:px-6 bg-[#07080D]/90 backdrop-blur-xl z-20 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Botão de abrir menu lateral no Mobile */}
            <button
              onClick={openMobileSidebar}
              className="md:hidden p-2 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Abrir histórico de conversas"
            >
              <Menu className="size-4" />
            </button>

            {/* Seletor de Modelo Interativo Estilo Claude/ChatGPT */}
            <div className="relative" ref={modelDropdownRef}>
              <button
                type="button"
                onClick={() => !isModelForcedByAdmin && setIsModelDropdownOpen(!isModelDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs text-white transition-all shadow-sm ${
                  isModelForcedByAdmin
                    ? "bg-white/[0.02] border-white/10 opacity-90 cursor-default"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20 cursor-pointer"
                }`}
                title={
                  isModelForcedByAdmin
                    ? "Modelo gerenciado pelo Administrador da plataforma"
                    : "Trocar motor de inteligência artificial"
                }
              >
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold tracking-tight truncate max-w-[130px] sm:max-w-[200px]">
                  {currentModelMeta?.displayName?.split(" (")[0] || selectedModel.split("/").pop()}
                </span>
                {isModelForcedByAdmin ? (
                  <Lock className="size-3 text-neutral-400 ml-0.5" />
                ) : (
                  <ChevronDown className={`size-3 text-neutral-400 transition-transform ${isModelDropdownOpen ? "rotate-180" : ""}`} />
                )}
              </button>

              {/* Dropdown de Modelos */}
              {isModelDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0D0E17] border border-white/10 shadow-2xl p-2 z-50 space-y-1 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Motores de Inteligência Artificial
                  </div>
                  {availableModels.map((m) => {
                    const isSelected = m.modelId === selectedModel;
                    return (
                      <button
                        key={m.modelId}
                        type="button"
                        onClick={() => {
                          setSelectedModel(m.modelId);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#FF5500]/15 text-[#FF5500] font-semibold border border-[#FF5500]/30"
                            : "text-neutral-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="truncate font-medium">{m.displayName}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {m.provider === "runpod" ? "Nó Dedicado" : "OpenRouter Gateway"}
                          </span>
                        </div>
                        {isSelected && <Check className="size-3.5 text-[#FF5500] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Seletor de Modo / Persona */}
            <div className="relative hidden sm:block" ref={personaDropdownRef}>
              <button
                type="button"
                onClick={() => setIsPersonaDropdownOpen(!isPersonaDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer"
                title="Alternar persona de resposta"
              >
                <span>{modeConfig[mode].icon}</span>
                <span className="font-medium text-[11px]">{modeConfig[mode].shortLabel}</span>
                <ChevronDown className="size-3 text-neutral-400" />
              </button>

              {isPersonaDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-[#0D0E17] border border-white/10 shadow-2xl p-1.5 z-50 space-y-1 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                  {(Object.keys(modeConfig) as StudioMode[]).map((key) => {
                    const cfg = modeConfig[key];
                    const isSelected = mode === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setMode(key);
                          setIsPersonaDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#FF5500]/15 text-[#FF5500] font-semibold"
                            : "text-neutral-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {webSearchEnabled && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-semibold font-mono">
                <Globe className="size-2.5" /> Web
              </span>
            )}
          </div>

          {/* Atalhos Rápidos da Barra Superior */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Botão Nova Conversa */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleNewChat}
              className="h-8.5 rounded-xl border-white/10 bg-white/[0.03] text-xs text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.06] gap-1.5 shadow-sm cursor-pointer"
              title="Iniciar nova conversa limpa"
            >
              <Plus className="size-3.5 text-[#FF5500]" />
              <span className="hidden sm:inline">Nova</span>
            </Button>

            {/* Bíblia de Produção (Lorebook) */}
            {isLorebookEnabled && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsLorebookOpen(true)}
                className="h-8.5 rounded-xl border-white/10 bg-white/[0.03] text-xs text-neutral-300 hover:text-white hover:border-[#FF5500]/40 hover:bg-white/[0.06] gap-1.5 relative shadow-sm"
              >
                <BookOpen className="size-3.5 text-[#FF5500]" />
                <span className="hidden sm:inline">Bíblia</span>
                {loreEntries.length > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-[#FF5500] text-[9px] font-bold text-white font-mono">
                    {loreEntries.length}
                  </span>
                )}
              </Button>
            )}

            {/* Split Canvas Lateral */}
            {isCanvasEnabled && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCanvasOpen(!isCanvasOpen)}
                className={`h-8.5 rounded-xl border text-xs transition-all gap-1.5 shadow-sm ${
                  isCanvasOpen
                    ? "bg-[#FF5500]/15 border-[#FF5500] text-[#FF5500]"
                    : "border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <Columns className="size-3.5" />
                <span className="hidden sm:inline">Canvas</span>
              </Button>
            )}

            {/* Badge de Saldo / Ilimitado */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/10 px-3 py-1.5 text-xs font-mono text-neutral-300 shadow-sm">
              <Coins className="size-3.5 text-[#FF5500]" />
              <span className="font-semibold text-white">
                {isUnlimited ? "∞ VIP" : `${totalCredits} cr`}
              </span>
            </div>

            {/* Retorno ao Dashboard */}
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:border-[#FF5500]/50 hover:bg-white/[0.06] transition-all shadow-sm"
              title="Voltar ao Painel Dashboard Principal"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#FF5500]" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Notificação Temporária de Criação de Tarefas de Cena */}
        {taskNotice && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs text-emerald-400 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">
              <Clapperboard className="h-3.5 w-3.5 text-emerald-400" />
              {taskNotice}
            </span>
            <button
              onClick={() => setTaskNotice(null)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Erro de Requisição (se houver) */}
        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2.5 text-xs text-red-400 flex items-center gap-2 shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Erro na comunicação com o motor de inferência: {error.message || "Tente novamente."}</span>
          </div>
        )}

        {/* Área de Mensagens (Coluna Centralizada Estilo OpenAI/Claude) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin scrollbar-thumb-white/10 relative"
        >
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(255,85,0,0.06),transparent_70%)] pointer-events-none" />

          <div ref={messagesContainerRef} className="max-w-3xl sm:max-w-4xl mx-auto w-full space-y-6 relative z-10 pb-6">
            {dbMessages.length === 0 && !showActiveResponse ? (
              /* Tela Vazia / Boas-vindas Estilo OpenAI & Claude */
              <div className="mx-auto max-w-2xl py-12 text-center space-y-6 select-none animate-in fade-in zoom-in-95 duration-200">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5500] via-[#FF4500] to-[#CC3700] text-white shadow-[0_0_25px_rgba(255,85,0,0.35)] border border-white/20">
                  <Sparkles className="size-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                    Como posso ajudar você hoje?
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto">
                    Plataforma de inteligência artificial de alta precisão para código, redação, raciocínio lógico, pesquisa na web e criação multimodal.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                  <button
                    onClick={() => {
                      setMode("developer");
                      handleSend(
                        "Escreva um componente React com Tailwind v4 para um dashboard com gráficos e cards estatísticos interativos."
                      );
                    }}
                    className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 p-4 transition-all duration-200 text-left shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 mb-1.5 text-white text-xs font-semibold group-hover:text-[#FF5500] transition-colors">
                      <Code className="size-4 text-[#FF5500]" />
                      <span>Engenharia & Código</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      Crie componentes React, shaders GLSL ou resolva problemas de arquitetura.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setMode("screenwriter");
                      handleSend(
                        "Escreva um roteiro dramático Master Scene entre dois astronautas na Cratera de Gale quando o oxigênio atinge 5%."
                      );
                    }}
                    className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 p-4 transition-all duration-200 text-left shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 mb-1.5 text-white text-xs font-semibold group-hover:text-amber-400 transition-colors">
                      <FileText className="size-4 text-amber-400" />
                      <span>Redação & Roteiro</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      Roteiros cinematográficos, artigos persuasivos, ensaios ou resumos densos.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setWebSearchEnabled(true);
                      handleSend(
                        "Faça uma pesquisa detalhada em tempo real sobre os últimos avanços em modelos de geração de vídeo e IA em 2025."
                      );
                    }}
                    className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 p-4 transition-all duration-200 text-left shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 mb-1.5 text-white text-xs font-semibold group-hover:text-cyan-400 transition-colors">
                      <Globe className="size-4 text-cyan-400" />
                      <span>Pesquisa Web em Tempo Real</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      Consulte a internet ao vivo com fontes verificadas e links citados.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setMode("director");
                      handleSend(
                        "Gere uma decupagem cinematográfica com lentes anamórficas e proponha uma diretiva para geração de vídeo a partir de texto."
                      );
                    }}
                    className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 p-4 transition-all duration-200 text-left shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 mb-1.5 text-white text-xs font-semibold group-hover:text-[#FF5500] transition-colors">
                      <Film className="size-4 text-[#FF5500]" />
                      <span>Geração & Edição Multimodal</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      Gere ou transforme imagens e vídeos a partir de texto, fotos ou referências.
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Mensagens Históricas do Convex */}
                {dbMessages.map((msg) => {
                  const isUser = msg.role === "user";

                  return (
                    <div
                      key={msg._id}
                      className={`group relative flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-3xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-3 ${
                          isUser
                            ? "bg-white/[0.05] border border-white/10 text-white rounded-br-sm shadow-sm backdrop-blur-sm"
                            : "bg-white/[0.02] border border-white/[0.08] text-neutral-200 rounded-bl-sm w-full shadow-sm backdrop-blur-sm"
                        }`}
                      >
                        {/* Cabeçalho da Mensagem do Usuário com Botão de Excluir */}
                        {isUser && (
                          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-[10px] text-neutral-400 font-mono">
                            <span className="font-semibold text-neutral-300 uppercase tracking-wider">Você</span>
                            <button
                              onClick={() => setMessageToDelete(msg._id)}
                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-neutral-500 hover:text-red-400 transition-opacity"
                              title="Excluir mensagem"
                            >
                              <Trash2 className="size-3" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        )}

                        {/* Cabeçalho da Mensagem do Assistente com Ações */}
                        {!isUser && (
                          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-neutral-400 font-mono">
                            <div className="flex items-center gap-2 text-[#FF5500]">
                              <div className="size-5 rounded-md bg-gradient-to-br from-[#FF5500] to-[#CC3700] text-white flex items-center justify-center shadow-[0_0_8px_rgba(255,85,0,0.3)]">
                                <Sparkles className="size-3" />
                              </div>
                              <span className="font-bold text-white uppercase tracking-wider text-xs font-sans">
                                Kriativa AI
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyToClipboard(msg._id, msg.content)}
                                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                                title="Copiar resposta"
                              >
                                {copiedMessageId === msg._id ? (
                                  <Check className="size-3 text-emerald-400" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                                <span className="text-[10px]">Copiar</span>
                              </button>

                              <span className="text-white/20">•</span>

                              <button
                                onClick={() => setMessageToDelete(msg._id)}
                                className="flex items-center gap-1 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                                title="Excluir resposta"
                              >
                                <Trash2 className="size-3" />
                                <span className="text-[10px]">Excluir</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Bloco de Raciocínio (Thinking Accordion) */}
                        {msg.thoughtProcess && (
                          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-3 text-xs shadow-inner">
                            <button
                              onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                              className="flex w-full items-center justify-between text-[11px] font-mono text-amber-400 hover:text-amber-300 transition-colors"
                            >
                              <span className="flex items-center gap-1.5 font-medium">
                                <Clock className="size-3.5" />
                                Cadeia de Raciocínio Profundo
                              </span>
                              {isThinkingExpanded ? (
                                <ChevronUp className="size-3.5" />
                              ) : (
                                <ChevronDown className="size-3.5" />
                              )}
                            </button>

                            {isThinkingExpanded && (
                              <div className="mt-2 text-[11px] font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed border-t border-white/10 pt-2.5 max-h-60 overflow-y-auto">
                                {msg.thoughtProcess}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Texto Principal da Mensagem formatado com Markdown Real */}
                        {isUser ? (
                          <div className="whitespace-pre-wrap text-white font-sans leading-relaxed">
                            {msg.content}
                          </div>
                        ) : (
                          <div className="selection:bg-[#FF5500]/30 selection:text-white">
                            <MarkdownRenderer
                              content={msg.content}
                              onOpenArtifact={handleOpenArtifact}
                              onOpenImage={(url) => setLightboxImageUrl(url)}
                            />
                          </div>
                        )}

                        {/* Anexos da Mensagem */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2.5 pt-2 border-t border-white/10">
                            {msg.attachments.map((att, i) => (
                              <div key={i}>
                                {att.type === "image" ? (
                                  <div
                                    onClick={() => setLightboxImageUrl(att.url)}
                                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black/40 hover:border-[#FF5500] transition-all shadow-md"
                                    title="Clique para ampliar imagem"
                                  >
                                    <img
                                      src={att.url}
                                      alt={att.name}
                                      className="max-h-48 max-w-[240px] sm:max-w-xs object-cover rounded-xl transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-medium transition-opacity backdrop-blur-[2px]">
                                      <Eye className="size-4 text-[#FF5500]" />
                                      <span>Ampliar</span>
                                    </div>
                                  </div>
                                ) : att.type === "video" ? (
                                  <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/60 p-2 shadow-md max-w-[280px] sm:max-w-xs">
                                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-neutral-300 font-mono">
                                      <Video className="size-3 text-[#FF5500]" />
                                      <span className="truncate max-w-[200px]">{att.name}</span>
                                    </div>
                                    <video
                                      src={att.url}
                                      controls
                                      className="max-h-48 w-full object-contain rounded-lg bg-black"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-neutral-200 shadow-sm hover:border-white/20 transition-colors">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] shrink-0">
                                      {att.type === "code" ? (
                                        <FileCode className="size-4" />
                                      ) : (
                                        <FileText className="size-4" />
                                      )}
                                    </div>
                                    <div className="flex flex-col min-w-0 pr-1">
                                      <span className="font-medium text-white truncate max-w-[180px]">
                                        {att.name}
                                      </span>
                                      <span className="text-[10px] text-neutral-400 font-mono">
                                        {(att.sizeBytes / 1024).toFixed(1)} KB • {att.type === "code" ? "Código" : "Documento"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Ações Rápidas na Resposta da IA */}
                        {!isUser && msg.content && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCreateSceneTask(msg.content)}
                              className="h-7 text-[11px] rounded-xl border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.08] text-neutral-300 hover:text-white gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Clapperboard className="size-3 text-[#FF5500]" />
                              🎬 Criar Cenas no Estúdio
                            </Button>

                            {isCanvasEnabled && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleOpenArtifact({
                                    title: "Artefato da Resposta",
                                    content: msg.content,
                                    language: "markdown",
                                  })
                                }
                                className="h-7 text-[11px] rounded-xl border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.08] text-neutral-300 hover:text-white gap-1.5 cursor-pointer shadow-sm"
                              >
                                <Columns className="size-3 text-cyan-400" />
                                📝 Abrir no Split Canvas
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Mensagem Ativa do Assistente (Streaming ou Aguardando Persistência no Banco) */}
                {showActiveResponse && lastSdkAssistant && (
                  <div className="flex flex-col items-start">
                    <div className="max-w-3xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-3 bg-white/[0.02] border border-white/[0.08] text-neutral-200 rounded-bl-sm w-full shadow-sm backdrop-blur-sm">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-neutral-400 font-mono">
                        <div className="flex items-center gap-2 text-[#FF5500]">
                          <div className="size-5 rounded-md bg-gradient-to-br from-[#FF5500] to-[#CC3700] text-white flex items-center justify-center shadow-[0_0_8px_rgba(255,85,0,0.3)]">
                            <Sparkles className={`size-3 ${isStreaming ? "animate-spin" : ""}`} />
                          </div>
                          <span className="font-bold text-white uppercase tracking-wider text-xs font-sans">
                            Kriativa AI {isStreaming ? "(Gerando...)" : ""}
                          </span>
                        </div>
                        {isStreaming && (
                          <span className="font-mono text-[10px] text-neutral-400">
                            {thinkingTime}s
                          </span>
                        )}
                      </div>

                      {/* Bloco de Raciocínio em Streaming */}
                      {lastSdkAssistant.reasoning && (
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-3 text-xs shadow-inner">
                          <div className="flex w-full items-center justify-between text-[11px] font-mono text-amber-400">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className={`size-3.5 ${isStreaming ? "animate-spin" : ""}`} />
                              {isStreaming ? `Pensando em tempo real... (${thinkingTime}s)` : "Cadeia de Raciocínio"}
                            </span>
                          </div>
                          <div className="mt-2 text-[11px] font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed border-t border-white/10 pt-2 max-h-48 overflow-y-auto">
                            {lastSdkAssistant.reasoning}
                          </div>
                        </div>
                      )}

                      {/* Texto em Streaming com Markdown */}
                      {lastSdkAssistant.text ? (
                        <div>
                          <MarkdownRenderer
                            content={lastSdkAssistant.text}
                            onOpenArtifact={handleOpenArtifact}
                            onOpenImage={(url) => setLightboxImageUrl(url)}
                          />
                          {isStreaming && (
                            <span className="inline-block w-2 h-4 ml-1 bg-[#FF5500] animate-pulse align-middle" />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-500 text-xs py-2">
                          <span className="h-2 w-2 rounded-full bg-[#FF5500] animate-ping" />
                          <span>Conectando e processando resposta...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Botão Flutuante de Auto-Scroll */}
        {showAutoScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-32 right-8 z-20 flex items-center gap-1.5 rounded-full bg-[#FF5500] px-3 py-1.5 text-xs font-medium text-white shadow-xl hover:bg-[#E04000] transition-transform active:scale-95"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            <span>Rolar para o final</span>
          </button>
        )}

        {/* Console de Prompt Flutuante com Linha Principal Unificada */}
        <div className="p-2 sm:p-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-[#050507] via-[#050507]/95 to-transparent shrink-0">
          <div
            className={`mx-auto max-w-4xl rounded-2xl sm:rounded-3xl border bg-[#0C0D15]/95 p-3 sm:p-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-200 relative ${
              isExpandedPrompt
                ? "border-[#FF5500]/60 ring-2 ring-[#FF5500]/15 shadow-[0_0_35px_rgba(255,85,0,0.12)]"
                : "border-white/10 hover:border-white/20 focus-within:border-[#FF5500]/50"
            }`}
          >
            {/* Cabeçalho do Modo Estúdio Expandido (quando ativado via menu +) */}
            {isExpandedPrompt && (
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#FF5500]/15 text-[#FF5500] font-semibold text-[11px] border border-[#FF5500]/30 font-mono">
                    <Maximize2 className="size-3" />
                    Modo Estúdio Expandido
                  </span>
                  <span className="text-[11px] text-neutral-400 hidden sm:inline">
                    Espaço livre para roteiros, códigos e textos extensos
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {promptInput.length.toLocaleString("pt-BR")} carac. • ~{Math.ceil(promptInput.length / 3.8).toLocaleString("pt-BR")} tokens
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsExpandedPrompt(false)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Recolher para tamanho padrão"
                  >
                    <Minimize2 className="size-3" />
                    <span className="hidden sm:inline">Recolher</span>
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Arquivos Anexados com Pré-Visualização Rica */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2.5 mb-2.5 border-b border-white/10 max-h-36 overflow-y-auto">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="group relative flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 p-1.5 pr-2.5 text-xs text-neutral-200 shadow-sm hover:border-white/20 transition-colors"
                  >
                    {file.isImage ? (
                      <div className="relative size-9 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : file.isVideo ? (
                      <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                        <Video className="size-4" />
                      </div>
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] shrink-0">
                        {file.isCode ? (
                          <FileCode className="size-4" />
                        ) : (
                          <FileText className="size-4" />
                        )}
                      </div>
                    )}

                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="truncate max-w-[130px] sm:max-w-[180px] font-medium text-white text-[11px]">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {(file.size / 1024).toFixed(1)} KB {file.isCode ? "• Código" : file.isImage ? "• Imagem" : file.isVideo ? "• Vídeo" : "• Doc"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="ml-auto size-5 flex items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Remover anexo"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}

                {isUploadingFiles && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 bg-white/5 rounded-xl font-mono">
                    <Loader2 className="size-3.5 animate-spin text-[#FF5500]" />
                    <span>Lendo arquivos...</span>
                  </div>
                )}
              </div>
            )}

            {/* Indicador de Gravação de Voz Ativa */}
            {isRecordingVoice && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 animate-pulse font-mono">
                <span className="size-2 rounded-full bg-red-500" />
                <span className="font-medium">Ouvindo sua voz... Fale normalmente (transcrição ao vivo em português)</span>
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className="ml-auto text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-lg font-semibold hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Parar
                </button>
              </div>
            )}

            {/* Input Invisível para Upload de Arquivos */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,video/*,.txt,.md,.json,.csv,.js,.ts,.tsx,.jsx,.py,.html,.css,.sql,.yaml,.yml,.xml,.rs,.go,.java,.c,.cpp"
              className="hidden"
            />

            {/* LINHA 1 (SUPERIOR): Textarea Auto-Expansível em Largura Total */}
            <div className="w-full relative px-1 pt-1">
              <textarea
                ref={textareaRef}
                value={promptInput}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={
                  mode === "general"
                    ? "Pergunte algo, gere imagens/vídeos ou peça uma análise de código..."
                    : `Escreva sua mensagem em modo ${modeConfig[mode].label}... (Enter para enviar, Shift+Enter para nova linha)`
                }
                rows={isExpandedPrompt ? 10 : 1}
                className={`w-full resize-none bg-transparent text-sm sm:text-base text-white placeholder:text-neutral-500 outline-none leading-relaxed transition-all scrollbar-thin scrollbar-thumb-white/10 ${
                  isExpandedPrompt
                    ? "min-h-[220px] max-h-[420px] font-mono sm:font-sans"
                    : "min-h-[42px] max-h-[260px]"
                }`}
              />
            </div>

            {/* LINHA 2 (INFERIOR): Barra de Ferramentas / Controles estilo Claude 3.7 & ChatGPT */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06] mt-1">
              {/* Controles da Esquerda: Menu +, Anexo Direto, Web Search, Raciocínio, Persona */}
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                {/* Botão + com Menu Popup Desdobrável */}
                <div className="relative shrink-0" ref={plusMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                    className={`size-8 sm:size-8.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isPlusMenuOpen || webSearchEnabled
                        ? "bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/25"
                        : "bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08]"
                    }`}
                    title="Menu de recursos (+ Anexo, Web, Persona, Raciocínio, Modelo)"
                  >
                    <Plus className={`size-4 transition-transform duration-200 ${isPlusMenuOpen ? "rotate-45" : ""}`} />
                  </button>

                  {/* Dropdown Popup do Botão + */}
                  {isPlusMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-3 w-72 sm:w-80 rounded-2xl bg-[#0D0E17] border border-white/10 shadow-2xl p-3 z-50 space-y-2 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                      {/* Opção 1: Anexar Arquivo, Foto ou Vídeo */}
                      {isUploadEnabled && (
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setIsPlusMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-colors cursor-pointer group"
                        >
                          <div className="size-8 rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center text-[#FF5500] group-hover:scale-105 transition-transform shrink-0">
                            <Paperclip className="size-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-white">Anexar Mídia ou Arquivo</span>
                            <span className="text-[10px] text-neutral-400 truncate">Fotos, vídeos para animar, documentos ou Ctrl+V</span>
                          </div>
                        </button>
                      )}

                      {/* Opção 2: Pesquisa Web em Tempo Real */}
                      <button
                        type="button"
                        onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                            webSearchEnabled ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-neutral-800 text-neutral-400"
                          }`}>
                            <Globe className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-white">Pesquisa Web ao Vivo</span>
                            <span className="text-[10px] text-neutral-400">Consultar a internet em tempo real</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          webSearchEnabled ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-neutral-800 text-neutral-500"
                        }`}>
                          {webSearchEnabled ? "Ativa" : "Off"}
                        </span>
                      </button>

                      <div className="h-px bg-white/10 my-1" />

                      {/* Opção 3: Persona Criativa */}
                      <div className="px-2 py-1">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                          Modo / Especialista
                        </label>
                        <div className="grid grid-cols-2 gap-1">
                          {(
                            [
                              { id: "general", label: "⚡ Geral" },
                              { id: "director", label: "🎬 Diretor" },
                              { id: "screenwriter", label: "✍️ Roteiro" },
                              { id: "developer", label: "💻 Código" },
                              { id: "art_director", label: "🎨 Arte" },
                            ] as const
                          ).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setMode(p.id);
                                setIsPlusMenuOpen(false);
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                                mode === p.id
                                  ? "bg-[#FF5500]/20 text-[#FF5500] font-semibold border border-[#FF5500]/40"
                                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-white/10 my-1" />

                      {/* Opção 4: Esforço de Raciocínio */}
                      <div className="px-2 py-1">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                          Raciocínio Profundo
                        </label>
                        <div className="flex gap-1">
                          {(
                            [
                              { id: "low", label: "⚡ Rápido" },
                              { id: "medium", label: "⚖️ Normal" },
                              { id: "high", label: "🧠 Mind" },
                            ] as const
                          ).map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setReasoningEffort(r.id)}
                              className={`flex-1 py-1 rounded-lg text-center text-[10px] transition-colors cursor-pointer ${
                                reasoningEffort === r.id
                                  ? "bg-[#FF5500] text-white font-medium shadow-sm"
                                  : "bg-black/40 border border-white/10 text-neutral-400 hover:text-white"
                              }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-px bg-white/10 my-1" />

                      {/* Opção 5: Modelo de IA */}
                      <div className="px-2 py-1">
                        <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                          <span>Motor de Inferência</span>
                          {isModelForcedByAdmin && <span className="text-amber-400 font-mono text-[9px]">🔒 Fixo pelo Admin</span>}
                        </label>
                        <select
                          value={selectedModel}
                          disabled={isModelForcedByAdmin}
                          onChange={(e) => {
                            setSelectedModel(e.target.value);
                            setIsPlusMenuOpen(false);
                          }}
                          className={`w-full h-8 rounded-lg bg-[#050507] border border-white/10 px-2 text-[11px] font-medium text-neutral-200 outline-none focus:border-[#FF5500] transition-colors truncate ${
                            isModelForcedByAdmin ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-white/20"
                          }`}
                        >
                          {availableModels.map((m) => (
                            <option key={m.modelId} value={m.modelId}>
                              {m.displayName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="h-px bg-white/10 my-1" />

                      {/* Opção 6: Modo Estúdio Expandido */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsExpandedPrompt(!isExpandedPrompt);
                          setIsPlusMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Maximize2 className="h-3.5 w-3.5 text-[#FF5500]" />
                          {isExpandedPrompt ? "Recolher Editor" : "Modo Estúdio Expandido"}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {promptInput.length > 0 ? `${promptInput.length} carac.` : ""}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Botão Anexo Rápido */}
                {isUploadEnabled && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="size-8 sm:size-8.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Anexar arquivo, imagem ou vídeo"
                  >
                    <Paperclip className="size-4" />
                  </button>
                )}

                {/* Pill Rápida de Pesquisa Web */}
                <button
                  type="button"
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`flex items-center gap-1.5 h-8 px-2.5 rounded-xl border text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    webSearchEnabled
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm"
                      : "bg-white/[0.03] border-white/10 text-neutral-400 hover:text-neutral-200 hover:border-white/20"
                  }`}
                  title={webSearchEnabled ? "Pesquisa Web ativa (clique para desligar)" : "Ativar pesquisa web ao vivo"}
                >
                  <Globe className="size-3.5" />
                  <span className="text-[11px]">Web</span>
                  {webSearchEnabled && <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                </button>

                {/* Pill Rápida de Raciocínio (Mind / Normal / Rápido) */}
                <button
                  type="button"
                  onClick={() => {
                    const next = reasoningEffort === "low" ? "medium" : reasoningEffort === "medium" ? "high" : "low";
                    setReasoningEffort(next);
                  }}
                  className={`flex items-center gap-1.5 h-8 px-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer shrink-0 ${
                    reasoningEffort === "high"
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm"
                      : "bg-white/[0.03] border-white/10 text-neutral-400 hover:text-neutral-200 hover:border-white/20"
                  }`}
                  title={`Esforço de Raciocínio: ${reasoningEffort} (clique para alternar)`}
                >
                  <Brain className="size-3.5" />
                  <span className="text-[11px] font-mono">
                    {reasoningEffort === "high" ? "Mind" : reasoningEffort === "medium" ? "Normal" : "Rápido"}
                  </span>
                </button>

                {/* Pill de Modo / Especialista */}
                <button
                  type="button"
                  onClick={() => setIsPersonaDropdownOpen(!isPersonaDropdownOpen)}
                  className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:border-white/20 text-xs font-medium transition-colors cursor-pointer shrink-0"
                  title="Alternar modo de atuação"
                >
                  <span>{modeConfig[mode].icon}</span>
                  <span className="text-[11px]">{modeConfig[mode].shortLabel}</span>
                </button>
              </div>

              {/* Controles da Direita: Limpar, Ditado por Voz e Botão Enviar/Parar */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Botão Limpar Texto */}
                {promptInput.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPromptInput("");
                      if (textareaRef.current) {
                        textareaRef.current.style.height = "auto";
                      }
                    }}
                    className="size-8 sm:size-8.5 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Limpar texto do prompt"
                  >
                    <Eraser className="size-4" />
                  </button>
                )}

                {/* Botão de Microfone / Ditado por Voz */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`size-8 sm:size-8.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isRecordingVoice
                      ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30"
                      : "bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08]"
                  }`}
                  title={isRecordingVoice ? "Parar transcrição de voz" : "Ditado por voz (transcrição ao vivo em português)"}
                >
                  {isRecordingVoice ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                </button>

                {/* Botão Enviar ou Parar */}
                {isStreaming ? (
                  <Button
                    size="sm"
                    type="button"
                    onClick={stop}
                    className="h-8 sm:h-8.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white gap-1.5 font-bold text-xs uppercase tracking-wider animate-pulse cursor-pointer shadow-md shadow-red-600/20"
                    title="Parar resposta da IA"
                  >
                    <Square className="size-3.5 fill-white" />
                    <span className="hidden sm:inline">Parar</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => handleSend()}
                    disabled={!promptInput.trim() && attachments.length === 0}
                    className="h-8 sm:h-8.5 px-3.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#E64D00] hover:brightness-110 text-white gap-1.5 shadow-[0_0_15px_rgba(255,85,0,0.3)] font-bold text-xs uppercase tracking-wider cursor-pointer transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Enviar mensagem (Enter)"
                  >
                    <span className="hidden sm:inline">Enviar</span>
                    <Send className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Disclaimer Inferior estilo ChatGPT e Claude */}
          <p className="mt-2 text-center text-[10px] sm:text-[11px] text-neutral-500 font-sans tracking-wide">
            Kriativa AI pode cometer erros. Considere verificar informações críticas.
          </p>
        </div>
      </div>

      {/* Split Canvas Lateral Editável estilo Claude Artifacts */}
      {isCanvasEnabled && (
        <ChatCanvas
          conversationId={conversationId}
          isOpen={isCanvasOpen}
          onClose={() => setIsCanvasOpen(false)}
          onSendToChatPrompt={(text) => handleSend(text)}
          activeArtifact={activeArtifact}
        />
      )}

      {/* Gaveta da Bíblia de Produção (Lorebook) */}
      {isLorebookEnabled && (
        <LorebookDrawer
          conversationId={conversationId}
          isOpen={isLorebookOpen}
          onClose={() => setIsLorebookOpen(false)}
          onInjectIntoPrompt={(snippet) => {
            setPromptInput((prev) => `${prev ? `${prev}\n` : ""}${snippet}`);
            textareaRef.current?.focus();
          }}
        />
      )}

      {/* Modal 1: Confirmação de Exclusão de Mensagem */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-[#0C0D12] border border-red-500/30 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-red-500">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Excluir Mensagem?</h3>
                <p className="text-[11px] text-zinc-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Tem certeza de que deseja remover esta mensagem da conversa?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMessageToDelete(null)}
                disabled={isDeletingMessage}
                className="border-zinc-800 bg-[#14151B] text-zinc-300 hover:text-white text-xs h-8 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDeleteMessage}
                disabled={isDeletingMessage}
                className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 px-3 cursor-pointer"
              >
                {isDeletingMessage ? "Excluindo..." : "Confirmar Exclusão"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Saldo Insuficiente de Créditos */}
      {creditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-[#0C0D12] border border-[#FF5500]/30 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-[#FF5500]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20">
                <Coins className="h-4 w-4 text-[#FF5500]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Saldo Insuficiente</h3>
                <p className="text-[11px] text-zinc-400">Recarregue para continuar criando</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Você não possui créditos suficientes para gerar novas mensagens neste estúdio criativo.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreditModalOpen(false)}
                className="border-zinc-800 bg-[#14151B] text-zinc-300 hover:text-white text-xs h-8 cursor-pointer"
              >
                Fechar
              </Button>
              <Link href="/dashboard/credits">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#FF5500] to-[#E04000] hover:opacity-95 text-white text-xs h-8 px-3 cursor-pointer"
                >
                  Recarregar Créditos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Alerta de Incompatibilidade de Voz */}
      {voiceAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-[#0C0D12] border border-amber-500/30 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-500">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Mic className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Reconhecimento de Voz</h3>
                <p className="text-[11px] text-zinc-400">Recurso do navegador</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Seu navegador atual não suporta a Web Speech API para transcrição em tempo real. Recomendamos o Google Chrome, Edge ou Safari atualizados.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVoiceAlertModalOpen(false)}
                className="border-zinc-800 bg-[#14151B] text-zinc-300 hover:text-white text-xs h-8 cursor-pointer"
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Visualizador de Imagem Ampliada (Lightbox) */}
      {lightboxImageUrl && (
        <div
          onClick={() => setLightboxImageUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center cursor-default"
          >
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              <a
                href={lightboxImageUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700 text-xs text-zinc-300 hover:text-white hover:border-[#FF5500] transition-colors"
                title="Abrir imagem original em nova aba"
              >
                <Eye className="h-3.5 w-3.5 text-[#FF5500]" />
                <span>Abrir Original</span>
              </a>
              <button
                type="button"
                onClick={() => setLightboxImageUrl(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-900/90 border border-zinc-700 text-zinc-400 hover:text-white hover:border-red-500 transition-colors cursor-pointer"
                title="Fechar visualizador"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img
              src={lightboxImageUrl}
              alt="Visualização do anexo"
              className="max-h-[82vh] max-w-full rounded-2xl object-contain border border-zinc-800 shadow-2xl shadow-black/80"
            />
          </div>
        </div>
      )}
    </div>
  );
}
