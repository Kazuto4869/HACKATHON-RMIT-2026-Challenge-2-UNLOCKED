import { NextResponse } from "next/server";

import { appOrigin, documentService, tideAuthorization } from "../../../src/server/documents.server";
import { isAllowedWriteOrigin } from "../../../src/server/write-origin";
import { documentRepository, accessRequestStore } from "../../../src/server/document-store.server";
import { validateNoteInput } from "../../../src/domain/note-validation";

const headers = { "Cache-Control": "private, no-store", Vary: "Authorization, Cookie" };

export async function GET(request: Request) {
  const viewer = await tideAuthorization.resolveViewer(request);
  const mine = new URL(request.url).searchParams.get("mine") === "1";
  if (mine && !viewer) return NextResponse.json({ error: "Sign in to see your notes." }, { status: 401, headers });
  const documents = (await documentService.listDocuments()).filter((document) => !mine || document.ownerId === viewer?.subject);
  return NextResponse.json(
    { documents: await Promise.all(documents.map(async (document) => ({
      ...document,
      accessStatus: !document.isProtected || (viewer && await tideAuthorization.canReadDocument(viewer, document))
        ? "AVAILABLE" : viewer && accessRequestStore.find(document.id, viewer.subject) ? "PENDING" : "LOCKED",
    }))) },
    { headers },
  );
}

export async function POST(request: Request) {
  const viewer = await tideAuthorization.resolveViewer(request);
  if (!viewer) return NextResponse.json({ error: "Sign in to create a note." }, { status: 401, headers });
  if (!isAllowedWriteOrigin(request, appOrigin)) {
    return NextResponse.json({ error: "Cross-origin writes are not allowed." }, { status: 403, headers });
  }
  let input: unknown;
  try { input = await request.json(); } catch {
    return NextResponse.json({ error: "Send a JSON request body." }, { status: 400, headers });
  }
  if (typeof input !== "object" || input === null ||
      !("title" in input) || typeof input.title !== "string" ||
      !("summary" in input) || typeof input.summary !== "string" ||
      !("body" in input) || typeof input.body !== "string" ||
      !("isProtected" in input) || typeof input.isProtected !== "boolean") {
    return NextResponse.json({ error: "Title, summary, content and visibility are required." }, { status: 400, headers });
  }
  const result = validateNoteInput({ title: input.title, summary: input.summary, body: input.body });
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 400, headers });
  const document = await documentRepository.createNote(result.value, viewer.subject, input.isProtected);
  return NextResponse.json({ document }, { status: 201, headers });
}
