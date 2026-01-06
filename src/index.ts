// src/index.ts
import { 
    RESERVED_WORDS, 
    DANGEROUS_PATTERNS, 
    OFFICIAL_TEAM_PATTERNS, 
    SUPER_ADMIN_DID, 
    EXPIRATION_DAYS 
} from './config';

import { SITE_CONTENT } from './content';

const _GRACE_PERIOD_DAYS = 10;
const _ARCHIVE_PERIOD_DAYS = 50;
const _REMIND_DAYS = 3; 

import { Env, SiteSettings } from './types';
import { parseMeta } from './utils/helpers';
import { createAgent, ensureFollowBot, sendRemindPost } from './services/bluesky'; 
import { evaluateHandleWithGemini } from './services/gemini';
import { 
    getDnsRecord, registerDns, updateDnsRecord, deleteDnsRecord, 
    fetchAllDnsRecords, logRejection, getAuditLogsFromRecords, clearAllAuditLogs 
} from './services/dns';
import * as UI from './ui/templates';
import { Lang, t } from './ui/i18n'; 

const DOMAIN = "bsky.blog";

function getLang(request: Request): Lang {
    const url = new URL(request.url);
    const queryLang = url.searchParams.get('lang');
    if (queryLang === 'en' || queryLang === 'ja') return queryLang;
    const acceptLang = request.headers.get('Accept-Language') || "";
    if (acceptLang.includes('ja')) return 'ja';
    return 'ja'; 
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const settings = SITE_CONTENT; 
        const lang = getLang(request);

        // --- Legal Pages Routing ---
        if (url.pathname === '/legal/terms') {
            const content = lang === 'ja' ? settings.terms_jp : settings.terms_en;
            return new Response(UI.htmlLegalPage(t('footer_terms', lang), content, lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
        if (url.pathname === '/legal/privacy') {
            const content = lang === 'ja' ? settings.privacy_jp : settings.privacy_en;
            return new Response(UI.htmlLegalPage(t('footer_privacy', lang), content, lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        // --- Main Routing ---
        if (url.pathname === '/') {
            return new Response(UI.htmlGatewayPage(settings, "", lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
        if (url.pathname === '/action' && request.method === 'POST') {
            return await handleAction(request, env, settings);
        }
        return new Response('404 Not Found', { status: 404 });
    },
    
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
        await runDailySweep(env);
    }
};

async function handleAction(request: Request, env: Env, settings: SiteSettings): Promise<Response> {
    const formData = await request.formData();
    const mode = formData.get('mode') as string;
    const identifier = (formData.get('identifier') as string || "").trim();
    const password = (formData.get('appPassword') as string || "").trim();
    
    let lang = (formData.get('lang') as string) === 'en' ? 'en' : 'ja' as Lang;

    const agent = createAgent();

    // --- 🚪 Gateway & Dashboard ---
    if (mode === 'entry') {
        try { await agent.login({ identifier, password }); } 
        catch (e) { return new Response(UI.htmlGatewayPage(settings, "❌ IDまたはパスワードが正しくありません", lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); }

        const did = agent.session?.did!;
        const handle = agent.session?.handle!;

        // Admin Dashboard
        if (did === SUPER_ADMIN_DID) {
            const records = await fetchAllDnsRecords(env);
            const auditLog = getAuditLogsFromRecords(records);
            return new Response(UI.htmlAdminDashboard(handle, records, auditLog, settings, password, identifier, [], ""), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        // User Dashboard
        if (handle.endsWith(`.${DOMAIN}`)) {
            const sub = handle.replace(`.${DOMAIN}`, '');
            const rec = await getDnsRecord(env, sub);
            if (rec) {
                if (rec.content.includes('status=archived')) {
                    const meta = parseMeta(rec);
                    return new Response(UI.htmlTombstonePage(sub, meta.old || 'bsky.social', password, identifier, lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
                }
                const meta = parseMeta(rec);
                return new Response(UI.htmlDashboard(sub, meta, password, identifier, settings, "", lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            }
        }
        return new Response(UI.htmlRegisterPage("", handle, password, identifier, settings, "", lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // --- 📝 Register ---
    if (mode === 'register') {
        try { await agent.login({ identifier, password }); } 
        catch { return new Response(UI.htmlGatewayPage(settings, "❌ 再ログインしてください", lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); }

        const did = agent.session?.did!;
        const handle = (formData.get('handle') as string || "").toLowerCase().trim();
        const bskyHandle = (formData.get('bskyHandle') as string || "").trim();
        const fullHandle = `${handle}.${DOMAIN}`;

        if (RESERVED_WORDS.includes(handle) || OFFICIAL_TEAM_PATTERNS.includes(handle) || DANGEROUS_PATTERNS.some((p: string) => handle.includes(p))) {
            await logRejection(env, handle, bskyHandle, "Static Filter");
            return new Response(UI.htmlRegisterPage(handle, bskyHandle, password, identifier, settings, "⚠️ その名前は使用できません（予約語/禁止語）", lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        const ai = await evaluateHandleWithGemini(env, handle);
        if (!ai.allowed) {
            const reasonLog = ai.category ? `AI Reject: ${ai.category}` : "AI Reject: Unknown";
            const reasonMsg = `🚫 ${ai.reason_jp}`;
            await logRejection(env, handle, bskyHandle, reasonLog);
            return new Response(UI.htmlRegisterPage(handle, bskyHandle, password, identifier, settings, reasonMsg, lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        const existing = await getDnsRecord(env, handle);
        const isAdmin = (did === SUPER_ADMIN_DID);
        const exp = isAdmin ? 0 : Math.floor(Date.now() / 1000) + (EXPIRATION_DAYS * 86400);
        const content = `did=${did}`;
        const comment = `old=${bskyHandle};exp=${exp};did=${did};status=active`;

        if (existing) {
            const meta = parseMeta(existing);
            if (meta.did !== did) return new Response(UI.htmlRegisterPage(handle, bskyHandle, password, identifier, settings, "⚠️ すでに使用されています", lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            // ★ Fix: pass existing.name
            await updateDnsRecord(env, existing.id, existing.name, content, comment);
        } else {
            await registerDns(env, handle, content, comment);
        }

        if (env.BOT_HANDLE) await ensureFollowBot(agent, env.BOT_HANDLE);

        let propagated = false;
        for (let i = 1; i <= 20; i++) {
            await new Promise(r => setTimeout(r, 3000));
            try {
                const res = await fetch(`https://dns.google/resolve?name=_atproto.${fullHandle}&type=TXT`);
                const json: any = await res.json();
                if (json.Answer && json.Answer.some((a: any) => a.data.includes(did))) { propagated = true; break; }
            } catch (e) {}
        }

        if (propagated) {
            await new Promise(r => setTimeout(r, 10000)); 
            try {
                await agent.updateHandle({ handle: fullHandle });
                return new Response(UI.htmlSuccess(`✅ Success!<br>Handle: ${fullHandle}`, lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            } catch (err: any) {
                if (err.message?.includes("Rate Limit")) return new Response(UI.htmlCooldownPage(fullHandle, lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
                return new Response(UI.htmlRegisterPage(handle, bskyHandle, password, identifier, settings, `⚠️ Finalizing... Please retry in 1 min.`, lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            }
        } else {
            return new Response(UI.htmlRegisterPage(handle, bskyHandle, password, identifier, settings, `⚠️ DNS Waiting... Please retry.`, lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
    }

    // --- 👑 Admin Features ---
    if (mode === 'admin_scan_zombies') {
        try { await agent.login({ identifier, password }); } catch { return new Response(UI.htmlGatewayPage(settings, "❌ Auth Failed", lang)); }
        if (agent.session?.did !== SUPER_ADMIN_DID) return new Response(UI.htmlError("Forbidden", lang));

        const records = await fetchAllDnsRecords(env);
        const zombies: any[] = [];
        
        const activeUsers = records.filter((r: any) => 
            r.name.startsWith('_atproto.') && 
            !r.name.includes('_log.')
        );

        for (const r of activeUsers) {
            const myHandle = r.name.replace('_atproto.', '').replace(`.${DOMAIN}`, '') + `.${DOMAIN}`;
            const meta = parseMeta(r);
            if (!meta.did) { zombies.push({ ...r, reason: "No DID" }); continue; }
            try {
                await new Promise(r => setTimeout(r, 200));
                const profile = await agent.getProfile({ actor: meta.did });
                if (profile.data.handle !== myHandle) {
                    zombies.push({ ...r, reason: `Moved to @${profile.data.handle}` });
                }
            } catch (e: any) {
                zombies.push({ ...r, reason: "Account Dead" });
            }
        }

        const auditLog = getAuditLogsFromRecords(records);
        return new Response(UI.htmlAdminDashboard(agent.session.handle, records, auditLog, settings, password, identifier, zombies, `🔍 Checked ${activeUsers.length} users`), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    if (mode === 'admin_sweep_zombies') {
        try { await agent.login({ identifier, password }); } catch { return new Response(UI.htmlGatewayPage(settings, "❌ Auth Failed", lang)); }
        if (agent.session?.did !== SUPER_ADMIN_DID) return new Response(UI.htmlError("Forbidden", lang));

        const records = await fetchAllDnsRecords(env);
        const activeUsers = records.filter((r: any) => 
            r.name.startsWith('_atproto.') && 
            !r.name.includes('_log.')
        );
        let deletedCount = 0;

        for (const r of activeUsers) {
            const myHandle = r.name.replace('_atproto.', '').replace(`.${DOMAIN}`, '') + `.${DOMAIN}`;
            const meta = parseMeta(r);
            if (!meta.did) { await deleteDnsRecord(env, r.id); deletedCount++; continue; }
            try {
                await new Promise(r => setTimeout(r, 200));
                const profile = await agent.getProfile({ actor: meta.did });
                if (profile.data.handle !== myHandle) { await deleteDnsRecord(env, r.id); deletedCount++; }
            } catch (e) {
                await deleteDnsRecord(env, r.id); deletedCount++;
            }
        }

        const newRecords = await fetchAllDnsRecords(env);
        const auditLog = getAuditLogsFromRecords(newRecords);
        return new Response(UI.htmlAdminDashboard(agent.session.handle, newRecords, auditLog, settings, password, identifier, [], `🧹 Swept ${deletedCount} zombies`), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Force Sweep
    if (mode === 'admin_force_sweep') {
        try { await agent.login({ identifier, password }); } catch { return new Response(UI.htmlGatewayPage(settings, "❌ Auth Failed", lang)); }
        if (agent.session?.did !== SUPER_ADMIN_DID) return new Response(UI.htmlError("Forbidden", lang));

        const resultMsg = await runDailySweep(env);

        const records = await fetchAllDnsRecords(env);
        const auditLog = getAuditLogsFromRecords(records);
        return new Response(UI.htmlAdminDashboard(agent.session.handle, records, auditLog, settings, password, identifier, [], resultMsg), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // --- Admin Delete / Clear Log ---
    if (mode === 'admin_delete') {
        try { await agent.login({ identifier, password }); } catch { return new Response(UI.htmlGatewayPage(settings, "❌ Auth Failed", lang)); }
        if (agent.session?.did !== SUPER_ADMIN_DID) return new Response(UI.htmlError("Forbidden", lang));
        const target = formData.get('handle') as string;
        const rec = await getDnsRecord(env, target); if (rec) await deleteDnsRecord(env, rec.id);
        const records = await fetchAllDnsRecords(env); const auditLog = getAuditLogsFromRecords(records);
        return new Response(UI.htmlAdminDashboard(agent.session.handle, records, auditLog, settings, password, identifier, [], "🗑️ Deleted"), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    if (mode === 'admin_clear_logs') {
        try { await agent.login({ identifier, password }); } catch { return new Response(UI.htmlGatewayPage(settings, "❌ Auth Failed", lang)); }
        if (agent.session?.did !== SUPER_ADMIN_DID) return new Response(UI.htmlError("Forbidden", lang));
        
        const records = await fetchAllDnsRecords(env);
        const count = await clearAllAuditLogs(env, records);
        
        const newRecords = await fetchAllDnsRecords(env);
        return new Response(UI.htmlAdminDashboard(agent.session.handle, newRecords, [], settings, password, identifier, [], `🗑️ Cleared ${count} logs`), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // --- User Actions ---
    if (mode === 'renew') {
        try { await agent.login({ identifier, password }); } catch { return new Response(UI.htmlError("Auth Failed", lang)); }
        const handle = formData.get('handle') as string;
        const rec = await getDnsRecord(env, handle);
        if (rec && parseMeta(rec).did === agent.session?.did) {
            const newExp = Math.floor(Date.now() / 1000) + (EXPIRATION_DAYS * 86400);
            const meta = parseMeta(rec);
            // ★ Fix: Pass rec.name to updateDnsRecord
            await updateDnsRecord(env, rec.id, rec.name, `did=${meta.did}`, `old=${meta.old};exp=${newExp};did=${meta.did};status=active`);
            return new Response(UI.htmlDashboard(handle, { ...meta, exp: newExp }, password, identifier, settings, "✅ Renewed", lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
    }

    if (mode === 'delete') {
        try { await agent.login({ identifier, password }); } catch { return new Response(UI.htmlError("Auth Failed", lang)); }
        const handle = formData.get('handle') as string;
        const reason = formData.get('reason') as string;
        const newDomain = (formData.get('newDomain') as string || "").trim();
        const rec = await getDnsRecord(env, handle);
        if (rec && parseMeta(rec).did === agent.session?.did) {
            const meta = parseMeta(rec);
            const target = (reason === 'graduate' && newDomain) ? newDomain : (meta.old || 'bsky.social');
            let auto = false; try { await agent.updateHandle({ handle: target }); auto = true; } catch {}
            await deleteDnsRecord(env, rec.id);
            return new Response(UI.htmlExitPage(target, reason, auto, lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
    }

    return new Response(UI.htmlError("Invalid Request", lang));
}

async function runDailySweep(env: Env): Promise<string> {
    if (!env.BOT_HANDLE || !env.BOT_PASSWORD) return "❌ Error: BOT_HANDLE or BOT_PASSWORD missing";
    
    const bot = createAgent();
    try { 
        await bot.login({ identifier: env.BOT_HANDLE, password: env.BOT_PASSWORD }); 
    } catch (e: any) { 
        return `❌ Bot Login Failed: ${e.message}`; 
    }
    
    const records = await fetchAllDnsRecords(env);
    const now = Math.floor(Date.now() / 1000);
    let sentCount = 0;
    let suspendCount = 0;
    let archiveCount = 0;

    for (const r of records) {
        if (r.name.includes('_log.')) continue;
        
        const meta = parseMeta(r);
        
        if (meta.exp === 0) continue; 

        const days = Math.ceil((meta.exp - now) / 86400);

        // 1. Reminder
        if (days <= _REMIND_DAYS && days > 0 && !meta.reminded && !r.content.includes('status=suspended')) {
            const handle = r.name.replace('_atproto.', '').replace(`.${DOMAIN}`, '') + `.${DOMAIN}`;
            const success = await sendRemindPost(bot, meta.did, handle);
            if (success) {
                const newComment = r.comment ? `${r.comment};reminded=1` : `reminded=1`;
                // ★ Fix: pass r.name
                await updateDnsRecord(env, r.id, r.name, r.content, newComment);
                sentCount++;
            }
        }

        // 2. Suspend
        if (days <= 0 && days > -_GRACE_PERIOD_DAYS && !r.content.includes('status=suspended')) {
            // ★ Fix: pass r.name
            await updateDnsRecord(env, r.id, r.name, `status=suspended`, `old=${meta.old};exp=${meta.exp};did=${meta.did};status=suspended`);
            suspendCount++;
        }
        
        // 3. Archive
        if (days <= -_GRACE_PERIOD_DAYS && !r.content.includes('status=archived')) {
            // ★ Fix: pass r.name
            await updateDnsRecord(env, r.id, r.name, `status=archived`, `old=${meta.old};did=${meta.did};status=archived;archived_at=${now}`);
            archiveCount++;
        }
        
        // 4. Delete
        if (r.content.includes('status=archived')) {
            const arch = parseInt(r.comment?.match(/archived_at=(\d+)/)?.[1] || "0");
            if (arch && (now - arch > _ARCHIVE_PERIOD_DAYS * 86400)) {
                await deleteDnsRecord(env, r.id);
            }
        }
    }
    
    return `✅ Executed. Sent: ${sentCount}, Suspended: ${suspendCount}, Archived: ${archiveCount}`;
}