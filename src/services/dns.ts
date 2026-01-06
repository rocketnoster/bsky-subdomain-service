// src/services/dns.ts
import { Env } from '../types';

const DOMAIN = "bsky.blog";

// --- Base CRUD ---

export async function getDnsRecord(env: Env, h: string) {
    const r = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records?type=TXT&name=_atproto.${h}.${DOMAIN}`, { 
        headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` } 
    });
    const j: any = await r.json();
    return (j.success && j.result.length > 0) ? j.result[0] : null; 
}

export async function registerDns(env: Env, h: string, c: string, cm: string) {
    await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records`, { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ type: "TXT", name: `_atproto.${h}`, content: c, ttl: 60, comment: cm }) 
    });
}

// ★ Modified: Added 'name' parameter
export async function updateDnsRecord(env: Env, id: string, name: string, c: string, cm: string) {
    await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records/${id}`, { 
        method: 'PUT', 
        headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ type: "TXT", name: name, content: c, ttl: 60, comment: cm }) 
    });
}

export async function deleteDnsRecord(env: Env, id: string) {
    await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` } 
    });
}

// --- Pagination Enabled Fetch ---

export async function fetchAllDnsRecords(env: Env): Promise<any[]> {
    let allRecords: any[] = [];
    let page = 1;
    let totalPages = 1;

    try {
        do {
            const r = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records?type=TXT&per_page=100&page=${page}`, { 
                headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` } 
            });
            const j: any = await r.json();
            if (j.success) {
                allRecords = allRecords.concat(j.result);
                if (j.result_info) {
                    totalPages = j.result_info.total_pages;
                }
            } else {
                break;
            }
            page++;
        } while (page <= totalPages && page <= 10); // Safety limit 1000 records
    } catch (e) {
        console.error("DNS Fetch Error:", e);
    }
    
    // _atproto. で始まるものだけを返す
    return allRecords.filter((r: any) => r.name.startsWith('_atproto.'));
}

// --- Audit Log Management (Split Records) ---

export async function logRejection(env: Env, handle: string, user: string, reason: string) {
    // Unique record per rejection: _log.<timestamp>
    const timestamp = Date.now();
    const logName = `_log.${timestamp}`; 
    const content = `${new Date().toLocaleString('ja-JP', {timeZone:'Asia/Tokyo'})}|${handle}|${user}|${reason}`;
    
    await registerDns(env, logName, content, "Audit Log Entry");
}

export function getAuditLogsFromRecords(records: any[]): string[] {
    // Filter records starting with _log.
    const logs = records.filter((r: any) => r.name.includes('_log.'));
    // Sort descending by name (timestamp)
    logs.sort((a: any, b: any) => b.name.localeCompare(a.name));
    return logs.map((r: any) => r.content);
}

export async function clearAllAuditLogs(env: Env, records: any[]): Promise<number> {
    const logs = records.filter((r: any) => r.name.includes('_log.'));
    for (const log of logs) {
        await deleteDnsRecord(env, log.id);
    }
    return logs.length;
}