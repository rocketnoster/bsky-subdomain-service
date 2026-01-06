// src/ui/templates.ts
import { SiteSettings } from '../types';
import { parseMeta } from '../utils/helpers';
import { t, Lang } from './i18n';

const DOMAIN = "bsky.blog";
const RENEW_WINDOW_DAYS = 3;
const SUPPORT_HANDLE = "bsky.blog";

// CSS
const CSS = `
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#f8fafc;color:#334155;line-height:1.5}
h1{color:#0ea5e9;margin:0;font-size:24px;text-align:center;}
.subtitle{text-align:center;color:#64748b;font-size:14px;margin-bottom:30px;}
input,textarea{width:100%;padding:12px;margin:8px 0;border:1px solid #cbd5e1;border-radius:8px;font-size:16px;box-sizing:border-box;}
button{width:100%;padding:12px;border:none;border-radius:8px;font-weight:bold;cursor:pointer;font-size:16px;margin-top:15px;transition:opacity 0.2s;}
button:hover{opacity:0.9;}
.btn-main{background:#0ea5e9;color:white;}
.btn-sub{background:#e2e8f0;color:#334155;}
.card{background:white;padding:25px;border-radius:16px;box-shadow:0 4px 15px rgba(0,0,0,0.05);margin-bottom:20px;}
.error{color:#dc2626;background:#fef2f2;padding:12px;border-radius:8px;text-align:center;font-weight:bold;font-size:14px;margin-bottom:15px;}
.badge{background:#f59e0b;color:white;font-size:11px;padding:2px 8px;border-radius:10px;vertical-align:middle;}
.lang-switch{text-align:center;margin-bottom:20px;font-size:14px;display:flex;justify-content:center;gap:10px;}
.lang-btn{background:none;border:none;color:#94a3b8;cursor:pointer;padding:0;font:inherit;text-decoration:underline;}
.lang-btn.active{color:#0ea5e9;font-weight:bold;text-decoration:none;pointer-events:none;}
footer{text-align:center;font-size:12px;color:#94a3b8;margin-top:40px;border-top:1px solid #e2e8f0;padding-top:20px;}
footer a{color:#64748b;text-decoration:none;margin:0 5px;}
.terms-box{font-size:12px;background:#f1f5f9;padding:12px;border-radius:8px;margin:15px 0;white-space:pre-wrap;max-height:150px;overflow-y:auto;border:1px solid #e2e8f0;}
table{width:100%;border-collapse:collapse;font-size:13px;}th,td{padding:8px;border-bottom:1px solid #eee;text-align:left;}th{background:#f1f5f9;}
`;

// Auth-Aware Language Switcher
function langSwitcher(current: Lang, mode: string = "", id: string = "", pass: string = "", handle: string = "") {
    const langs: {code: Lang, label: string}[] = [{code: 'en', label: 'English'}, {code: 'ja', label: '日本語'}];
    
    if (pass) {
        return `<div class="lang-switch">
            ${langs.map(l => `
                <form action="/action" method="POST" style="display:inline;">
                    <input type="hidden" name="mode" value="${mode}">
                    <input type="hidden" name="identifier" value="${id}">
                    <input type="hidden" name="appPassword" value="${pass}">
                    <input type="hidden" name="handle" value="${handle}">
                    <input type="hidden" name="lang" value="${l.code}">
                    <button class="lang-btn ${current === l.code ? 'active' : ''}">${l.label}</button>
                </form>
            `).join(' | ')}
        </div>`;
    }

    return `<div class="lang-switch">
        <a href="?lang=en" class="lang-btn ${current === 'en' ? 'active' : ''}">English</a> | 
        <a href="?lang=ja" class="lang-btn ${current === 'ja' ? 'active' : ''}">日本語</a>
    </div>`.replace(/<a/g, '<a style="text-decoration:none;"');
}

