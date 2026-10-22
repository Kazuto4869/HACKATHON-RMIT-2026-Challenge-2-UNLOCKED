import assert from "node:assert/strict";
import { test } from "node:test";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { verifyTideCloakToken } from "@tidecloak/verify";
import { createTideAuthorizationAdapter } from "../src/server/tide-authorization.ts";

test("real SDK verifier rejects altered signatures, wrong issuers/clients/audiences and expired tokens", async (context) => {
  // Local signing fixtures exercise the verifier; they are not Tide enrollment or QEA evidence.
  context.mock.method(console, "error", () => {});
  const keys = await generateKeyPair("EdDSA");
  const otherKeys = await generateKeyPair("EdDSA");
  const jwk = { ...await exportJWK(keys.publicKey), kid: "local-test-key", alg: "EdDSA" };
  const config = {
    realm: "test-realm", "auth-server-url": "http://127.0.0.1:8080/", resource: "test-client",
    "public-client": true, "confidential-port": 0,
    redirectUri: "http://127.0.0.1:3000/auth/redirect",
    silentCheckSsoRedirectUri: "http://127.0.0.1:3000/silent-check-sso.html",
    jwk: { keys: [jwk] },
  } as const;
  const adapter = createTideAuthorizationAdapter(config, verifyTideCloakToken);
  const base = {
    sub: "synthetic-requester", typ: "Bearer", aud: config.resource, azp: config.resource,
    iss: "http://127.0.0.1:8080/realms/test-realm", exp: Math.floor(Date.now() / 1000) + 120,
    resource_access: { "test-client": { roles: ["doc_read_patient_safety_brief"] } },
  };
  async function sign(claims: Record<string, unknown>, key = keys.privateKey) {
    return new SignJWT(claims).setProtectedHeader({ alg: "EdDSA", kid: jwk.kid }).sign(key);
  }
  async function resolve(token: string) {
    return adapter.resolveViewer(new Request("http://127.0.0.1/api/documents/test", { headers: { Authorization: `Bearer ${token}` } }));
  }
  const viewer = await resolve(await sign(base));
  assert.deepEqual(viewer, { subject: base.sub, roles: ["doc_read_patient_safety_brief"] });
  for (const claims of [
    { ...base, iss: "https://attacker.invalid/realm" },
    { ...base, azp: "other-client" },
    { ...base, aud: "other-client" },
    { ...base, exp: 1 },
    { ...base, typ: "ID" },
  ]) assert.equal(await resolve(await sign(claims)), null);
  assert.equal(await resolve(await sign(base, otherKeys.privateKey)), null);
  assert.equal(await resolve("not.a.valid.jwt"), null);
});
