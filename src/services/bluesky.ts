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
        const text = `@${handle} ⏳ [Action Required] \nYour handle expires in 3 days. \nRenew here: https://bsky.blog \n\n💡 Tired of monthly renewals? \nConsider purchasing a real domain via Bluesky Settings to own your identity permanently.\n(独自ドメインを購入して、毎月の更新作業から卒業しましょう！)`;
        
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