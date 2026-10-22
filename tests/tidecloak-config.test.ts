import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { loadTideCloakConfigFromEnv } from "../src/server/tidecloak-config.server.ts";

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
});
