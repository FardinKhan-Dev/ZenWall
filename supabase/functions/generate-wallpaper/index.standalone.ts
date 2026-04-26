// @ts-expect-error - Deno specific import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error - Deno specific import
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-expect-error - Deno specific import
import { z } from "https://esm.sh/zod@3.23.8";

/**
 * ZENWALL STANDALONE MASTER EDGE FUNCTION
 *
 * This file contains ALL logic (Hugging Face, Cloudinary, Database, and Validation)
 * in one single file for easy management and deployment.
 *
 * Features:
 * - Zod Input Validation
 * - 10s Rate Limiting
 * - Atomic Credit Deduction
 * - "Zen Black" Atmospheric Noir Prompt Engineering
 * - Signed Cloudinary Uploads
 */

// ── CONFIG & SCHEMAS ────────────────────────────────────────────────────────

const promptSchema = z.object({
  prompt: z.string().min(3).max(500),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "content-length, x-json",
};

// ── HELPER: HUGGING FACE IMAGE GENERATION ────────────────────────────────────

async function generateImage(prompt: string, hfToken: string): Promise<string> {
  const modelId = "black-forest-labs/FLUX.1-schnell";
  const url = `https://router.huggingface.co/hf-inference/models/${modelId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 503)
      throw new Error("AI Model is loading. Please try again in 5 seconds.");
    throw new Error(`AI Engine Error: ${response.status} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const binary = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary);
}

// ── HELPER: CLOUDINARY SIGNED UPLOAD ─────────────────────────────────────────

async function uploadToCloudinary(
  base64: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string
): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const timestamp = Math.round(Date.now() / 1000).toString();
  const folder = "ai-wallpapers";

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const encoder = new TextEncoder();
  const signatureString = `${paramsToSign}${apiSecret}`;
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const signature = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

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

  const response = await fetch(url, { method: "POST", body: formData });
  if (!response.ok) throw new Error(`Cloudinary Upload Error: ${await response.text()}`);

  const resData = await response.json();
  return resData.secure_url;
}

// ── HELPER: DATABASE OPERATIONS ──────────────────────────────────────────────

async function checkAndDeductCredits(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data, error } = await supabase.rpc("deduct_credit", { p_user_id: userId });
  if (error) throw new Error(`Credit check failed: ${error.message}`);
  if (data === null || data === undefined) throw new Error("Insufficient credits.");
  return data as number;
}

async function checkRateLimit(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data } = await supabase
    .from("wallpapers")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    const lastTime = new Date(data[0].created_at).getTime();
    const diff = Date.now() - lastTime;
    if (diff < 10000)
      throw new Error(`Please wait ${Math.ceil((10000 - diff) / 1000)}s before generating again.`);
  }
}

async function logWallpaperHistory(
  supabase: SupabaseClient,
  userId: string,
  prompt: string,
  imageUrl: string
) {
  const { error } = await supabase
    .from("wallpapers")
    .insert({ user_id: userId, prompt, image_url: imageUrl });
  if (error) throw new Error(`History log failed: ${error.message}`);
}

// ── MAIN SERVER HANDLER ───────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1. Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // 2. Validate
    const body = await req.json();
    const result = promptSchema.safeParse(body);
    if (!result.success) throw new Error("Invalid prompt (3-500 chars required).");
    const { prompt } = result.data;

    // 3. Security Check (Rate limit & Credits)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    await checkRateLimit(supabaseAdmin, user.id);
    await checkAndDeductCredits(supabaseAdmin, user.id);

    // 4. AI Generation
    // ZenWall Signature Style: Full Body Atmospheric Noir
    const zenPrompt = `A wide-angle, full body studio shot of a ${prompt.trim()}. The entire subject is visible within the frame, no cropping. Set against a solid, infinite pitch-black background. Cinematic atmospheric noir style, sharp rim lighting tracing the full silhouette, intense volumetric lighting, subtle ambient fog, deep high-contrast shadows. 8k resolution, ultra-detailed textures, professional automotive and wildlife photography, masterpiece quality.`;

    const base64Image = await generateImage(zenPrompt, Deno.env.get("HUGGINGFACE_TOKEN")!);

    // 5. Cloudinary Upload
    const imageUrl = await uploadToCloudinary(
      base64Image,
      Deno.env.get("CLOUDINARY_CLOUD_NAME")!,
      Deno.env.get("CLOUDINARY_API_KEY")!,
      Deno.env.get("CLOUDINARY_API_SECRET")!
    );

    // 6. Log History
    await logWallpaperHistory(supabaseAdmin, user.id, prompt.trim(), imageUrl);

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const error = err as Error;
    const status = error.message.includes("Insufficient credits")
      ? 402
      : error.message.includes("wait")
        ? 429
        : error.message.includes("Unauthorized")
          ? 401
          : 500;

    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
