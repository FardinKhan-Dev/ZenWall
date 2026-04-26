import { RiArrowLeftLine } from "react-icons/ri";
import Link from "next/link";

export default function PrivacyPage() {
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
            Privacy <span className="text-primary italic">Policy</span>
          </h1>
          <p className="text-muted-foreground">Last updated: April 24, 2026</p>
        </div>

        <div className="prose prose-invert prose-primary max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Data We Collect</h2>
            <p>
              We collect basic account information (Email, Name) through Supabase Auth to manage
              your credits and wallpaper history. We do not sell your personal data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Image Storage</h2>
            <p>
              Generated wallpapers are stored on Cloudinary. We maintain a database link between
              your user ID and your generated images so you can access your history across devices.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. Payment Security</h2>
            <p>
              All payment processing is handled securely by Stripe. ZenWall does not store your
              credit card information on our servers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Cookies</h2>
            <p>
              We use essential cookies to maintain your login session. No tracking or marketing
              cookies are used without your explicit consent.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
