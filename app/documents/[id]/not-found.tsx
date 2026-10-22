import Link from "next/link";

export default function DocumentNotFound() {
  return (
    <section className="mx-auto max-w-xl space-y-3 rounded-xl border border-slate-200 bg-white p-8" aria-labelledby="not-found-title">
      <p className="text-sm text-slate-500">404 · Document register</p>
      <h1 id="not-found-title" className="text-2xl font-semibold text-slate-900">Document not found</h1>
      <p className="text-sm text-slate-600">The requested sample record does not exist.</p>
      <Link className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700" href="/">
        Return to documents
      </Link>
    </section>
  );
}
