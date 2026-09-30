import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fpPromise: Promise<Awaited<ReturnType<typeof FingerprintJS.load>>> | null =
  null;

/**
 * Obtém a assinatura única (hash) de hardware/navegador do dispositivo atual.
 * 100% gratuito e executado localmente via FingerprintJS Open Source.
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") {
    return "ssr_device";
  }

  try {
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }
    const fp = await fpPromise;
    const result = await fp.get();
    if (result && result.visitorId) {
      localStorage.setItem("trinn_fp_id", result.visitorId);
      return result.visitorId;
    }
  } catch (err) {
    console.warn(
      "Aviso ao carregar FingerprintJS (usando identificador persistente):",
      err
    );
  }

  // Fallback persistente caso o usuário bloqueie execução de canvas/scripts específicos
  let cached = localStorage.getItem("trinn_fp_id");
  if (!cached) {
    cached =
      "fp_" +
      Math.random().toString(36).slice(2) +
      Date.now().toString(36);
    localStorage.setItem("trinn_fp_id", cached);
  }
  return cached;
}