// Footer
function footer(l: Lang) {
    return `<footer>
        <a href="/legal/terms?lang=${l}" target="_blank">${t('footer_terms', l)}</a> • 
        <a href="/legal/privacy?lang=${l}" target="_blank">${t('footer_privacy', l)}</a><br>
        <div style="margin-top:5px;">${t('footer_powered', l)}</div>
    </footer>`;
}

// --- Pages ---

export function htmlGatewayPage(s: SiteSettings, err: string, lang: Lang) { 
    return `<!DOCTYPE html><html lang="${lang}"><head><meta name="viewport" content="width=device-width"><title>${t('title', lang)}</title><style>${CSS}</style></head><body>
    ${langSwitcher(lang)}
    <div style="text-align:center;margin-bottom:10px;"><h1>☁️ ${t('title', lang)}</h1><p class="subtitle">${s.status_msg || t('welcome', lang)}</p></div>
    <div class="card">
        <h3 style="margin-top:0;text-align:center;">${t('login_header', lang)}</h3>
        ${err ? `<div class="error">${err}</div>` : ''}
        <form action="/action" method="POST">
            <input type="hidden" name="mode" value="entry">
            <input type="hidden" name="lang" value="${lang}">
            <input type="text" name="identifier" required placeholder="${t('login_input_id', lang)}">
            <input type="password" name="appPassword" required placeholder="${t('login_input_pass', lang)}">
            <button class="btn-main">${t('login_btn', lang)}</button>
        </form>
    </div>
    ${footer(lang)}
    </body></html>`; 
}

export function htmlRegisterPage(handle: string, old: string, pass: string, id: string, s: SiteSettings, err: string, lang: Lang) { 
    const terms = lang === 'ja' ? s.terms_jp : s.terms_en;
    const privacy = lang === 'ja' ? s.privacy_jp : s.privacy_en;
    const headerTerms = lang === 'ja' ? '【利用規約】' : '[ Terms of Service ]';
    const headerPrivacy = lang === 'ja' ? '【プライバシーポリシー】' : '[ Privacy Policy ]';
    const displayText = `${headerTerms}\n${terms}\n\n${headerPrivacy}\n${privacy}`;
    
    return `<!DOCTYPE html><html lang="${lang}"><head><meta name="viewport" content="width=device-width"><title>${t('reg_title', lang)}</title><style>${CSS}</style></head><body>
    ${langSwitcher(lang, 'entry', id, pass)} 
    <div style="text-align:center;"><h1>${t('reg_title', lang)}</h1></div>
    <div class="card" style="margin-top:20px;">
        ${err ? `<div class="error">${err}</div>` : ''}
        <form action="/action" method="POST">
            <input type="hidden" name="mode" value="register">
            <input type="hidden" name="identifier" value="${id}">
            <input type="hidden" name="appPassword" value="${pass}">
            <input type="hidden" name="bskyHandle" value="${old}">
            <input type="hidden" name="lang" value="${lang}">
            
            <label style="font-weight:bold;font-size:14px;">${t('reg_subdomain_label', lang)}</label>
            <div style="display:flex;align-items:center;gap:5px;">
                @<input type="text" name="handle" value="${handle}" placeholder="name" required style="text-align:right;">.${DOMAIN}
            </div>
            <label style="font-weight:bold;font-size:14px;display:block;margin-top:15px;">${t('reg_terms_label', lang)}</label>
            <div class="terms-box">${displayText}</div>
            <button class="btn-main">${t('reg_create_btn', lang)}</button>
        </form>
        
        <div style="text-align:center;margin-top:15px;">
            <a href="/?lang=${lang}" class="btn-sub" style="display:inline-block;padding:10px 20px;text-decoration:none;color:#64748b;">${t('reg_cancel', lang)}</a>
        </div>
    </div>
    ${footer(lang)}
    </body></html>`; 
}

