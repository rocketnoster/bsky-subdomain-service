// src/types.ts
export interface Env {
    CLOUDFLARE_API_TOKEN: string;
    CLOUDFLARE_ZONE_ID: string;
    GEMINI_API_KEY: string;
    BOT_HANDLE: string;
    BOT_PASSWORD: string; 
}

export interface SiteSettings {
    status_msg: string;
    terms_jp: string;
    terms_en: string;
    privacy_jp: string;
    privacy_en: string;
    graduate_guide_jp: string;
    graduate_guide_en: string;
}

export interface AiJudgement {
    allowed: boolean;
    reason_jp: string;
    category: "Hate" | "Impersonation" | "Scam" | "Sexual" | "Safe" | "SystemError" | "APIError" | "SafetyBlock" | "Unknown";
}

export interface DnsRecordMeta {
    did: string;
    exp: number;
    old: string;
    reminded: boolean; // ★ 追加
}