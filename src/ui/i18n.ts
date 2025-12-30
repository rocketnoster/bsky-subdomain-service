// src/ui/i18n.ts

export type Lang = 'ja' | 'en';

export const translations = {
    ja: {
        title: "bsky.blog",
        welcome: "Blueskyのためのサブドメイン取得サービス",
        login_header: "Blueskyと連携",
        login_input_id: "ハンドル または メールアドレス",
        login_input_pass: "アプリパスワード",
        login_btn: "次へ →",
        
        reg_title: "✨ 新しいハンドル",
        reg_subdomain_label: "希望のサブドメイン",
        reg_terms_label: "利用規約とポリシー",
        reg_create_btn: "作成する (30日間有効)",
        reg_cancel: "キャンセル",
        
        dash_active: "✅ 有効",
        dash_expired: "❌ 期限切れ",
        dash_days_left: "残り日数",
        dash_admin: "管理者 (無期限)",
        
        btn_graduate: "🎓 卒業 (独自ドメインへ)",
        btn_renew: "期間延長 (30日)",
        btn_revert: "↩️ 元に戻す",
        btn_logout: "ログアウト",
        
        desc_graduate: "自分のドメインを取得して移行します",
        desc_revert: "元のハンドルに戻します",
        
        footer_terms: "利用規約",
        footer_privacy: "プライバシーポリシー",
        footer_powered: "Powered by Cloudflare & Gemini"
    },
    en: {
        title: "bsky.blog",
        welcome: "Get your subdomain for Bluesky",
        login_header: "Connect with Bluesky",
        login_input_id: "Handle or Email",
        login_input_pass: "App Password",
        login_btn: "Next →",
        
        reg_title: "✨ New Handle",
        reg_subdomain_label: "Subdomain",
        reg_terms_label: "Terms & Policy",
        reg_create_btn: "Create (30 Days)",
        reg_cancel: "Cancel",
        
        dash_active: "✅ Active",
        dash_expired: "❌ Expired",
        dash_days_left: "days left",
        dash_admin: "Admin (Lifetime)",
        
        btn_graduate: "🎓 Graduate (Own Domain)",
        btn_renew: "Renew (30d)",
        btn_revert: "↩️ Revert",
        btn_logout: "Logout",
        
        desc_graduate: "Move to your own domain.",
        desc_revert: "Back to original handle.",
        
        footer_terms: "Terms of Service",
        footer_privacy: "Privacy Policy",
        footer_powered: "Powered by Cloudflare & Gemini"
    }
};

export function t(key: keyof typeof translations['en'], lang: Lang): string {
    return translations[lang][key] || translations['en'][key];
}