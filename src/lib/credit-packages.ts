export const CREDIT_PACKAGES = [
  {
    id: "free",
    credits: 5,
    price: 0,
    label: "Zen Free",
    popular: false,
  },
  {
    id: "starter",
    credits: 20,
    price: 499, // $4.99
    label: "Starter",
    popular: false,
  },
  {
    id: "creator",
    credits: 100,
    price: 1200, // $12.00
    label: "Creator",
    popular: true,
  },
  {
    id: "pro",
    credits: 300,
    price: 2500, // $25.00
    label: "Pro",
    popular: false,
  },
] as const;

export type PackageId = (typeof CREDIT_PACKAGES)[number]["id"];
