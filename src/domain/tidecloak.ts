export interface TideCloakRuntimeConfig {
  [key: string]: unknown;
  realm: string;
  "auth-server-url": string;
  resource: string;
  "public-client": true;
  "confidential-port": 0;
  redirectUri: string;
  silentCheckSsoRedirectUri: string;
  jwk?: { keys: readonly Record<string, unknown>[] };
}
