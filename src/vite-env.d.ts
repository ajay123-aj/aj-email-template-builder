/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_OPENAI_BASE_URL: string;
  readonly VITE_OPENAI_MODEL: string;
  readonly VITE_ASK_AI_ENABLED: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_SEND_EMAIL_API_URL?: string;
  /** Base URL for SEO (canonical, OG, sitemap). e.g. https://yourdomain.com */
  readonly VITE_SITE_URL?: string;
  /** Backend origin for AJ Email Editor APIs (lead collect, contact), e.g. http://localhost:3001 (no path). If unset, those calls are skipped. */
  readonly VITE_LEAD_COLLECT_API_ORIGIN?: string;
  /** Optional path prefix before /api, e.g. /api-backend (matches server API_PREFIX). */
  readonly VITE_API_PREFIX?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
