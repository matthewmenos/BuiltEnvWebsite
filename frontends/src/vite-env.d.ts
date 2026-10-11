/// <reference types="vite/client" />

// Declared locally so the app type-checks without depending on vite/client
// being resolvable, and so VITE_-prefixed build-time vars are typed.
interface ImportMetaEnv {
  readonly VITE_R2_PUBLIC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
