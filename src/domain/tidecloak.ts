export interface TideCloakRuntimeConfig {
  realm: string;
  "auth-server-url": string;
  resource: string;
  "public-client": true;
  "confidential-port": 0;
  redirectUri: string;
  silentCheckSsoRedirectUri: string;
}
