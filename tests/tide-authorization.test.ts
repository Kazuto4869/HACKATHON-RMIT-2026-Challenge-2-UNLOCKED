import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { DocumentMetadata } from "../src/domain/documents.ts";
import {
  createTideAuthorizationAdapter,
  documentRoleFor,
  extractAccessToken,
  type TideTokenClaims,
} from "../src/server/tide-authorization.ts";

const config = {
  realm: "securedocs",
  "auth-server-url": "http://127.0.0.1:8080/",
  resource: "securedocs-client",
  "public-client": true,
  "confidential-port": 0,
  redirectUri: "http://127.0.0.1:3000/auth/redirect",
  silentCheckSsoRedirectUri: "http://127.0.0.1:3000/silent-check-sso.html",
} as const;

const patientDocument: DocumentMetadata = {
  id: "patient-safety-brief",
  title: "Patient safety brief",
  summary: "Synthetic incident patterns prepared for controlled review.",
  ownerId: "Demo Health Lab",
  createdAt: "2026-10-19T09:30:00.000Z",
  isProtected: true,
  status: "RESTRICTED",
};

const coastalDocument: DocumentMetadata = {
  ...patientDocument,
  id: "coastal-resilience-notes",
  title: "Coastal resilience field notes",
};

describe("Tide access-token boundary", () => {
  test("uses a bearer access token before the documented kcToken cookie", () => {
    const request = new Request("http://127.0.0.1/api/documents/a", {
      headers: {
        authorization: "Bearer header-token",
        cookie: "kcToken=cookie-token",
      },
    });

    assert.equal(extractAccessToken(request), "header-token");
  });

  test("fails closed on a malformed authorization header instead of falling back", () => {
    const request = new Request("http://127.0.0.1/api/documents/a", {
      headers: {
        authorization: "Basic client-value",
        cookie: "kcToken=cookie-token",
      },
    });

    assert.equal(extractAccessToken(request), null);
  });

  test("accepts the documented kcToken cookie when no authorization header exists", () => {
    const request = new Request("http://127.0.0.1/api/documents/a", {
      headers: { cookie: "theme=paper; kcToken=cookie-token; another=value" },
    });

    assert.equal(extractAccessToken(request), "cookie-token");
  });

  test("creates a viewer only from a verified token and app-client roles", async () => {
    const verifyToken = async (_config: object, token: string): Promise<TideTokenClaims | null> =>
      token === "verified"
        ? {
            sub: "requester-01",
            typ: "Bearer",
            aud: config.resource,
            exp: 4102444800,
            realm_access: { roles: ["doc_read_coastal_resilience_notes"] },
            resource_access: {
              "securedocs-client": { roles: ["doc_read_patient_safety_brief"] },
            },
          }
        : null;
    const adapter = createTideAuthorizationAdapter(config, verifyToken);

    const viewer = await adapter.resolveViewer(
      new Request("http://127.0.0.1", {
        headers: { authorization: "Bearer verified" },
      }),
    );

    assert.deepEqual(viewer, {
      subject: "requester-01",
      roles: ["doc_read_patient_safety_brief"],
    });
    assert.equal(await adapter.canReadDocument(viewer!, patientDocument), true);
    assert.equal(await adapter.canReadDocument(viewer!, coastalDocument), false);
  });

  test("treats rejected, malformed, expired, wrong-issuer, and wrong-client tokens as anonymous", async () => {
    const rejectedTokens: string[] = [];
    const adapter = createTideAuthorizationAdapter(config, async (_config, token) => {
      rejectedTokens.push(token);
      return null;
    });

    for (const token of ["forged", "expired", "wrong-issuer", "wrong-client", "malformed"]) {
      const viewer = await adapter.resolveViewer(
        new Request("http://127.0.0.1", {
          headers: { authorization: `Bearer ${token}` },
        }),
      );
      assert.equal(viewer, null);
    }

    assert.deepEqual(rejectedTokens, [
      "forged",
      "expired",
      "wrong-issuer",
      "wrong-client",
      "malformed",
    ]);
  });

  test("denies when token verification infrastructure throws", async () => {
    const adapter = createTideAuthorizationAdapter(config, async () => {
      throw new Error("JWKS unavailable");
    });

    const viewer = await adapter.resolveViewer(
      new Request("http://127.0.0.1", {
        headers: { authorization: "Bearer opaque-token" },
      }),
    );

    assert.equal(viewer, null);
  });

  test("rejects signed non-access, expired, and sender-bound tokens", async () => {
    const roles = { "securedocs-client": { roles: ["doc_read_patient_safety_brief"] } };
    for (const claims of [
      { sub: "requester-01", aud: config.resource, typ: "ID", exp: 4102444800, resource_access: roles },
      { sub: "requester-01", aud: config.resource, typ: "Bearer", resource_access: roles },
      { sub: "requester-01", aud: config.resource, typ: "Bearer", exp: 1, resource_access: roles },
      { sub: "requester-01", aud: config.resource, typ: "DPoP", exp: 4102444800, resource_access: roles },
      { sub: "requester-01", aud: config.resource, typ: "Bearer", exp: 4102444800, cnf: { jkt: "bound" }, resource_access: roles },
    ]) {
      const adapter = createTideAuthorizationAdapter(config, async () => claims);
      assert.equal(await adapter.resolveViewer(new Request("http://127.0.0.1", {
        headers: { authorization: "Bearer signed-token" },
      })), null);
    }
  });

  test("maps each protected document to one stable client role", () => {
    assert.equal(documentRoleFor("patient-safety-brief"), "doc_read_patient_safety_brief");
    assert.equal(documentRoleFor("coastal-resilience-notes"), "doc_read_coastal_resilience_notes");
    assert.equal(documentRoleFor("funding-review-memo"), "doc_read_funding_review_memo");
    assert.equal(documentRoleFor("sharing-charter"), null);
    assert.equal(documentRoleFor("toString"), null);
    assert.equal(documentRoleFor("../../admin"), null);
    assert.equal(documentRoleFor("45dd55c6-303c-4d85-ab64-359984cdd301"), "doc_read_45dd55c6303c4d85ab64359984cdd301");
  });

  test("allows only the verified owner or exact document-role holder", async () => {
    const adapter = createTideAuthorizationAdapter(config, async () => null);
    const document = { ...patientDocument, ownerId: "real-owner" };
    assert.equal(await adapter.canReadDocument({ subject: "real-owner", roles: [] }, document), true);
    assert.equal(await adapter.canReadDocument({ subject: "other-user", roles: [] }, document), false);
    assert.equal(await adapter.canReadDocument({ subject: "other-user", roles: ["doc_read_coastal_resilience_notes"] }, document), false);
  });

  test("Guardian review access requires the verified realm-management client role", async () => {
    const base = { sub: "requester", typ: "Bearer", aud: config.resource, exp: 4102444800 };
    for (const [claims, expected] of [
      [{ ...base, realm_access: { roles: ["tide-realm-admin"] } }, undefined],
      [{ ...base, resource_access: { "realm-management": { roles: ["tide-realm-admin"] } } }, true],
    ] as const) {
      const adapter = createTideAuthorizationAdapter(config, async () => claims);
      const viewer = await adapter.resolveViewer(new Request("http://127.0.0.1", { headers: { Authorization: "Bearer test-fixture" } }));
      assert.equal(viewer?.isGuardian, expected);
    }
  });
});
