// @ts-expect-error - Deno specific import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error - Deno specific import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-expect-error - Local import in Deno
import { generateImage } from "./utils/huggingface.ts";
// @ts-expect-error - Local import in Deno
import { uploadToCloudinary } from "./utils/cloudinary.ts";
// @ts-expect-error - Local import in Deno
import { checkAndDeductCredits, logWallpaperHistory, checkRateLimit } from "./utils/db.ts";
// @ts-expect-error - Deno specific import
import { z } from "https://esm.sh/zod@3.23.8";

const promptSchema = z.object({
  prompt: z.string().min(3).max(500),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "content-length, x-json",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Starting generation request...`);

  try {
    // ── 1. Authenticate ──────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized: Missing Authorization header");

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

    console.log(`[${requestId}] Authenticated user: ${user.id}`);

    // ── 2. Validate Prompt ───────────────────────────────────────────────────
    const body = await req.json();
    const result = promptSchema.safeParse(body);

    if (!result.success) {
      throw new Error("Invalid prompt. Must be between 3 and 500 characters.");
    }
    const { prompt } = result.data;

    // ── 3. Rate Limit & Credits ──────────────────────────────────────────────
    console.log(`[${requestId}] Checking rate limit and credits...`);
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Check rate limit (10s cooldown)
    await checkRateLimit(supabaseAdmin, user.id);

    // Deduct credit
    await checkAndDeductCredits(supabaseAdmin, user.id);

    // ── 4. AI Generation (Hugging Face Flux) ────────────────────────────────
    console.log(`[${requestId}] Calling Hugging Face (Flux.1 Schnell)...`);
    const HF_TOKEN = Deno.env.get("HUGGINGFACE_TOKEN")!;

    if (!HF_TOKEN) {
      throw new Error(
        "HUGGINGFACE_TOKEN is missing. Set it with 'supabase secrets set HUGGINGFACE_TOKEN=...'."
      );
    }

    // ZenWall Signature Style: Full Body Atmospheric Noir
    const zenPrompt = `A wide-angle, full body studio shot of a ${prompt.trim()}. The entire subject is visible within the frame, no cropping. Set against a solid, infinite pitch-black background. Cinematic atmospheric noir style, sharp rim lighting tracing the full silhouette, intense volumetric lighting, subtle ambient fog, deep high-contrast shadows. 8k resolution, ultra-detailed textures, professional automotive and wildlife photography, masterpiece quality.`;

    const base64Image = await generateImage(zenPrompt, HF_TOKEN);
    console.log(`[${requestId}] AI Generation complete.`);

    // ── 5. Cloudinary Upload ────────────────────────────────────────────────
    console.log(`[${requestId}] Uploading to Cloudinary...`);
    const CLOUDINARY_CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME")!;
    const CLOUDINARY_API_KEY = Deno.env.get("CLOUDINARY_API_KEY")!;
    const CLOUDINARY_API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET")!;

    const imageUrl = await uploadToCloudinary(
      base64Image,
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET
    );
    console.log(`[${requestId}] Cloudinary upload success: ${imageUrl}`);

    // ── 6. Log History ──────────────────────────────────────────────────────
    console.log(`[${requestId}] Logging to database history...`);
    await logWallpaperHistory(supabaseAdmin, user.id, prompt.trim(), imageUrl);

    console.log(`[${requestId}] Request finished successfully.`);
    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`[${requestId}] ERROR:`, error.message);
    const status = error?.message?.includes("Insufficient credits")
      ? 402
      : error?.message?.includes("Unauthorized")
        ? 401
        : 500;

    return new Response(
      JSON.stringify({ error: error?.message || "An unexpected error occurred" }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
