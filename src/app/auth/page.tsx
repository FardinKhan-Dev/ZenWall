"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RiLeafLine,
  RiMailLine,
  RiLockLine,
  RiGoogleFill,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowRightLine,
  RiSparklingLine,
  RiUserLine,
} from "react-icons/ri";
import { signIn, signUp, signInWithGoogle } from "@/lib/auth";
import { z } from "zod";
import { toast } from "sonner";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First name is too short").optional(),
  lastName: z.string().min(2, "Last name is too short").optional(),
});

type AuthMode = "signin" | "signup";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/generate";
  const initialMode = (searchParams.get("mode") as AuthMode) || "signin";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = authSchema.safeParse({
      email,
      password,
      firstName: mode === "signup" ? firstName : undefined,
      lastName: mode === "signup" ? lastName : undefined,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        const data = await signUp(email, password, firstName, lastName);
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError("This email is already registered. Try signing in.");
          return;
        }
        toast.success("Account created!", {
          description: "Check your email to confirm your account.",
        });
      } else {
        await signIn(email, password);
        toast.success("Welcome back!", {
          description: "Sign in successful.",
        });
        router.push(redirectPath);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      toast.success("Google Sign-in successful!");
    } catch (err: unknown) {
      const error = err as Error;
      setError(error?.message || "Google sign-in failed.");
    }
  };

  return (
    <div className=" flex items-center justify-center px-4 pt-28 md:pt-0 relative overflow-hidden">
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
                suppressHydrationWarning
                onClick={() => {
                  setMode(m);
                }}
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
            suppressHydrationWarning
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-2xl border border-border bg-card/50 hover:bg-secondary/40 hover:border-primary/30 transition-all font-semibold text-sm mb-5 group"
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
            {mode === "signup" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="relative">
                      <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className={`w-full pl-11 pr-4 py-2.5 bg-card/60 border rounded-2xl text-sm font-medium placeholder:text-foreground/30 focus:outline-none transition-all ${fieldErrors.firstName ? "border-red-500/50 ring-2 ring-red-500/10" : "border-border/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"}`}
                      />
                    </div>
                    {fieldErrors.firstName && (
                      <p className="text-[10px] text-red-500 font-bold ml-2">
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className={`w-full px-4 py-2.5 bg-card/60 border rounded-2xl text-sm font-medium placeholder:text-foreground/30 focus:outline-none transition-all ${fieldErrors.lastName ? "border-red-500/50 ring-2 ring-red-500/10" : "border-border/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"}`}
                      />
                    </div>
                    {fieldErrors.lastName && (
                      <p className="text-[10px] text-red-500 font-bold ml-2">
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <div className="relative">
                <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-2.5 bg-card/60 border rounded-2xl text-sm font-medium placeholder:text-foreground/30 focus:outline-none transition-all ${fieldErrors.email ? "border-red-500/50 ring-2 ring-red-500/10" : "border-border/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"}`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[10px] text-red-500 font-bold ml-2">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="relative">
                <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className={`w-full pl-11 pr-12 py-2.5 bg-card/60 border rounded-2xl text-sm font-medium placeholder:text-foreground/30 focus:outline-none transition-all ${fieldErrors.password ? "border-red-500/50 ring-2 ring-red-500/10" : "border-border/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                >
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[10px] text-red-500 font-bold ml-2">{fieldErrors.password}</p>
              )}
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 mb-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              suppressHydrationWarning
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 glow"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
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
              <button
                suppressHydrationWarning
                onClick={() => setMode("signup")}
                className="text-primary font-semibold hover:underline"
              >
                Sign up for free
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-center text-xs text-foreground/40 mt-5">
              By signing up, you get <span className="text-primary font-bold">5 free credits</span>{" "}
              to start generating.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}
    >
      <AuthContent />
    </Suspense>
  );
}
