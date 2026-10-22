import { NextResponse } from "next/server";

import {
  accessRequestStore,
} from "../../../src/server/access-requests.server";
import {
  documentService,
  tideAuthorization,
} from "../../../src/server/documents.server";

const responseHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Authorization, Cookie",
};

async function protectedDocument(documentId: string) {
  return (await documentService.listDocuments()).find(
    (document) => document.id === documentId && document.isProtected,
  ) ?? null;
}

export async function GET(request: Request) {
  const viewer = await tideAuthorization.resolveViewer(request);
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required." }, {
      status: 401,
      headers: responseHeaders,
    });
  }

  const documentId = new URL(request.url).searchParams.get("documentId")?.trim();
  if (!documentId) {
    const documents = await documentService.listDocuments();
    const requests = await Promise.all(accessRequestStore.list(viewer.subject).map(async (accessRequest) => {
      const document = documents.find((item) => item.id === accessRequest.documentId);
      if (!document) return null;
      return { ...accessRequest, document,
        status: await tideAuthorization.canReadDocument(viewer, document) ? "GRANTED" : "PENDING",
      };
    }));
    return NextResponse.json({ requests: requests.filter((item) => item !== null) }, { headers: responseHeaders });
  }
  if (!(await protectedDocument(documentId))) {
    return NextResponse.json({ error: "Restricted document not found." }, {
      status: 404,
      headers: responseHeaders,
    });
  }

  return NextResponse.json({
    request: accessRequestStore.find(documentId, viewer.subject),
  }, { headers: responseHeaders });
}

export async function POST(request: Request) {
  const viewer = await tideAuthorization.resolveViewer(request);
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required." }, {
      status: 401,
      headers: responseHeaders,
    });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Cross-origin writes are not allowed." }, { status: 403, headers: responseHeaders });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON request body." }, {
      status: 400,
      headers: responseHeaders,
    });
  }

  const documentId = typeof input === "object" && input !== null &&
    typeof (input as { documentId?: unknown }).documentId === "string"
    ? (input as { documentId: string }).documentId.trim()
    : "";
  if (!documentId) {
    return NextResponse.json({ error: "A documentId is required." }, {
      status: 400,
      headers: responseHeaders,
    });
  }
  if (!(await protectedDocument(documentId))) {
    return NextResponse.json({ error: "Restricted document not found." }, {
      status: 404,
      headers: responseHeaders,
    });
  }

  const accessRequest = accessRequestStore.create(documentId, viewer.subject);
  return NextResponse.json({
    request: accessRequest,
    notice: "Awaiting administrator review. This request does not grant access.",
  }, { status: 202, headers: responseHeaders });
}
