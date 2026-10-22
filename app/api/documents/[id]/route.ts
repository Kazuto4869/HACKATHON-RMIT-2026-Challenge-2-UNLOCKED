import { NextResponse } from "next/server";

import {
  documentService,
  tideAuthorization,
} from "../../../../src/server/documents.server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const viewer = await tideAuthorization.resolveViewer(request);
  const result = await documentService.readDocument((await params).id, viewer);
  const options = { headers: { "Cache-Control": "no-store" } };

  if (result.kind === "not-found") {
    return NextResponse.json({ error: "Document not found." }, { ...options, status: 404 });
  }
  if (result.kind === "unauthenticated") {
    return NextResponse.json(
      { error: "Authentication required.", document: result.document },
      { ...options, status: 401 },
    );
  }
  if (result.kind === "forbidden") {
    return NextResponse.json(
      { error: "Document access denied.", document: result.document },
      { ...options, status: 403 },
    );
  }

  return NextResponse.json(
    { document: result.document, body: result.body },
    options,
  );
}
