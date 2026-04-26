/**
 * Generates an image using the Hugging Face Inference API.
 * Specifically targets the black-forest-labs/FLUX.1-schnell model.
 *
 * @param prompt - The text prompt describing the wallpaper
 * @param hfToken - Your Hugging Face Access Token
 * @returns Base64-encoded image bytes
 */
export async function generateImage(prompt: string, hfToken: string): Promise<string> {
  const modelId = "black-forest-labs/FLUX.1-schnell";
  const url = `https://router.huggingface.co/hf-inference/models/${modelId}`;

  const enhancedPrompt = `${prompt}. High-end editorial photography, luxury aesthetic, minimalist composition, 8k resolution, cinematic lighting, sophisticated textures.`;

  console.log(`Calling Hugging Face Inference API (${modelId})...`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: enhancedPrompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Hugging Face API Error:", errorText);

    if (response.status === 503) {
      throw new Error(
        "Hugging Face model is currently loading. Please try again in a few seconds."
      );
    }
    throw new Error(`Hugging Face API Error: ${response.status} - ${errorText}`);
  }

  // HF returns binary image data
  const arrayBuffer = await response.arrayBuffer();

  // Efficient binary to base64 conversion for Deno
  const uint8Array = new Uint8Array(arrayBuffer);
  const binary = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("");
  const base64 = btoa(binary);

  return base64;
}
