"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { RiLeafLine, RiMailLine, RiLockLine, RiGoogleFill, RiEyeLine, RiEyeOffLine, RiArrowRightLine, RiSparklingLine } from "react-icons/ri";
import { signIn, signUp, signInWithGoogle } from "@/lib/auth";

type AuthMode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email, password);
        setSuccess("Account created! Check your email to confirm your account.");
      } else {
        await signIn(email, password);
        router.push("/");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-xl border border-border/30">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg glow">
              <RiLeafLine className="text-white text-2xl" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Zen<span className="text-primary italic">Wall</span>
              </h1>
              <p className="text-sm text-foreground/50 mt-1">
                {mode === "signin" ? "Welcome back" : "Create your account & get 5 free credits"}
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-secondary/40 rounded-2xl p-1 mb-6 gap-1">
            {(["signin", "signup"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                  mode === m
                    ? "bg-primary text-white shadow-md"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-border bg-card/50 hover:bg-secondary/40 hover:border-primary/30 transition-all font-semibold text-sm mb-5 group"
          >
            <RiGoogleFill className="text-lg text-red-500" />
            Continue with Google
            <RiArrowRightLine className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-foreground/40 font-medium">or</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="relative">
              <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-card/60 border border-border/50 rounded-2xl text-sm font-medium placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full pl-11 pr-12 py-3.5 bg-card/60 border border-border/50 rounded-2xl text-sm font-medium placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>

            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100"
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-primary bg-primary/10 px-4 py-2.5 rounded-xl border border-primary/20"
                >
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 glow"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <>
                  <RiSparklingLine />
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </>
              )}
            </button>
          </form>

          {/* Sign up nudge */}
          {mode === "signin" && (
            <p className="text-center text-xs text-foreground/40 mt-5">
              Don&apos;t have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">
                Sign up for free
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-center text-xs text-foreground/40 mt-5">
              By signing up, you get{" "}
              <span className="text-primary font-bold">5 free credits</span> to start generating.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
