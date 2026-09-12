export const leadStatuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "SITE_SURVEY",
  "QUOTE_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
  "FOLLOW_UP",
] as const;

export const leadTemperatures = ["HOT", "WARM", "COLD"] as const;

export const serviceTicketStatuses = [
  "NEW",
  "ASSIGNED",
  "TECHNICIAN_ON_THE_WAY",
  "INSPECTION",
  "ESTIMATE_PENDING",
  "CUSTOMER_APPROVAL_PENDING",
  "WORK_IN_PROGRESS",
  "PARTS_REQUIRED",
  "COMPLETED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const leadSources = [
  "WEBSITE",
  "WHATSAPP",
  "PHONE",
  "GOOGLE",
  "GOOGLE_ADS",
  "FACEBOOK",
  "INSTAGRAM",
  "YOUTUBE",
  "REFERRAL",
  "DIRECT",
  "OTHER",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];
export type LeadTemperature = (typeof leadTemperatures)[number];
export type LeadSource = (typeof leadSources)[number];
export type ServiceTicketStatus = (typeof serviceTicketStatuses)[number];

export type ServiceSlug =
  | "computer-sales-service"
  | "cctv-installation"
  | "cctv-service"
  | "home-automation"
  | "gate-automation"
  | "solar-solutions"
  | "inverter-solutions"
  | "erp-software"
  | "website-development";
