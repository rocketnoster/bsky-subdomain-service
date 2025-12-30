/**
 * src/config.ts (Template)
 * Copy this file to 'src/config.ts' and fill in your SUPER_ADMIN_DID.
 */

// ============================================================================
// 1. OFFICIAL TEAM & KEY PERSONS (Impersonation Block)
// ============================================================================
export const OFFICIAL_TEAM_PATTERNS = [
    'jay', 'jaygraber', 'graber',
    'rose', 'rosewang',
    'paul', 'pfrazee', 'frazee',
    'jack', 'dorsey',
    'jeremie', 'miller',
    'mike', 'masnick',
    'kinjal', 'shah',
    'sascha', 'meinrath',
    'dholmgren', 'holmgren',
    'whyrusleeping', 'jeromy',
    'goldman', 'aaron',
    'kleppmann', 'martin',
    'bnewbold', 'newbold',
    'vcanfield', 'bryan', 'emily',
    'divy', 'sharma',
    'bsky-team', 'bsky-social', 'bsky-app', 'bsky-blog',
    'atproto', 'at-protocol', 'authenticated',
];

// ============================================================================
// 2. DANGEROUS PATTERNS (Partial Match Block)
// ============================================================================
export const DANGEROUS_PATTERNS = [
    'bsky', 'bluesky',
    'admin', 'administrator',
    'mod', 'moderator',
    'official', 'officiai',
    'staff', 'member', 'employee',
    'support', 'help', 'contact', 'info',
    'legal', 'policy', 'privacy', 'terms',
    'safety', 'trust', 'security', 'sec',
    'verify', 'verified', 'check', 'badge',
    'sys', 'system', 'root', 'sudo',
    'corp', 'inc', 'ltd', 'llc',
    'pds', 'plc', 'did', 'bgs', 'relay',
    'ozone', 'labeler', 'feed', 'algo',
    'login', 'signin', 'auth', 'password',
    'wallet', 'bank', 'finance', 'invest',
    'crypto', 'bitcoin', 'eth', 'gift',
    'free', 'promo', 'claim', 'update',
    'recover', 'unlock', 'service',
];

// ============================================================================
// 3. RESERVED WORDS (Exact Match Block)
// ============================================================================
export const RESERVED_WORDS = [
    'www', 'web', 'mail', 'email', 'remote',
    'ns1', 'ns2', 'smtp', 'pop', 'imap',
    'ftp', 'api', 'dev', 'stage', 'prod',
    'test', 'beta', 'demo', 'status', 'blog',
    'shop', 'store', 'app', 'news', 'press',
    'google', 'youtube', 'android', 'gmail',
    'apple', 'iphone', 'mac', 'ios',
    'amazon', 'aws', 'meta', 'facebook', 'instagram', 'whatsapp',
    'twitter', 'x', 'tiktok', 'snapchat', 'linkedin',
    'microsoft', 'windows', 'github', 'openai', 'chatgpt', 'gemini',
    'netflix', 'disney', 'sony', 'nintendo',
    'toyota', 'honda', 'nissan', 'suzuki', 'subaru', 'mazda', 'mitsubishi',
    'sony', 'nintendo', 'sega', 'capcom', 'konami', 'panasonic',
    'softbank', 'docomo', 'au', 'rakuten', 'yahoo', 'line', 'mercari',
    'uniqlo', 'muji', '711', 'seveneleven',
    'japan', 'jp', 'nippon',
    'usa', 'us', 'america',
    'uk', 'britain', 'eu', 'europe',
    'china', 'cn', 'korea', 'kr',
    'un', 'who', 'nato', 'nasa',
    'police', 'gov', 'government',
    'tokyo', 'osaka', 'kyoto', 'aichi', 'nagoya',
    'newyork', 'london', 'paris', 'berlin'
];

export const EXPIRATION_DAYS = 30;

// Enter the administrator's Bluesky account DID here.
export const SUPER_ADMIN_DID = "did:plc:your_admin_did_here";