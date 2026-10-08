/**
 * Utilitários de manipulação e compressão de imagem no browser
 * Reduz canvas para no máximo 1280px e dimensões múltiplas de 16px (exigência de tensores)
 * Mantém payload bem abaixo de 300KB, prevenindo estouro do limite de 1 MiB do Convex DB
 */
export async function compressImageFile(file: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        // Garante que largura e altura sejam múltiplos de 16 para estabilidade dos modelos ComfyUI
        width = Math.max(64, Math.floor(width / 16) * 16);
        height = Math.max(64, Math.floor(height / 16) * 16);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file instanceof Blob ? file : new Blob([file]));
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file instanceof Blob ? file : new Blob([file]));
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => resolve(file instanceof Blob ? file : new Blob([file]));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file instanceof Blob ? file : new Blob([file]));
    reader.readAsDataURL(file);
  });
}

/**
 * Converte um Blob de imagem para Base64 limpo (sem prefixo data:)
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.replace(/^data:image\/[a-z]+;base64,/, "");
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
