/**
 * @param base64 - The base64-encoded image string from Gemini Imagen
 * @param cloudName - Your Cloudinary cloud name
 * @param uploadPreset - An unsigned Cloudinary upload preset
 * @returns The secure CDN URL of the uploaded image
 */
export async function uploadToCloudinary(
  base64: string,
  cloudName: string,
  uploadPreset: string
): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  // Convert base64 to a Blob, then append via FormData (modern, efficient approach)
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/png" });

  const formData = new FormData();
  formData.append("file", blob, "wallpaper.png");
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "ai-wallpapers");         // Organized folder in Cloudinary
  formData.append("quality", "auto");                 // Auto optimize quality
  formData.append("fetch_format", "auto");            // Serve WebP/AVIF where supported

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    // Note: Do NOT set Content-Type manually. The browser/Deno will
    // automatically set multipart/form-data with the correct boundary.
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary Upload Error: ${errorText}`);
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error("Cloudinary did not return a secure URL.");
  }

  return data.secure_url;
}