export function htmlDashboard(h: string, meta: any, pass: string, id: string, s: SiteSettings, msg: string, lang: Lang) { 
    const now = Math.floor(Date.now() / 1000); 
    const isVip = meta.exp === 0; 
    const days = Math.ceil((meta.exp - now) / 86400); 
    const canRenew = !isVip && (days <= RENEW_WINDOW_DAYS); 
    const statusText = days < 0 ? t('dash_expired', lang) : t('dash_active', lang);
    const expText = isVip ? t('dash_admin', lang) : `${days} ${t('dash_days_left', lang)}`;
    
    // Get content from SiteSettings based on lang
    const graduateGuide = lang === 'ja' ? s.graduate_guide_jp : s.graduate_guide_en;

    return `<!DOCTYPE html><html lang="${lang}"><head><meta name="viewport" content="width=device-width"><style>${CSS}</style></head><body>
    ${langSwitcher(lang, 'entry', id, pass)}
    ${msg ? `<div style="background:#dcfce7;color:#166534;padding:12px;border-radius:8px;margin-bottom:20px;text-align:center;font-weight:bold;">${msg}</div>` : ''}
    
    <div class="card">
        <h2 style="text-align:center;margin:0;">@${h}.${DOMAIN}</h2>
        <div style="text-align:center;margin-top:10px;font-weight:bold;color:${days < 0 ? 'red' : 'green'};">
            ${statusText} | ${expText}
        </div>
    </div>

    <form action="/action" method="POST" class="card" style="border:2px solid #f59e0b;background:#fffbeb;">
        <input type="hidden" name="mode" value="delete"><input type="hidden" name="reason" value="graduate">
        <input type="hidden" name="handle" value="${h}"><input type="hidden" name="identifier" value="${id}">
        <input type="hidden" name="appPassword" value="${pass}"><input type="hidden" name="lang" value="${lang}">
        
        <h3 style="margin-top:0;">${t('btn_graduate', lang)}</h3>
        
        <div style="margin-bottom:15px;">${graduateGuide}</div>
        
        <input type="text" name="newDomain" placeholder="example.com" required style="margin-top:0;">
        <button class="btn-main" style="background:#f59e0b;">Set & Release</button>
    </form>

    ${canRenew ? `<form action="/action" method="POST" class="card">
        <input type="hidden" name="mode" value="renew"><input type="hidden" name="handle" value="${h}">
        <input type="hidden" name="identifier" value="${id}"><input type="hidden" name="appPassword" value="${pass}"><input type="hidden" name="lang" value="${lang}">
        <button class="btn-main">${t('btn_renew', lang)}</button>
    </form>` : ''}

    <form action="/action" method="POST" class="card" style="background:#f1f5f9;">
        <input type="hidden" name="mode" value="delete"><input type="hidden" name="reason" value="revert">
        <input type="hidden" name="handle" value="${h}"><input type="hidden" name="identifier" value="${id}">
        <input type="hidden" name="appPassword" value="${pass}"><input type="hidden" name="lang" value="${lang}">
        <h3 style="margin-top:0;">${t('btn_revert', lang)}</h3>
        <p style="font-size:13px;margin:0 0 10px;">${t('desc_revert', lang)}: @${meta.old}</p>
        <button class="btn-sub">${t('btn_revert', lang)}</button>
    </form>

    <div style="text-align:center;"><a href="/?lang=${lang}" style="color:#94a3b8;">${t('btn_logout', lang)}</a></div>
    ${footer(lang)}
    </body></html>`; 
}

