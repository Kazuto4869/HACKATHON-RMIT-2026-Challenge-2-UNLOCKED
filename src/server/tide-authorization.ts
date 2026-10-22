import type {
  DocumentMetadata,
  VerifiedViewer,
} from "../domain/documents.ts";
import type { TideCloakRuntimeConfig } from "../domain/tidecloak.ts";
import type { CanReadDocument } from "./document-service.ts";

export interface TideAuthorizationAdapter {
  resolveViewer(request: Request): Promise<VerifiedViewer | null>;
  canReadDocument: CanReadDocument;
}

export type TideTokenClaims = {
  sub?: unknown;
  typ?: unknown;
  exp?: unknown;
  cnf?: unknown;
  aud?: unknown;
  realm_access?: { roles?: unknown };
  resource_access?: Record<string, { roles?: unknown }>;
} & Record<string, unknown>;

export type VerifyTideToken = (
  config: object,
  token: string,
) => Promise<TideTokenClaims | null>;

const documentRoles = {
  "patient-safety-brief": "doc_read_patient_safety_brief",
  "coastal-resilience-notes": "doc_read_coastal_resilience_notes",
  "funding-review-memo": "doc_read_funding_review_memo",
} as const;

export function documentRoleFor(documentId: string): string | null {
  const seedRole = Object.hasOwn(documentRoles, documentId)
    ? documentRoles[documentId as keyof typeof documentRoles] : null;
  if (seedRole) return seedRole;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(documentId)
    ? `doc_read_${documentId.replaceAll("-", "")}` : null;
}

function cookieValue(cookieHeader: string, name: string): string | null {
  for (const pair of cookieHeader.split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 0 || pair.slice(0, separator).trim() !== name) continue;
    const value = pair.slice(separator + 1).trim();
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return null;
    }
  }
  return null;
}

export function extractAccessToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization !== null) {
    return /^Bearer\s+([^\s]+)$/i.exec(authorization)?.[1] ?? null;
  }
  return cookieValue(request.headers.get("cookie") ?? "", "kcToken");
}

function stringRoles(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((role): role is string => typeof role === "string")
    : [];
}

export function createTideAuthorizationAdapter(
  config: TideCloakRuntimeConfig,
  verifyToken: VerifyTideToken,
): TideAuthorizationAdapter {
  return {
    async resolveViewer(request) {
      const token = extractAccessToken(request);
      if (!token) return null;

      try {
        const claims = await verifyToken(config, token);
        if (
          !claims || typeof claims.sub !== "string" || !claims.sub ||
          claims.typ !== "Bearer" || typeof claims.exp !== "number" ||
          claims.exp * 1000 <= Date.now() || claims.cnf !== undefined ||
          !(claims.aud === config.resource || (Array.isArray(claims.aud) && claims.aud.includes(config.resource)))
        ) return null;

        const roles = stringRoles(claims.resource_access?.[config.resource]?.roles);
        return { subject: claims.sub, roles: [...new Set(roles)] };
      } catch {
        return null;
      }
    },
    async canReadDocument(viewer, document) {
      if (viewer.subject === document.ownerId) return true;
      const requiredRole = documentRoleFor(document.id);
      return requiredRole !== null && viewer.roles.includes(requiredRole);
    },
  };
}

export const denyByDefaultAdapter: TideAuthorizationAdapter = {
  async resolveViewer(_request: Request) {
    return null;
  },
  async canReadDocument(_viewer: VerifiedViewer, _document: DocumentMetadata) {
    return false;
  },
};
