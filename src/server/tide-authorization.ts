import type {
  DocumentMetadata,
  VerifiedViewer,
} from "../domain/documents.ts";
import type { CanReadDocument } from "./document-service.ts";

export interface TideAuthorizationAdapter {
  resolveViewer(request: Request): Promise<VerifiedViewer | null>;
  canReadDocument: CanReadDocument;
}

// shortcut: STEP 4 has no app client config, replace this adapter with verified Tide SDK token checks in STEP 5.
export const step4DenyByDefaultAdapter: TideAuthorizationAdapter = {
  async resolveViewer(_request: Request) {
    return null;
  },
  async canReadDocument(_viewer: VerifiedViewer, _document: DocumentMetadata) {
    return false;
  },
};
