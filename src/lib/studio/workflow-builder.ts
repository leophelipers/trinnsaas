import krea2Template from "./templates/image_krea2_turbo_t2i.api.json";
import fasth3I2vTemplate from "./templates/video_fastvideo_fasth3_i2v.api.json";
import fasth3T2vTemplate from "./templates/video_fastvideo_fasth3_t2v.api.json";
import ltx25Template from "./templates/video_ltx2_5_i2v.api.json";

export const RUNPOD_ENDPOINTS = {
  krea2_turbo: "9zxmy6gcet7j0g",
  fasth3_i2v: "5oveynpkl0scu3",
  fasth3_t2v_480p: "4a2r6rg0c4ehky",
  fasth3_t2v_720p: "4a2r6rg0c4ehky",
  ltx25_i2v: "zrhzl1ydzr50n8",
} as const;

export const HIGGSFIELD_MODELS = {
  seedance25_t2v: "bytedance/seedance-2.5/text-to-video",
} as const;

export type RunPodEngine = keyof typeof RUNPOD_ENDPOINTS;
export type HiggsfieldEngine = keyof typeof HIGGSFIELD_MODELS;
export type StudioEngine = RunPodEngine | HiggsfieldEngine;
export type StudioProvider = "runpod" | "higgsfield";

export function getEngineProvider(engine: StudioEngine): StudioProvider {
  if (engine in HIGGSFIELD_MODELS) {
    return "higgsfield";
  }
  return "runpod";
}

export interface WorkflowBuildParams {
  engine: StudioEngine;
  prompt: string;
  negativePrompt?: string;
  seed?: number;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  durationSeconds?: number;
  fps?: number;
  aspectRatio?: string;
  quality?: string;
  imageBase64?: string;
  lastFrameBase64?: string;
  loraConfig?: {
    name: string;
    strengthModel: number;
    strengthClip: number;
  };
}

export interface ExtractedMedia {
  url: string;
  isVideo: boolean;
  filename: string;
}

/**
 * Constrói payload formatado para a API oficial do Higgsfield (Seedance 2.5)
 */
export function buildHiggsfieldPayload(params: WorkflowBuildParams) {
  // Duração entre 4 e 30 segundos (default 5s)
  const duration = Math.min(30, Math.max(4, Math.round(params.durationSeconds || 5)));

  // Resolução compatível: 480p, 720p, 1080p
  let resolution = "720p";
  if (params.quality === "1080p" || params.quality === "4k") {
    resolution = "1080p";
  } else if (params.quality === "480p") {
    resolution = "480p";
  }

  // Aspect ratio compatível: 16:9, 4:3, 1:1, 3:4, 9:16, 21:9
  let aspectRatio = "16:9";
  if (params.aspectRatio) {
    if (params.aspectRatio === "9:16") aspectRatio = "9:16";
    else if (params.aspectRatio === "1:1") aspectRatio = "1:1";
    else if (params.aspectRatio === "4:3") aspectRatio = "4:3";
    else if (params.aspectRatio === "2.39:1" || params.aspectRatio === "21:9") aspectRatio = "21:9";
  }

  return {
    prompt: params.prompt,
    duration,
    resolution,
    aspect_ratio: aspectRatio,
    output_format: "mp4",
    generate_audio: true,
  };
}

/**
 * Constrói o payload JSON completo para submissão ao RunPod Serverless ComfyUI
 */
