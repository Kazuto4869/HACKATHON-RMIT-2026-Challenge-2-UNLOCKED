import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { NoteForm } from "../../../components/note-form";
import { tideCloakConfigured } from "../../../src/server/documents.server";

export const metadata: Metadata = { title: "New Note" };

export default function CreateNotePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700" href="/">
        <ArrowLeft className="size-4" /> Back to documents
      </Link>
      <section className="space-y-2">
        <p className="text-sm font-medium text-blue-700">Synthetic data only</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">New Note</h1>
        <p className="max-w-2xl text-slate-600">
          Give your note a title and a short, public-safe summary.
        </p>
      </section>
      <NoteForm configured={tideCloakConfigured} />
    </div>
  );
}
