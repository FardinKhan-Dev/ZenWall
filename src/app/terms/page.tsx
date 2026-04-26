import { RiArrowLeftLine } from "react-icons/ri";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-32 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
        >
          <RiArrowLeftLine /> Back to Home
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Terms of <span className="text-primary italic">Service</span>
          </h1>
          <p className="text-muted-foreground">Last updated: April 24, 2026</p>
        </div>

        <div className="prose prose-invert prose-primary max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing ZenWall, you agree to be bound by these Terms of Service. If you do not
              agree, please do not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. AI-Generated Content</h2>
            <p>
              ZenWall provides a platform for generating images using artificial intelligence. You
              own the wallpapers you generate, but you must ensure your use cases comply with the
              safety guidelines of our AI providers (Hugging Face / black-forest-labs).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. Credits and Payments</h2>
            <p>
              All purchases of credits are final and non-refundable unless required by law. Credits
              do not have an expiration date as long as your account is active.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Prohibited Use</h2>
            <p>
              You may not use ZenWall to generate offensive, harmful, or illegal content. We reserve
              the right to terminate accounts that violate these guidelines.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