export function buildWorkflowPayload(params: WorkflowBuildParams) {
  const seed = params.seed ?? Math.floor(Math.random() * 2147483647);

  switch (params.engine) {
    case "krea2_turbo": {
      const wf = JSON.parse(JSON.stringify(krea2Template));
      // Nó 52: Positive prompt
      if (wf["52"]?.inputs) {
        wf["52"].inputs.text = params.prompt;
      }
      // Nó 63: Negative prompt
      if (wf["63"]?.inputs) {
        wf["63"].inputs.text = params.negativePrompt || "blurry, low quality, distorted, bad anatomy";
      }
      // Nó 61: KSampler
      if (wf["61"]?.inputs) {
        wf["61"].inputs.seed = seed;
        wf["61"].inputs.steps = params.steps || 8;
        wf["61"].inputs.cfg = params.cfgScale || 1.0;
      }
      // Nó 73: EmptyLatentImage
      if (wf["73"]?.inputs) {
        wf["73"].inputs.width = params.width || 1024;
        wf["73"].inputs.height = params.height || 1024;
      }

      return {
        input: {
          workflow: wf,
        },
      };
    }

    case "fasth3_i2v": {
      const wf = JSON.parse(JSON.stringify(fasth3I2vTemplate));
      const images: Array<{ name: string; image: string }> = [];

      if (params.imageBase64) {
        const cleanBase64 = params.imageBase64.startsWith("data:")
          ? params.imageBase64
          : `data:image/png;base64,${params.imageBase64}`;
        images.push({ name: "input_frame.png", image: cleanBase64 });
      }

      // Suporte a First Frame + Last Frame (Morphing)
      if (params.lastFrameBase64) {
        const cleanLastBase64 = params.lastFrameBase64.startsWith("data:")
          ? params.lastFrameBase64
          : `data:image/png;base64,${params.lastFrameBase64}`;
        images.push({ name: "last_frame.png", image: cleanLastBase64 });

        // Adiciona nó para Last Frame se existir
        wf["137"] = {
          class_type: "LoadImage",
          inputs: { image: "last_frame.png" },
        };
        if (wf["104"]?.inputs) {
          wf["104"].inputs.last_frame = ["137", 0];
        }
      }

      // Nó 104: Prompt de movimento e sonoplastia
      if (wf["104"]?.inputs) {
        wf["104"].inputs.prompt = params.prompt;
      }
      // Nó 15: Noise Seed
      if (wf["15"]?.inputs) {
        wf["15"].inputs.noise_seed = seed;
      }
      // Nó 111: Duração em segundos
      if (wf["111"]?.inputs) {
        wf["111"].inputs.value = Number(params.durationSeconds || 2.0);
      }

      return {
        input: {
          images,
          workflow: wf,
        },
      };
    }

    case "fasth3_t2v_480p":
    case "fasth3_t2v_720p": {
      const wf = JSON.parse(JSON.stringify(fasth3T2vTemplate));
      const is720p = params.engine === "fasth3_t2v_720p";

      // Nó 104: Prompt, Largura e Altura
      if (wf["104"]?.inputs) {
        wf["104"].inputs.prompt = params.prompt;
        wf["104"].inputs.width = is720p ? (params.width || 1344) : (params.width || 848);
        wf["104"].inputs.height = is720p ? (params.height || 768) : (params.height || 480);
      }
      // Nó 15: Noise Seed
      if (wf["15"]?.inputs) {
        wf["15"].inputs.noise_seed = seed;
      }
      // Nó 111: Duração
      if (wf["111"]?.inputs) {
        wf["111"].inputs.value = Number(params.durationSeconds || 3.0);
      }

      return {
        input: {
          workflow: wf,
        },
      };
    }

    case "ltx25_i2v": {
      const wf = JSON.parse(JSON.stringify(ltx25Template));
      const images: Array<{ name: string; image: string }> = [];

      if (params.imageBase64) {
        const cleanBase64 = params.imageBase64.startsWith("data:")
          ? params.imageBase64
          : `data:image/png;base64,${params.imageBase64}`;
        images.push({ name: "input_frame.png", image: cleanBase64 });
      }

      // Nó 376: Prompt descritivo de câmera e luz
      if (wf["376"]?.inputs) {
        wf["376"].inputs.value = params.prompt;
      }
      // Nó 339: Noise Seed
      if (wf["339"]?.inputs) {
        wf["339"].inputs.noise_seed = seed;
      }
      // Nó 373: Negative Prompt
      if (wf["373"]?.inputs) {
        wf["373"].inputs.text = params.negativePrompt || "blurry, low quality, distorted, bad anatomy";
      }
      // Nó 362: Duração em segundos
      if (wf["362"]?.inputs) {
        wf["362"].inputs.value = Math.round(params.durationSeconds || 5);
      }
      // Nó 361: Frame Rate
      if (wf["361"]?.inputs) {
        wf["361"].inputs.value = params.fps || 24;
      }

      return {
        input: {
          images,
          workflow: wf,
        },
      };
    }

    default:
      throw new Error(`Motor de renderização não suportado: ${params.engine}`);
  }
}

/**
 * Algoritmo universal de extração de mídia a partir da saída do ComfyUI no RunPod
 */
export function extractMediaFromOutput(output: any): ExtractedMedia | null {
  if (!output) return null;

  const items = output.videos || output.images || [];
  if (items.length === 0) return null;

  const first = items[0];
  const rawData: string = first.data || first.video || first.image || "";
  const filename: string = first.filename || "output_media";

  const isVideo = filename.endsWith(".mp4") || rawData.includes("video/mp4");

  let dataUri = rawData;
  if (!rawData.startsWith("data:")) {
    dataUri = isVideo
      ? `data:video/mp4;base64,${rawData}`
      : `data:image/png;base64,${rawData}`;
  }

  return { url: dataUri, isVideo, filename };
}

/**
 * Calcula o custo em USD e BRL com base na taxa de execução do RunPod Serverless ($1.10/h)
 */
export function calculateExecutionCost(executionTimeMs: number, usdToBrlRate = 5.80) {
  const seconds = (executionTimeMs || 0) / 1000;
  const costUsd = seconds * (1.10 / 3600);
  const costBrl = costUsd * usdToBrlRate;

  return {
    seconds: Math.round(seconds * 10) / 10,
    costUsd: Math.round(costUsd * 100000) / 100000,
    costBrl: Math.round(costBrl * 1000) / 1000,
  };
}
