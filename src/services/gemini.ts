// src/services/gemini.ts
import { Env, AiJudgement } from '../types';

export async function evaluateHandleWithGemini(env: Env, h: string): Promise<AiJudgement> {
    if (!env.GEMINI_API_KEY) {
        console.error("Gemini API Key missing!");
        return { allowed: false, reason_jp: "AI審査システム停止中 (Config Error)", category: "SystemError" };
    }
    
    const prompt = `
    Role: Senior Content Safety Moderator.
    Target: "${h}" (proposed subdomain).
    
    Instructions:
    Strictly categorize the handle. If it matches ANY negative category, "allowed" is FALSE.
    
    Categories:
    1. [Hate]: Hate speech, slur, violence, death, toxicity. (e.g., hate, kill, die, nazi)
    2. [Impersonation]: Corporate, Government, Official roles. (e.g., official, admin, support, google, apple)
    3. [Scam]: Phishing, fraud. (e.g., login, auth, verify, wallet, bank)
    4. [Sexual]: Explicit content.
    5. [Safe]: Only if harmless.

    Response JSON:
    {"allowed": boolean, "category": "Hate"|"Impersonation"|"Scam"|"Sexual"|"Safe", "reason_jp": "Brief reason"}
    `;

    try {
        // Model: gemini-2.5-flash
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        if (!r.ok) {
            const errText = await r.text();
            console.error(`[Gemini API Error] Status: ${r.status}, Body: ${errText}`);
            return { allowed: false, reason_jp: `AIシステム接続エラー (Code: ${r.status})`, category: "APIError" };
        }

        const j: any = await r.json();
        
        // Safety Block Check
        if (j.promptFeedback && j.promptFeedback.blockReason) {
            console.log(`[AI Block] Reason: ${j.promptFeedback.blockReason}`);
            return { allowed: false, reason_jp: "不適切な単語が含まれている可能性があります (AI Safety Block)", category: "SafetyBlock" };
        }

        // Empty Response Check
        if (!j.candidates || !j.candidates[0] || !j.candidates[0].content) {
            console.error("Gemini API Empty Response:", JSON.stringify(j));
            return { allowed: false, reason_jp: "AI審査エラー (Empty Response)", category: "APIError" };
        }

        const rawText = j.candidates[0].content.parts[0].text;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");
        
        const result = JSON.parse(jsonMatch[0]);
        console.log(`[AI Judge] ${h} -> ${result.category} (Allowed: ${result.allowed})`);
        
        if (result.category !== 'Safe' && result.allowed === true) {
            result.allowed = false;
        }

        return result;

    } catch (e: any) {
        console.error(`[AI Exception] ${e.message}`);
        return { allowed: false, reason_jp: `AI審査システム応答なし (${e.message})`, category: "SystemError" };
    }
}