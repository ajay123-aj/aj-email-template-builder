/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_OPENAI_BASE_URL: string;
  readonly VITE_OPENAI_MODEL: string;
  readonly VITE_ASK_AI_ENABLED: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
