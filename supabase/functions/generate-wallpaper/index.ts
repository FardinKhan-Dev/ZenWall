// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { generateImagen } from "./utils/gemini.ts";
// @ts-ignore
import { uploadToCloudinary } from "./utils/cloudinary.ts";
// @ts-ignore
import { checkAndDeductCredits, logWallpaperHistory } from "./utils/db.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // ── 1. Authenticate the request via JWT ───────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    // @ts-ignore
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    // @ts-ignore
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 2. Parse and validate the prompt ─────────────────────────────────────
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: "A valid prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 3. Admin client for privileged DB operations ──────────────────────────
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // @ts-ignore
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
    // @ts-ignore
    const CLOUDINARY_CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME")!;
    // @ts-ignore
    const CLOUDINARY_UPLOAD_PRESET = Deno.env.get("CLOUDINARY_UPLOAD_PRESET")!;

    // ── 4. Credit check & deduction ───────────────────────────────────────────
    await checkAndDeductCredits(supabaseAdmin, user.id);

    // ── 5. Generate image with Gemini Imagen ──────────────────────────────────
    const base64Image = await generateImagen(prompt.trim(), GEMINI_API_KEY);

    // ── 6. Upload to Cloudinary ───────────────────────────────────────────────
    const imageUrl = await uploadToCloudinary(
      base64Image,
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_UPLOAD_PRESET
    );

    // ── 7. Log to history ─────────────────────────────────────────────────────
    await logWallpaperHistory(supabaseAdmin, user.id, prompt.trim(), imageUrl);

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    const status = error?.message?.includes("Insufficient credits") ? 402 : 500;
    return new Response(
      JSON.stringify({ error: error?.message || "An unexpected error occurred" }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
