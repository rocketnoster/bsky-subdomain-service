# ☁️ bsky.blog (Unofficial Community Service)

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Status](https://img.shields.io/badge/status-Prototype-orange.svg) ![Platform](https://img.shields.io/badge/platform-Cloudflare%20Workers-f38020.svg)

> **⚠️ IMPORTANT DISCLAIMER / 重要なお知らせ**
>
> **[English]**
> This project is an independent community initiative and is **NOT** affiliated with, endorsed by, or connected to Bluesky Social, PBLLC. The `bsky.blog` domain serves as a prototype to demonstrate automated custom domain issuance on the AT Protocol.
>
> **[日本語]**
> 本プロジェクトは個人のコミュニティ活動によるものであり、Bluesky Social, PBLLC（公式）とは一切関係ありません。`bsky.blog` ドメインは、AT Protocol上でのカスタムドメイン自動発行を実証するためのプロトタイプとして運用されています。

---

## 📖 Overview

**bsky.blog** is a serverless application built on **Cloudflare Workers** that allows Bluesky users to easily acquire a subdomain (e.g., `username.bsky.blog`) as their handle.

The goal of this project is to:
1.  **Democratize Identity:** Lower the technical barrier for users to own custom domains.
2.  **Safety First:** Demonstrate how a handle service can operate safely with strict moderation.
3.  **Open Source:** Serve as a reference implementation for the AT Protocol community.

## 🛡️ Safety & Transparency Measures (Trust & Safety)

To ensure the safety of the Bluesky ecosystem and prevent abuse, this service implements the following **strict security measures**:

### 1. No Sensitive Data Storage (パスワード非保持)
* **Zero-Knowledge Auth:** We do **NOT** store App Passwords or Email addresses.
* The system only retains the user's **DID (Decentralized Identifier)** and expiration metadata in public DNS TXT records to maintain the service.

### 2. AI-Powered Moderation (AIによる厳格な審査)
* **Google Gemini 2.5 Flash:** Every handle request is analyzed by a generative AI model before registration.
* **Rejection Criteria:**
    * Impersonation of Bluesky Team, public figures, or corporations.
    * Hate speech, sexual content, violence, and harassment.
    * Scam, phishing, or spam-related keywords.

### 3. Static Protection Filters (静的フィルタリング)
* **Reserved Words:** High-value domains (e.g., `admin`, `support`, `official`, `japan`) are statically blocked.
* **Official Protection:** Names of Bluesky executives and core developers are strictly forbidden to prevent impersonation.

### 4. Automated "Zombie" Cleanup (自動クリーニング)
* **30-Day Expiration:** Handles are valid for 30 days and must be renewed by the active user.
* **Consistency Check:** A daily cron job (`runDailySweep`) verifies if the user still uses the handle on Bluesky. If a user reverts to `bsky.social` or deletes their account, the subdomain is automatically released.

---

## 🛠️ Technical Architecture

This project runs entirely on the Edge, using **Cloudflare DNS as a database**.

* **Runtime:** Cloudflare Workers
* **Storage:** Cloudflare DNS (TXT Records)
    * *Why?* To overcome KV consistency delays and utilize the speed of global DNS propagation.
* **AI Engine:** Google Gemini API
* **Protocol:** `@atproto/api`

## ⚙️ Development & Setup

This repository is open-sourced for transparency. Sensitive configurations are excluded.

### Prerequisites
* Node.js & npm
* Cloudflare Wrangler CLI
* A Cloudflare Zone (Domain)

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/bsky-blog-service.git](https://github.com/YOUR_USERNAME/bsky-blog-service.git)
    cd bsky-blog-service
    npm install
    ```

2.  **Configure Config**
    Copy the example config and set your Admin DID (to access the dashboard).
    ```bash
    cp src/config.example.ts src/config.ts
    # Edit src/config.ts and set SUPER_ADMIN_DID
    ```

3.  **Set Secrets**
    Do not commit secrets to Git. Use `wrangler secret`.
    ```bash
    npx wrangler secret put CLOUDFLARE_API_TOKEN
    npx wrangler secret put CLOUDFLARE_ZONE_ID
    npx wrangler secret put GEMINI_API_KEY
    npx wrangler secret put BOT_PASSWORD
    ```

4.  **Deploy**
    ```bash
    npm run deploy
    ```

## ⚖️ License

MIT License

Copyright (c) 2025 Ryuya Sakamoto

---

*This software is provided "as is", without warranty of any kind. Use at your own risk.*