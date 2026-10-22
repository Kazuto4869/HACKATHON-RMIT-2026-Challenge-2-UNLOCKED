export type DocumentStatus = "PUBLIC" | "RESTRICTED";

export interface DocumentMetadata {
  id: string;
  title: string;
  summary: string;
  ownerId: string;
  createdAt: string;
  isProtected: boolean;
  status: DocumentStatus;
}

export type AccessRequestStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "GRANTED"
  | "REJECTED";

export interface AccessRequest {
  id: string;
  documentId: string;
  requesterId: string;
  status: AccessRequestStatus;
  createdAt: string;
}

export interface DocumentListItem extends DocumentMetadata {
  accessStatus: "AVAILABLE" | "PENDING" | "LOCKED";
}

export interface AccessRequestItem extends AccessRequest {
  document: DocumentMetadata;
  readerRole?: string | null;
}

export interface VerifiedViewer {
  subject: string;
  roles: readonly string[];
  isGuardian?: boolean;
}

export type DocumentReadResult =
  | { kind: "readable"; document: DocumentMetadata; body: string }
  | { kind: "unauthenticated"; document: DocumentMetadata }
  | { kind: "forbidden"; document: DocumentMetadata }
  | { kind: "not-found" };
