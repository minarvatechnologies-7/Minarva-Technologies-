export type IntegrationStatus = "not_configured" | "configured";

export const integrations = {
  ai: { name: "AI provider", env: "AI_PROVIDER_API_KEY" },
  whatsapp: { name: "WhatsApp provider", env: "WHATSAPP_ACCESS_TOKEN" },
  email: { name: "Email provider", env: "RESEND_API_KEY" },
  sms: { name: "SMS provider", env: "SMS_PROVIDER_API_KEY" },
  payments: { name: "Payment provider", env: "PAYMENT_PROVIDER_KEY" },
  analytics: { name: "Google Analytics", env: "NEXT_PUBLIC_GA_MEASUREMENT_ID" },
} as const;

export function integrationStatus(env: string | undefined): IntegrationStatus {
  return env ? "configured" : "not_configured";
}
