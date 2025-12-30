import { createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

// Requestの型定義ヘルパー
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

// ダミーの環境変数を作成 (型エラー回避のため)
const mockEnv = {
    CLOUDFLARE_API_TOKEN: 'dummy-token',
    CLOUDFLARE_ZONE_ID: 'dummy-zone-id',
    GEMINI_API_KEY: 'dummy-api-key',
    BOT_HANDLE: 'bsky.blog',
    BOT_PASSWORD: 'dummy-password',
    // 他に必要な変数があればここに追加
};

describe('bsky.blog Worker', () => {
    // ユニットテスト形式
    it('responds with 200 OK on root (unit style)', async () => {
        const request = new IncomingRequest('http://example.com/');
        const ctx = createExecutionContext();
        
        // ここで env の代わりに mockEnv を渡す
        const response = await worker.fetch(request, mockEnv, ctx);
        
        await waitOnExecutionContext(ctx);
        expect(response.status).toBe(200);
    });

    // 統合テスト形式 (SELF.fetchは内部的に設定を読み込むため、ここでは変更不要)
    it('responds with 200 OK on root (integration style)', async () => {
        const response = await SELF.fetch('https://example.com/');
        expect(response.status).toBe(200);
    });
});