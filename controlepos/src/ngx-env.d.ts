// src/ngx-env.d.ts

export interface NgxEnv {
  NG_APP_GOOGLE_SHEETS_API_KEY: string;
  // Adicione outras variáveis com prefixo NG_APP_ aqui, se houver
}

declare global {
  interface ImportMeta {
    readonly env: NgxEnv;
  }
}

export {}; // Mantém o arquivo como um módulo
