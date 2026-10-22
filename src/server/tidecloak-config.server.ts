import type { TideCloakRuntimeConfig } from "../domain/tidecloak.ts";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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
  const config = loadTideCloakConfigFromEnv(process.env);
  if (!config) return null;
  try {
    return mergeTideCloakAdapter(config, JSON.parse(readFileSync(join(process.cwd(), "tidecloak.json"), "utf8").replace(/^\uFEFF/, "")));
  } catch { return null; }
}

export function mergeTideCloakAdapter(config: TideCloakRuntimeConfig, input: unknown): TideCloakRuntimeConfig | null {
  if (typeof input !== "object" || input === null) return null;
  const adapter = input as Record<string, unknown>;
  if (adapter.realm !== config.realm || adapter.resource !== config.resource || adapter["public-client"] !== true) return null;
  const jwk = adapter.jwk as { keys?: unknown } | undefined;
  if (!jwk || !Array.isArray(jwk.keys) || !jwk.keys.length) return null;
  const keys: Record<string, unknown>[] = [];
  for (const key of jwk.keys) {
    if (typeof key !== "object" || key === null || !["OKP", "EC", "RSA"].includes(key.kty) ||
        ["d", "p", "q", "dp", "dq", "qi", "oth", "k"].some((field) => Object.hasOwn(key, field))) return null;
    keys.push(key);
  }
  const result: TideCloakRuntimeConfig = { ...config, jwk: { keys } };
  const publicFields = ["homeOrkUrl", "vendorId", "gVVK", "vvkId", "orkUrl", "payerPublic", "obfGVVK", "gVRKCertificate", "thresholdT", "thresholdN", "logoUrl", "backgroundUrl", "ssl-required"];
  for (const [name, value] of Object.entries(adapter)) {
    if ((publicFields.includes(name) || name.startsWith("client-origin-auth-")) && (typeof value === "string" || typeof value === "number")) result[name] = value;
  }
  return result;
}
