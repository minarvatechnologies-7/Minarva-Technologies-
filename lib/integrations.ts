export type IntegrationStatus = "not_configured" | "configured";

export const integrations = {
  ai: { name: "AI provider", env: "AI_API_KEY" },
  whatsapp: { name: "WhatsApp provider", env: "WHATSAPP_API_TOKEN" },
  email: { name: "Email provider", env: "EMAIL_API_KEY" },
  sms: { name: "SMS provider", env: "SMS_API_KEY" },
  payments: { name: "Payment provider", env: "PAYMENT_PROVIDER_KEY" },
  analytics: { name: "Analytics provider", env: "ANALYTICS_ID" },
} as const;

export function integrationStatus(env: string | undefined): IntegrationStatus {
  return env ? "configured" : "not_configured";
}
