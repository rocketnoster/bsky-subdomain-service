// src/content.ts

export const SITE_CONTENT = {
    status_msg: "Welcome to bsky.blog<br>This project is an independent community initiative and is NOT affiliated with, endorsed by, or connected to Bluesky Social, PBLLC. <br>The bsky.blog domain serves as a prototype to demonstrate automated custom domain issuance on the AT Protocol.",
    
    // --- 卒業（独自ドメイン移行）ガイド ---
    graduate_guide_jp: `
    <div style="font-size:13px; line-height:1.6; color:#334155;">
        <p style="margin-bottom:10px;"><strong>🚀 ステップアップ: 独自ドメインへ</strong><br>
        いつまでもサブドメインに留まる必要はありません。自分のドメインを持つことで、Bluesky上のIDが完全にあなたのものになります。</p>
        
        <div style="background:#f0f9ff; border-left:4px solid #0ea5e9; padding:10px; margin-bottom:10px;">
            <strong>推奨: 公式連携で購入する</strong><br>
            Bluesky公式設定からドメインを購入すると、面倒なDNS設定が自動で完了します。
        </div>

        <ol style="padding-left:20px; margin:0;">
            <li><a href="https://account.bsky.app/" target="_blank" style="color:#0ea5e9; text-decoration:underline;">公式アカウント設定 (account.bsky.app)</a> に移動する</li>
            <li>ログインをする</li>
            <li>使用したいドメイン名を検索しドメインを購入<br>
            <span style="font-size:11px; color:#64748b;">※購入時にDNS自動設定のオプションを選んでください</span></li>
            <li>購入・設定後、この下のフォームに取得したドメインを入力して「Set & Release」を押す</li>
        </ol>
        <p style="font-size:11px; color:#64748b; margin-top:5px;">※この操作を行うと、現在のサブドメインは即座に開放されます。</p>
    </div>`,

    graduate_guide_en: `
    <div style="font-size:13px; line-height:1.6; color:#334155;">
        <p style="margin-bottom:10px;"><strong>🚀 Graduate to your own Domain</strong><br>
        Own your identity on Bluesky completely by switching to a custom domain.</p>
        
        <div style="background:#f0f9ff; border-left:4px solid #0ea5e9; padding:10px; margin-bottom:10px;">
            <strong>Recommended: Official Purchase</strong><br>
            Buying via Bluesky's official settings automates the complex DNS configuration.
        </div>

        <ol style="padding-left:20px; margin:0;">
            <li>Go to <a href="https://account.bsky.app/" target="_blank" style="color:#0ea5e9; text-decoration:underline;">Official Account Settings</a></li>
            <li>Log in</li>
            <li>Search for a domain name and use it as your handle!<br>
            <span style="font-size:11px; color:#64748b;">*Choose the auto-configure DNS option during checkout.</span></li>
            <li>After setup, enter your new domain below and click "Set & Release".</li>
        </ol>
        <p style="font-size:11px; color:#64748b; margin-top:5px;">*This action will immediately release your current subdomain.</p>
    </div>`,

    // --- 利用規約 ---
    terms_jp: `【bsky.blog 利用規約】

1. サービスの提供
本サービスはBlueskyユーザーに対し、サブドメイン（ハンドル）を無償で提供するものです。運営者の都合により、予告なくサービスを終了する場合があります。

2. 有効期限と更新
ハンドルの有効期限は登録から30日間です。期限内に更新手続きが行われない場合、ハンドルは自動的に停止・削除され、他のユーザーが取得可能な状態になります。

3. 禁止事項
以下のハンドル作成を禁止します。
・公的機関、企業、著名人へのなりすまし
・ヘイトスピーチ、暴力的、性的な表現
・詐欺、フィッシング、スパム行為
・その他、運営が不適切と判断したもの

4. 審査と削除権限
ハンドルの登録にはAIによる自動審査が適用されます。また、登録後であっても、運営の判断により予告なくハンドルの停止・削除を行う権利を有します。

5. 免責事項
本サービスの利用により生じた損害について、運営者は一切の責任を負いません。現状有姿（AS-IS）で提供されます。`,

    terms_en: `[ Terms of Service ]

1. Service Provision
This service provides subdomains (handles) for Bluesky users free of charge. We reserve the right to terminate the service at any time without notice.

2. Expiration and Renewal
Handles are valid for 30 days. If not renewed within the period, the handle will be automatically suspended and released for others to register.

3. Prohibited Activities
The following handles are prohibited:
- Impersonation of governments, companies, or public figures.
- Hate speech, violence, or sexual content.
- Scams, phishing, or spam.
- Any content deemed inappropriate by the admin.

4. Moderation and Revocation
Handle registration is subject to automated AI review. The admin reserves the right to suspend or delete any handle at any time, for any reason, without prior notice.

5. Disclaimer
The service is provided "AS IS". The admin assumes no responsibility for any damages arising from the use of this service.`,

    // --- プライバシーポリシー ---
    privacy_jp: `【プライバシーポリシー】

1. 収集する情報
本サービスは、以下の情報を収集・保存します。
・Blueskyの分散型ID (DID)
・申請されたハンドル名
・アクセスログ（IPアドレス、タイムスタンプ）

2. 情報の利用目的
・サービスの提供および本人確認
・不正利用の防止および監査
・システムの維持管理

3. 外部サービスへの送信
審査プロセスのため、申請されたハンドル名は「Google Gemini API」に送信され、自動的に判定されます。Googleのプライバシーポリシーに従って処理されます。

4. ログの保存
審査拒否の履歴およびアクセスログは、セキュリティ確保のため一定期間保存されます。これらは運営者のみが閲覧可能です。

5. お問い合わせ
本サービスに関するお問い合わせは、Bluesky上の公式アカウント (@bsky.blog) までご連絡ください。`,

    privacy_en: `[ Privacy Policy ]

1. Information We Collect
We collect and store the following information:
- Bluesky Decentralized ID (DID)
- Requested handle name
- Access logs (IP address, timestamp)

2. Purpose of Use
- To provide the service and verify identity.
- To prevent abuse and for auditing purposes.
- To maintain and secure the system.

3. Third-Party Sharing
Requested handle names are sent to the "Google Gemini API" for automated safety moderation. Data is processed in accordance with Google's Privacy Policy.

4. Data Retention
Rejection history and access logs are retained for a limited period for security purposes. Only the administrator has access to this data.

5. Contact
For inquiries regarding this service, please contact the official account on Bluesky (@bsky.blog).`
};