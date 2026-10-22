import type { TideCloakRuntimeConfig } from "../domain/tidecloak.ts";

type PublicEnvironment = Readonly<Record<string, string | undefined>>;

function httpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function loadTideCloakConfigFromEnv(
  environment: PublicEnvironment,
): TideCloakRuntimeConfig | null {
  const authServerUrl = environment.NEXT_PUBLIC_TIDECLOAK_AUTH_SERVER_URL?.trim();
  const realm = environment.NEXT_PUBLIC_TIDECLOAK_REALM?.trim();
  const resource = environment.NEXT_PUBLIC_TIDECLOAK_CLIENT_ID?.trim();
  const appOrigin = environment.NEXT_PUBLIC_SECUREDOCS_ORIGIN?.trim();
  if (!authServerUrl || !realm || !resource || !appOrigin) return null;

  const authServer = httpUrl(authServerUrl);
  const origin = httpUrl(appOrigin);
  if (!authServer || !origin || origin.origin !== appOrigin.replace(/\/$/, "")) {
    return null;
  }

  return {
    realm,
    "auth-server-url": authServer.href,
    resource,
    "public-client": true,
    "confidential-port": 0,
    redirectUri: `${origin.origin}/auth/redirect`,
    silentCheckSsoRedirectUri: `${origin.origin}/silent-check-sso.html`,
  };
}

export function loadTideCloakConfig(): TideCloakRuntimeConfig | null {
  return loadTideCloakConfigFromEnv(process.env);
}
