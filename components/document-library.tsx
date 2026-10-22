"use client";

import { useTideCloak } from "@tidecloak/nextjs";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

import type { DocumentListItem } from "../src/domain/documents";
import { searchDocuments } from "../src/domain/search-documents";
import { StatusChip } from "./status-chip";

type Props = { documents: DocumentListItem[]; configured: boolean; initialQuery: string };

export function DocumentLibrary(props: Props) {
  return props.configured ? <SignedInLibrary {...props} /> : <Library {...props} />;
}

function SignedInLibrary(props: Props) {
  const { token, authenticated, isInitializing } = useTideCloak();
  const [result, setResult] = useState<{ token: string; documents: DocumentListItem[] } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false);
    if (!authenticated || !token || isInitializing) return;
    const controller = new AbortController();
    void fetch("/api/documents", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load documents");
        const payload = await response.json() as { documents: DocumentListItem[] };
        if (!controller.signal.aborted) setResult({ token, documents: payload.documents });
      }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [authenticated, isInitializing, token]);
  return <Library {...props} documents={authenticated && token && result?.token === token ? result.documents : props.documents} error={error} />;
}

function Library({ documents, initialQuery, error = false }: Props & { error?: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const visible = searchDocuments(documents, query) as readonly DocumentListItem[];
  return <section className="space-y-7" aria-labelledby="documents-title">
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <h1 id="documents-title" className="text-2xl font-semibold tracking-tight text-slate-900">My Documents</h1>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div role="search" className="relative w-full sm:w-64">
          <label htmlFor="document-search" className="sr-only">Search documents</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
          <input id="document-search" className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents" />
        </div>
        <Link className="button button-primary" href="/notes/new"><Plus aria-hidden="true" className="size-4" />New Note</Link>
      </div>
    </header>
    {error && <p role="alert" className="text-sm text-amber-700">Could not refresh access status. Refresh the page to try again.</p>}
    {visible.length ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {visible.map((document) => <Link className="flex min-h-44 flex-col justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm" href={`/documents/${document.id}`} key={document.id}>
        <div className="space-y-2"><h2 className="line-clamp-1 text-base font-semibold">{document.title}</h2><p className="line-clamp-1 text-sm text-slate-500">{document.summary}</p></div>
        <StatusChip tone={document.accessStatus === "AVAILABLE" ? "available" : document.accessStatus === "PENDING" ? "pending" : "locked"}>{document.accessStatus === "AVAILABLE" ? "Available" : document.accessStatus === "PENDING" ? "Pending" : "Locked"}</StatusChip>
      </Link>)}
    </div> : <div className="rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center"><p className="text-sm font-medium">No documents found</p><p className="mt-1 text-sm text-slate-500">Try a different search or create a note.</p></div>}
  </section>;
}
