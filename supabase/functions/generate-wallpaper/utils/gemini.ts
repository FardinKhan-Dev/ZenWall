// @ts-ignore
import { GoogleGenAI } from "https://esm.sh/@google/genai@0.7.0";

/**
 * @param prompt - The text prompt describing the wallpaper
 * @param apiKey - Your Google Gemini API key
 * @returns Base64-encoded PNG image bytes
 */
export async function generateImagen(prompt: string, apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateImages({
    model: "imagen-4.0-generate-001",
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: "image/png",
    },
  });

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;

  if (!imageBytes) {
    throw new Error("Gemini Imagen returned no image. Check your prompt or API quota.");
  }

  return imageBytes; // Already base64-encoded string
}
