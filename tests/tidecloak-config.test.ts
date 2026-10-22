import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { loadTideCloakConfigFromEnv, mergeTideCloakAdapter } from "../src/server/tidecloak-config.server.ts";

const configuredEnv = {
  NEXT_PUBLIC_TIDECLOAK_AUTH_SERVER_URL: "http://127.0.0.1:8080/",
  NEXT_PUBLIC_TIDECLOAK_REALM: "securedocs",
  NEXT_PUBLIC_TIDECLOAK_CLIENT_ID: "securedocs-client",
  NEXT_PUBLIC_SECUREDOCS_ORIGIN: "http://127.0.0.1:3000",
};

describe("TideCloak runtime configuration", () => {
  test("returns null unless every public adapter value is configured", () => {
    assert.equal(
      loadTideCloakConfigFromEnv({
        ...configuredEnv,
        NEXT_PUBLIC_TIDECLOAK_CLIENT_ID: "",
      }),
      null,
    );
  });

  test("builds the official adapter shape with exact redirect origins", () => {
    assert.deepEqual(loadTideCloakConfigFromEnv(configuredEnv), {
      realm: "securedocs",
      "auth-server-url": "http://127.0.0.1:8080/",
      resource: "securedocs-client",
      "public-client": true,
      "confidential-port": 0,
      redirectUri: "http://127.0.0.1:3000/auth/redirect",
      silentCheckSsoRedirectUri: "http://127.0.0.1:3000/silent-check-sso.html",
    });
  });

  test("rejects malformed or non-http origins instead of weakening auth", () => {
    assert.equal(
      loadTideCloakConfigFromEnv({
        ...configuredEnv,
        NEXT_PUBLIC_SECUREDOCS_ORIGIN: "file:///tmp/securedocs",
      }),
      null,
    );
  });

  test("requires a matching public Tide adapter and embedded public keys", () => {
    const config = loadTideCloakConfigFromEnv(configuredEnv)!;
    const key = { kty: "OKP", crv: "Ed25519", x: "synthetic-public-key" };
    const adapter = { realm: config.realm, resource: config.resource, "public-client": true, jwk: { keys: [key] }, vendorId: "synthetic-vendor", credentials: { secret: "must-not-reach-browser" } };
    assert.equal(mergeTideCloakAdapter(config, {}) , null);
    assert.equal(mergeTideCloakAdapter(config, { ...adapter, jwk: undefined }), null);
    assert.equal(mergeTideCloakAdapter(config, { ...adapter, resource: "different-client" }), null);
    assert.equal(mergeTideCloakAdapter(config, { ...adapter, jwk: { keys: [{ ...key, d: "private-material" }] } }), null);
    const merged = mergeTideCloakAdapter(config, adapter)!;
    assert.equal(merged.vendorId, "synthetic-vendor");
    assert.equal(Object.hasOwn(merged, "credentials"), false);
    assert.deepEqual(merged.jwk?.keys, [key]);
  });
});
