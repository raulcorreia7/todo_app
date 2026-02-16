/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LLM7_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
