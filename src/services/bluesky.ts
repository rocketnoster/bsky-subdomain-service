// src/services/bluesky.ts
import { BskyAgent, RichText } from '@atproto/api';

export function createAgent() {
    return new BskyAgent({ service: 'https://bsky.social' });
}

export async function ensureFollowBot(agent: BskyAgent, botHandle: string) {
    try {
        const r = await agent.resolveHandle({ handle: botHandle });
        await agent.follow(r.data.did);
    } catch (e) {
        // Ignore follow errors
    }
}

// ★ 追加: リマインド送信機能
export async function sendRemindPost(agent: BskyAgent, targetDid: string, handle: string) {
    try {
        const text = `@${handle} ⏳ [Renewal Alert] \nYour handle expires in 3 days. \nPlease renew at https://bsky.blog to keep it. \n(期限が近づいています。更新してください)`;
        
        const rt = new RichText({ text });
        await rt.detectFacets(agent);

        await agent.post({
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
        });
        return true;
    } catch (e) {
        console.error(`Failed to remind ${handle}:`, e);
        return false;
    }
}