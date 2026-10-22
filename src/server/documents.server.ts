import "server-only";

import { verifyTideCloakToken } from "@tidecloak/nextjs/server";

import { createDocumentService } from "./document-service.ts";
import { documentRepository } from "./document-store.server.ts";
import {
  createTideAuthorizationAdapter,
  denyByDefaultAdapter,
} from "./tide-authorization.ts";
import { loadTideCloakConfig } from "./tidecloak-config.server.ts";

const tideCloakConfig = loadTideCloakConfig();

export const tideAuthorization = tideCloakConfig?.jwk
  ? createTideAuthorizationAdapter(tideCloakConfig, verifyTideCloakToken)
  : denyByDefaultAdapter;

export const documentService = createDocumentService(
  documentRepository,
  tideAuthorization.canReadDocument,
);

export const tideCloakConfigured = tideCloakConfig !== null;
export const appOrigin = tideCloakConfig ? new URL(tideCloakConfig.redirectUri).origin : "";
