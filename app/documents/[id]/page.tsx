import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowIcon, ShieldIcon } from "../../../components/icons";
import { ProtectedDocumentReader } from "../../../components/protected-document-reader";
import { documentService, tideCloakConfigured } from "../../../src/server/documents.server";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await documentService.readDocument((await params).id, null);
  return result.kind === "not-found"
    ? { title: "Document not found" }
    : { title: result.document.title };
}

export default async function DocumentPage({ params }: PageProps) {
  const result = await documentService.readDocument((await params).id, null);
  if (result.kind === "not-found") notFound();

  const { document } = result;
  const readable = result.kind === "readable";

  return (
    <div className="mx-auto max-w-5xl">
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900" href="/">
        <ArrowIcon aria-hidden="true" className="size-4 rotate-180" /> My Documents
      </Link>

      <header className="mt-7 flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <ShieldIcon aria-hidden="true" className="size-5" />
        </span>
        <div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{document.isProtected ? "Protected" : "Public"}</span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{document.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{document.summary}</p>
        </div>
      </header>

      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-h-80 rounded-xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="reader-title">
          {readable ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-sm">
                <span className="text-slate-500">Document content</span>
                <strong id="reader-title" className="font-medium text-slate-800">Available</strong>
              </div>
              <p className="mt-7 max-w-prose whitespace-pre-wrap text-base leading-7 text-slate-700">{result.body}</p>
            </>
          ) : (
            <ProtectedDocumentReader documentId={document.id} configured={tideCloakConfigured} />
          )}
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900">Details</h2>
          <dl className="mt-4 divide-y divide-slate-100">
            <div className="py-3">
              <dt className="text-xs text-slate-500">Owner</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">{/^[0-9a-f-]{36}$/i.test(document.ownerId) ? "Document owner" : document.ownerId}</dd>
            </div>
            <div className="py-3">
              <dt className="text-xs text-slate-500">Visibility</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">{document.isProtected ? "Protected" : "Public"}</dd>
            </div>
            <div className="py-3">
              <dt className="text-xs text-slate-500">Protection</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">{readable ? "Public" : "TideCloak"}</dd>
            </div>
            <div className="py-3">
              <dt className="text-xs text-slate-500">Content</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">Synthetic only</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
