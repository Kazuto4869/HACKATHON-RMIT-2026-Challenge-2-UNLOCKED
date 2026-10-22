"use client";

import { useTideCloak } from "@tidecloak/nextjs";
import { Inbox, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AccessRequestItem } from "../src/domain/documents";
import { StatusChip } from "./status-chip";

export function RequestList({ configured, guardian = false }: { configured: boolean; guardian?: boolean }) {
  return configured ? <AuthenticatedRequests guardian={guardian} /> : <p className="empty-page">Sign-in setup is needed to view requests.</p>;
}

function AuthenticatedRequests({ guardian }: { guardian: boolean }) {
  const { token, authenticated, isInitializing, initError, login, forceRefreshToken } = useTideCloak();
  const [result, setResult] = useState<{ token: string; guardian: boolean; requests: AccessRequestItem[] } | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!authenticated || !token || isInitializing || initError) return;
    const controller = new AbortController();
    setError("");
    void fetch(guardian ? "/api/access-requests?scope=guardian" : "/api/access-requests", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error(response.status === 401 ? "Your session expired. Sign in again." : response.status === 403 ? "A Tide administrator account is required to view the review queue." : "Could not load requests.");
      const payload = await response.json() as { requests: AccessRequestItem[] };
      if (!controller.signal.aborted) setResult({ token, guardian, requests: payload.requests });
    }).catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load requests."); });
    return () => controller.abort();
  }, [authenticated, token, isInitializing, initError, version, guardian]);
  async function refresh() {
    setBusy(true);
    setResult(null);
    setError("");
    try {
      if (!(await forceRefreshToken())) { setError("Your session expired. Sign in again."); return; }
      setVersion((value) => value + 1);
    } catch { setError("Could not refresh access. Try again."); }
    finally { setBusy(false); }
  }
  if (isInitializing) return <p role="status" className="empty-page">Checking your session…</p>;
  if (initError) return <p role="alert" className="empty-page">Sign-in is unavailable. Check Account status.</p>;
  if (!authenticated || !token) return <div className="empty-page space-y-4"><p>Sign in to see your requests.</p><button className="button button-primary" onClick={() => void login().catch(() => setError("Sign-in failed. Try again."))}>Sign in</button>{error && <p role="alert">{error}</p>}</div>;
  const requests = result?.token === token && result.guardian === guardian ? result.requests : null;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-slate-500">{guardian ? "Recorded requests. Check current permissions in TideCloak before proposing a grant." : "Access requests you have sent."}</p><button className="button button-secondary" disabled={busy} onClick={() => void refresh()}><RefreshCw aria-hidden="true" className="size-4" />{busy ? "Refreshing…" : "Refresh access"}</button></div>
    {error ? <p role="alert" className="text-sm text-red-600">{error} <button className="underline" onClick={() => setVersion((value) => value + 1)}>Try again</button></p> : !requests ? <p role="status" className="empty-page">Loading requests…</p> : requests.length ? <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {requests.map((request) => <li key={request.id} className="flex flex-wrap items-center justify-between gap-4 p-6"><div className="min-w-0 flex-1"><Link className="font-medium hover:text-blue-700" href={`/documents/${request.documentId}`}>{request.document.title}</Link><p className="mt-1 text-sm text-slate-500">{guardian ? "Review this request in TideCloak." : request.status === "GRANTED" ? "Access verified. You can open this note." : "Awaiting administrator review."}</p>{guardian && <details className="mt-3 text-xs text-slate-500"><summary className="cursor-pointer font-medium">Grant details</summary><dl className="mt-2 space-y-2 break-all"><div><dt>Requester ID</dt><dd>{request.requesterId}</dd></div><div><dt>Document role</dt><dd>{request.readerRole ?? "Role mapping unavailable"}</dd></div></dl></details>}</div><StatusChip tone={!guardian && request.status === "GRANTED" ? "available" : "pending"}>{guardian ? "Recorded" : request.status === "GRANTED" ? "Available" : "Pending"}</StatusChip></li>)}
    </ul> : <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 p-6 text-center"><Inbox aria-hidden="true" className="size-7 text-slate-400" /><h2 className="font-semibold">No requests yet</h2><p className="text-sm text-slate-500">Open a locked note to request access.</p><Link className="text-sm font-medium text-blue-600" href="/">Browse documents</Link></div>}
  </div>;
}
