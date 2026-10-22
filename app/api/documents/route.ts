import { NextResponse } from "next/server";

import { documentService } from "../../../src/server/documents.server";

export async function GET() {
  return NextResponse.json(
    { documents: await documentService.listDocuments() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
