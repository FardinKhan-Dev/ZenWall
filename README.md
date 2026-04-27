# 🌌 ZenWall | Signature Atmospheric Noir Wallpapers

**ZenWall** is a premium, high-performance SaaS platform that leverages advanced AI to create minimalist, atmospheric noir wallpapers. Designed for focus and digital serenity, ZenWall transforms simple prompts into cinematic, high-definition masterpieces.

---

## 🚀 Key Features

*   **ZenAI Flux Engine**: Custom-tuned prompt engineering for "Signature Atmospheric Noir" aesthetics—wide-angle, high-contrast, and deep black backgrounds.
*   **Immersive Digital Vault**: A private user dashboard to sync, curate, and revisit your entire high-res art collection across devices.
*   **Cinematic Detail View**: High-definition viewer with ambient background glows and detailed prompt transparency.
*   **Stripe Payments**: Secure, one-time credit top-ups with full Stripe Checkout integration and webhook verification.
*   **Premium Security**: 
    *   Strict **Zod** validation on both client and edge functions.
    *   Multi-tier **Rate Limiting** to prevent API abuse and protect credits.
    *   **Atomic SQL Credits**: Thread-safe credit deduction directly in the database layer.
*   **Code Quality**: Automated testing with **Jest**, code formatting with **Prettier**, and strict linting with **ESLint**.

---

## 📸 Feature Showcases

### 1. Interactive Landing Page
> Atmospheric noir aesthetic with 3D scroll effects.
> ![Landing Page Showcase](/public/Screenshot.webp)

### 2. AI Generation Interface
> Simple, minimalist prompting with Zod-validated inputs.
> ![Generation Interface](/public/Screenshot_2.webp)

### 3. Private Collection Vault
> Manage your generated history with ease.
> ![Dashboard Vault](/public/ZenWall_Dashboard.webp)

### 4. Secure Stripe Payments
> Global payment processing for credit top-ups.
> *(Placeholder: [Stripe_Checkout.webp])*

### 5. Mobile-First Experience
> Fully responsive noir interface optimized for every screen size.
> 
> | Mobile Dashboard | Mobile Viewer |
> | :---: | :---: |
> | ![Mobile Screen 1](placeholder_mobile_1.webp) | ![Mobile Screen 2](placeholder_mobile_2.webp) |

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16+](https://nextjs.org/) (App Router & React Compiler)
*   **Database & Auth**: [Supabase](https://supabase.com/)
*   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Persistent Auth & Hydration)
*   **Payments**: [Stripe API](https://stripe.com/)
*   **AI Engine**: Hugging Face (FLUX.1-schnell)
*   **Image Pipeline**: [Cloudinary](https://cloudinary.com/) (Signed Uploads)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Styling**: Tailwind CSS 4.0
*   **Notifications**: [Sonner](https://sonner.emilkowal.ski/) (High-performance stacked toasts)
*   **Validation**: [Zod](https://zod.dev/)
*   **Testing**: [Jest](https://jestjs.io/) & React Testing Library
*   **Quality Control**: ESLint & Prettier

---

## 📦 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/zenwall.git
cd zenwall
npm install
```

### 2. Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
HUGGINGFACE_TOKEN=your_hf_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Run Quality Checks
```bash
npm run lint    # Check for code issues
npm run format  # Format code with Prettier
npm test        # Run Jest test suites
```

### 4. Start Development
```bash
npm run dev
```

---

## 🛡️ Production Readiness Checklist
- [x] Zod Input Sanitization (Client & Server)
- [x] Anti-Spam Rate Limiting (10s Cooldown)
- [x] Stripe Webhook Security Verification
- [x] SEO & Meta Tag Hardening
- [x] Terms & Privacy Compliance
- [x] Automated Jest Test Coverage

---

## 📄 License
MIT License - Created by **ZenWall Team**.
