/**
 * Uploads a base64-encoded image to Cloudinary using a signed request.
 * This is the correct server-side approach — uses API_KEY + API_SECRET
 * to sign the upload, giving full control over folder, format, and quality.
 *
 * @param base64      - Raw base64 image bytes from ZenAI Engine
 * @param cloudName   - Your Cloudinary cloud name
 * @param apiKey      - Your Cloudinary API key
 * @param apiSecret   - Your Cloudinary API secret
 * @returns           - The secure CDN URL of the uploaded image
 */
export async function uploadToCloudinary(
  base64: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string
): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const timestamp = Math.round(Date.now() / 1000).toString();

  // Build the string to sign (must be sorted alphabetically)
  const folder = "ai-wallpapers";
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

  // Generate SHA-1 signature (Cloudinary expects SHA1(params + api_secret))
  const encoder = new TextEncoder();
  const signatureString = `${paramsToSign}${apiSecret}`;
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const signature = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Convert base64 → Blob → FormData (multipart — avoids base64 overhead)
  const byteCharacters = atob(base64);
  const byteArray = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: "image/png" });

  const formData = new FormData();
  formData.append("file", blob, "wallpaper.png");
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary Upload Error: ${errorText}`);
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error("Cloudinary did not return a secure URL.");
    }

    return data.secure_url;
  } catch (err: unknown) {
    const error = err as Error;
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Cloudinary upload timed out after 30 seconds.");
    }
    throw error;
  }
}
