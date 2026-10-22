import "server-only";

import { createDocumentService } from "./document-service.ts";
import { documentRepository } from "./document-store.server.ts";
import { step4DenyByDefaultAdapter } from "./tide-authorization.ts";

export const documentService = createDocumentService(
  documentRepository,
  step4DenyByDefaultAdapter.canReadDocument,
);

export const tideAuthorization = step4DenyByDefaultAdapter;