// Admin Dashboard
export function htmlAdminDashboard(adminHandle: string, records: any[], auditLogs: string[], settings: SiteSettings, pass: string, id: string, zombies: any[], msg: string = "") {
    const now = Math.floor(Date.now() / 1000);
    
    // Filter System Records: Exclude logs and admin/support handle
    const realUsers = records.filter((r: any) => {
        // Exclude logs
        if (r.name.includes('_log.')) return false; 
        
        // Normalize handle (remove _atproto. and domain suffix)
        const name = r.name.replace('_atproto.', '').replace(`.${DOMAIN}`, '');
        
        // Exclude empty, system handles, or root domain handle
        if (name === '' || name === SUPPORT_HANDLE || name === 'admin') return false;
        
        return true;
    });

    const rows = realUsers.map((r: any) => {
        const meta = parseMeta(r);
        const name = r.name.replace('_atproto.', '').replace(`.${DOMAIN}`, '');
        const days = meta.exp === 0 ? '∞' : Math.ceil((meta.exp - now) / 86400);
        let st = r.content.includes('suspended') ? '🚫Sus' : r.content.includes('archived') ? '⚰️Arc' : '✅Act';
        const isZombie = zombies.some((z: any) => z.name === r.name);
        if (isZombie) st = '🧟 <b style="color:red">Zombie</b>';
        return `<tr><td>${name}</td><td>${st}</td><td>${days}d</td><td style="text-align:right;"><form action="/action" method="POST" onsubmit="return confirm('Delete?');"><input type="hidden" name="mode" value="admin_delete"><input type="hidden" name="handle" value="${name}"><input type="hidden" name="identifier" value="${id}"><input type="hidden" name="appPassword" value="${pass}"><button style="padding:4px;margin:0;font-size:10px;background:#ef4444;color:white;width:auto;">DEL</button></form></td></tr>`;
    }).join('');

    const logRows = auditLogs.map((l: string) => {
        const parts = l.split('|');
        return `<tr><td>${parts[0]||'-'}</td><td>${parts[1]||'-'}</td><td>${parts[3]||parts[2]||'-'}</td></tr>`;
    }).join('');

    const zombieRows = zombies.map((z: any) => {
        const name = z.name.replace('_atproto.', '').replace(`.${DOMAIN}`, '');
        return `<tr style="background:#fef2f2;"><td>${name}</td><td>${z.reason}</td><td>Pending</td></tr>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width"><style>${CSS}</style></head><body>
    <div style="text-align:center;margin-bottom:20px;"><h1 style="color:#7c3aed;">👑 Admin</h1><p>@${adminHandle}</p>${msg?`<div style="color:green;">${msg}</div>`:''}</div>
    
    <div class="card" style="border-top: 4px solid #f59e0b;">
        <h3>🧟 Zombie Cleaner & 🔔 Daily Tasks</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
            
            <form action="/action" method="POST"><input type="hidden" name="mode" value="admin_scan_zombies"><input type="hidden" name="identifier" value="${id}"><input type="hidden" name="appPassword" value="${pass}"><button class="btn-main" style="background:#f59e0b;margin-top:0;">🔍 Scan</button></form>
            
            <form action="/action" method="POST" onsubmit="return confirm('Sweep ALL?');"><input type="hidden" name="mode" value="admin_sweep_zombies"><input type="hidden" name="identifier" value="${id}"><input type="hidden" name="appPassword" value="${pass}"><button class="btn-main" style="background:#ef4444;margin-top:0;">🧹 Sweep All</button></form>
            
            <form action="/action" method="POST" onsubmit="return confirm('Run daily tasks (Reminders & Archive) NOW?');">
                <input type="hidden" name="mode" value="admin_force_sweep">
                <input type="hidden" name="identifier" value="${id}">
                <input type="hidden" name="appPassword" value="${pass}">
                <button class="btn-main" style="background:#8b5cf6;margin-top:0;">🔔 Force Sweep</button>
            </form>

        </div>
        ${zombies.length > 0 ? `<table style="margin-top:10px;"><thead><tr><th>Handle</th><th>Reason</th><th></th></tr></thead><tbody>${zombieRows}</tbody></table>` : ''}
    </div>
    
    <div class="card"><h3>🚫 Rejection History</h3>
    <div style="text-align:right;margin-bottom:5px;">
        <form action="/action" method="POST" onsubmit="return confirm('Clear ALL Logs?');"><input type="hidden" name="mode" value="admin_clear_logs"><input type="hidden" name="identifier" value="${id}"><input type="hidden" name="appPassword" value="${pass}"><button style="padding:4px 8px;font-size:12px;width:auto;background:#ef4444;color:white;">🗑️ Clear History</button></form>
    </div>
    <table><thead><tr><th>Time</th><th>Handle</th><th>Reason</th></tr></thead><tbody>${logRows||'<tr><td colspan="3">No rejections yet</td></tr>'}</tbody></table></div>
    
    <div class="card"><h3>👥 Users (${realUsers.length})</h3><table><thead><tr><th>Handle</th><th>St</th><th>Exp</th><th>Act</th></tr></thead><tbody>${rows}</tbody></table></div>
    
    <div style="text-align:center;"><a href="/">Logout</a></div></body></html>`;
}

// Legal Text Page
export function htmlLegalPage(title: string, content: string, lang: Lang) {
    return `<!DOCTYPE html><html lang="${lang}"><head><meta name="viewport" content="width=device-width"><title>${title}</title><style>${CSS}</style></head><body>
    <div style="text-align:center;"><h1>${title}</h1></div>
    <div class="card" style="margin-top:20px;white-space:pre-wrap;font-size:14px;">${content || "No content available."}</div>
    <div style="text-align:center;"><a href="#" onclick="window.close();return false;" style="color:#64748b;">Close</a></div>
    </body></html>`;
}

export function htmlExitPage(n: string, r: string, a: boolean, lang: Lang) { 
    return `<!DOCTYPE html><html lang="${lang}"><head><meta name="viewport" content="width=device-width"><style>${CSS}</style></head><body style="text-align:center;padding-top:50px;"><h1>🎉 Done</h1><p>${a?'Auto-reverted':'Please set manually'}</p><div style="font-size:1.5em;margin:20px;font-weight:bold;">${n}</div><a href="https://bsky.app/" class="btn-main" style="display:inline-block;width:auto;text-decoration:none;">Home</a></body></html>`; 
}
export function htmlCooldownPage(fullHandle: string, lang: Lang) { 
    return `<!DOCTYPE html><html lang="${lang}"><head><meta name="viewport" content="width=device-width"><style>${CSS}</style></head><body><div class="card" style="text-align:center;"><h3>⏳ Cooldown</h3><p>Please wait...</p></div></body></html>`; 
}
export function htmlTombstonePage(h: string, o: string, p: string, i: string, lang: Lang) {
    return `<!DOCTYPE html><html lang="${lang}"><head><meta name="viewport" content="width=device-width"><style>${CSS}</style></head><body style="text-align:center;padding-top:50px;background:#334155;color:#fff;"><h1>⚰️ Archived</h1><p>@${h}.${DOMAIN}</p><form action="/action" method="POST"><input type="hidden" name="mode" value="register"><input type="hidden" name="handle" value="${h}"><input type="hidden" name="bskyHandle" value="${o}"><input type="hidden" name="identifier" value="${i}"><input type="hidden" name="appPassword" value="${p}"><input type="hidden" name="lang" value="${lang}"><button class="btn-main" style="background:#ef4444;">Resurrect</button></form></body></html>`;
}
export function htmlError(m: string, lang: Lang) { 
    return `<!DOCTYPE html><html lang="${lang}"><head><meta name="viewport" content="width=device-width"><style>${CSS}</style></head><body style="text-align:center;color:red;padding-top:50px;"><h3>Error</h3><p>${m}</p><a href="/?lang=${lang}">Back</a></body></html>`; 
}
export function htmlSuccess(m: string, lang: Lang) { 
    return `<!DOCTYPE html><html lang="${lang}"><head><meta name="viewport" content="width=device-width"><style>${CSS}</style></head><body style="text-align:center;padding-top:50px;"><h3>Success</h3><p>${m}</p><a href="/?lang=${lang}">Top</a></body></html>`; 
}