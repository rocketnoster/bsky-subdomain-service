// src/utils/helpers.ts
import { DnsRecordMeta } from '../types';

export function parseMeta(record: any): DnsRecordMeta {
    const res: DnsRecordMeta = { did: '', exp: 0, old: '', reminded: false };
    
    if (record.content.includes('did=')) {
        res.did = record.content.replace('did=', '').trim();
    }
    
    if (record.comment) {
        record.comment.split(';').forEach((p: string) => {
            const [k, v] = p.split('=');
            if (k === 'did') res.did = v;
            if (k === 'exp') res.exp = parseInt(v);
            if (k === 'old') res.old = v;
            if (k === 'reminded') res.reminded = (v === '1'); // ★ 追加
        });
    }
    return res;
}