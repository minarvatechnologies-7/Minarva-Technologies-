export type Qualification = {
  serviceSlug: string;
  category: "HOME" | "BUSINESS" | "GENERAL";
  intent: "INFORMATION" | "QUOTE" | "SERVICE" | "SITE_SURVEY";
  urgency: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  temperature: "HOT" | "WARM" | "COLD";
  questions: string[];
  nextAction: "SELF_SERVE" | "CALL" | "WHATSAPP" | "SITE_SURVEY" | "SALES_FOLLOW_UP";
};

const serviceHints: Record<string, string[]> = {
  "cctv-installation": ["cctv", "camera", "dvr", "nvr", "security"],
  "computer-sales-service": ["computer", "laptop", "desktop", "pc", "repair", "upgrade"],
  "home-automation": ["home automation", "smart home", "automation"],
  "gate-automation": ["gate automation", "automatic gate", "sliding gate"],
  "solar-solutions": ["solar", "panel", "inverter solar"],
  "inverter-solutions": ["inverter", "backup power", "ups"],
  "erp-software": ["erp", "billing software", "business software", "management software"],
  "website-development": ["website", "web site", "web development"],
};

function findService(text: string) {
  for (const [slug, hints] of Object.entries(serviceHints)) {
    if (hints.some((hint) => text.includes(hint))) return slug;
  }
  return "general-enquiry";
}

export function qualifyRequirement(textInput: string): Qualification {
  const text = textInput.trim().toLowerCase();
  const serviceSlug = findService(text);
  const business = /shop|office|business|school|hospital|hotel|warehouse|restaurant|apartment/.test(text);
  const quoteIntent = /quote|quotation|price|cost|estimate|budget/.test(text);
  const serviceIntent = /repair|service|not working|issue|problem|maintenance|fix/.test(text);
  const surveyIntent = /survey|site visit|visit|camera position|coverage|blind spot|installation plan/.test(text);
  const urgencyHigh = /urgent|asap|today|immediately|immediate|emergency/.test(text);

  let score = 15;
  if (serviceSlug !== "general-enquiry") score += 20;
  if (business) score += 10;
  if (quoteIntent) score += 15;
  if (serviceIntent) score += 15;
  if (surveyIntent) score += 15;
  if (urgencyHigh) score += 20;
  const numbers = text.match(/\b(?:4|6|8|10|12|16|20|24|32)\b/g);
  if (numbers?.length) score += 10;

  const intent: Qualification["intent"] = surveyIntent
    ? "SITE_SURVEY"
    : serviceIntent
      ? "SERVICE"
      : quoteIntent
        ? "QUOTE"
        : "INFORMATION";
  const urgency = urgencyHigh ? "HIGH" : intent === "SERVICE" || intent === "SITE_SURVEY" ? "MEDIUM" : "LOW";
  const temperature = score >= 70 ? "HOT" : score >= 45 ? "WARM" : "COLD";

  const questions: string[] = [];
  if (serviceSlug === "cctv-installation") questions.push("How many cameras do you expect to need, and is this for a home or business?");
  if (serviceSlug === "computer-sales-service") questions.push("Are you looking for a new/used device, repair, upgrade, or ongoing support?");
  if (serviceSlug === "erp-software") questions.push("What business process do you want the ERP to manage first?");
  if (serviceSlug === "website-development") questions.push("What type of website do you need and what is the main business goal?");
  if (!business) questions.push("Is this requirement for a home or a business?");
  if (!quoteIntent && intent !== "SERVICE") questions.push("Would you like a quotation or a consultation?");

  const nextAction: Qualification["nextAction"] = surveyIntent
    ? "SITE_SURVEY"
    : quoteIntent || serviceIntent || urgencyHigh
      ? "SALES_FOLLOW_UP"
      : "SELF_SERVE";

  return {
    serviceSlug,
    category: business ? "BUSINESS" : text.length ? "GENERAL" : "GENERAL",
    intent,
    urgency,
    score: Math.min(score, 100),
    temperature,
    questions: questions.slice(0, 3),
    nextAction,
  };
}
