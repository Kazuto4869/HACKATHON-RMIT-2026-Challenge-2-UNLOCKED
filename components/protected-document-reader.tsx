"use client";

import { useTideCloak } from "@tidecloak/nextjs";
import { useEffect, useState } from "react";
import { LockKeyhole, RefreshCw } from "lucide-react";
import type { AccessRequest } from "../src/domain/documents";
import { StatusChip } from "./status-chip";

type ReadState =
  | { kind: "loading" }
  | { kind: "anonymous" }
  | { kind: "forbidden"; token: string; documentId: string; request: AccessRequest | null }
  | { kind: "readable"; token: string; documentId: string; body: string }
  | { kind: "error"; message: string };

export function ProtectedDocumentReader({ documentId, configured }: { documentId: string; configured: boolean }) {
  return configured ? <AuthenticatedReader key={documentId} documentId={documentId} /> : <LockedReader message="Sign-in setup is needed before this note can be opened." />;
}

function AuthenticatedReader({ documentId }: { documentId: string }) {
  const { authenticated, initError, isInitializing, login, token, forceRefreshToken } = useTideCloak();
  const [state, setState] = useState<ReadState>({ kind: "loading" });
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (isInitializing || initError || !authenticated || !token) return;
    const controller = new AbortController();
    setState({ kind: "loading" });
    setActionError("");
    async function read() {
      const options = { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" as const, signal: controller.signal };
      const response = await fetch(`/api/documents/${encodeURIComponent(documentId)}`, options);
      if (controller.signal.aborted) return;
      if (response.status === 401) { setState({ kind: "anonymous" }); return; }
      if (response.status === 403) {
        const pendingResponse = await fetch(`/api/access-requests?documentId=${encodeURIComponent(documentId)}`, options);
        if (!pendingResponse.ok) throw new Error("Could not check your request. Try again.");
        const pending = await pendingResponse.json() as { request: AccessRequest | null };
        if (!controller.signal.aborted) setState({ kind: "forbidden", token: token!, documentId, request: pending.request });
        return;
      }
      if (!response.ok) throw new Error("Could not open this note. Try again.");
      const payload = await response.json() as { body?: unknown };
      if (typeof payload.body !== "string") throw new Error("The note could not be loaded.");
      if (!controller.signal.aborted) setState({ kind: "readable", token: token!, documentId, body: payload.body });
    }
    void read().catch(() => { if (!controller.signal.aborted) setState({ kind: "error", message: "Could not check access. Try again." }); });
    return () => controller.abort();
  }, [authenticated, documentId, initError, isInitializing, token, version]);

  async function requestAccess() {
    if (!token || busy) return;
    setBusy(true);
    setActionError("");
    try {
      const response = await fetch("/api/access-requests", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ documentId }) });
      if (response.status === 401) { setState({ kind: "anonymous" }); return; }
      if (response.status !== 202) throw new Error("Request failed");
      const payload = await response.json() as { request: AccessRequest };
      setState((current) => current.kind === "forbidden" && current.token === token && current.documentId === documentId
        ? { ...current, request: payload.request } : current);
    } catch { setActionError("Could not send your request. Try again."); }
    finally { setBusy(false); }
  }

  async function refresh() {
    setBusy(true);
    setState({ kind: "loading" });
    setActionError("");
    try {
      const refreshed = await forceRefreshToken();
      if (!refreshed) { setState({ kind: "anonymous" }); return; }
      setVersion((value) => value + 1);
    } catch { setState({ kind: "error", message: "Your session could not be refreshed. Sign in again." }); }
    finally { setBusy(false); }
  }

  const signIn = <button className="button button-primary" onClick={() => void login().catch(() => setActionError("Sign-in failed. Try again."))}>Sign in</button>;
  if (initError) return <LockedReader message="Sign-in is unavailable. Check Account status and try again." action={<a href="/account" className="button button-secondary">Account status</a>} />;
  if (isInitializing) return <LockedReader message="Checking your session…" />;
  if (!authenticated || !token || state.kind === "anonymous") return <LockedReader message="Sign in to open this note or request access." action={<>{signIn}{actionError && <p role="alert" className="text-sm text-red-600">{actionError}</p>}</>} />;
  if ((state.kind === "forbidden" || state.kind === "readable") && (state.token !== token || state.documentId !== documentId)) return <LockedReader message="Checking access…" />;
  if (state.kind === "loading") return <LockedReader message="Checking access…" />;
  if (state.kind === "error") return <LockedReader message={state.message} action={<div className="flex gap-3"><button className="button button-secondary" onClick={() => setVersion((value) => value + 1)}>Try again</button>{signIn}</div>} />;
  const refreshButton = <button className="button button-secondary" disabled={busy} onClick={() => void refresh()}><RefreshCw className="size-4" aria-hidden="true" />{busy ? "Refreshing…" : "Refresh access"}</button>;
  if (state.kind === "readable") return <div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"><h2 id="reader-title" className="font-medium">Document content</h2><StatusChip tone="available">Available</StatusChip></div>
    <p className="my-7 whitespace-pre-wrap break-words leading-7 text-slate-700">{state.body}</p>
    {refreshButton}
  </div>;
  return <LockedReader message={state.request ? "Your request is awaiting administrator review." : "You need permission to read this note."} action={<div className="space-y-4">
    {state.request && <StatusChip tone="pending">Pending</StatusChip>}
    <div className="flex flex-wrap gap-3">{!state.request && <button className="button button-primary" disabled={busy} onClick={() => void requestAccess()}>{busy ? "Sending…" : "Request access"}</button>}{refreshButton}</div>
    {actionError && <p role="alert" className="text-sm text-red-600">{actionError}</p>}
    <p className="text-xs leading-5 text-slate-500">Sending a request does not grant access. Administrators review permissions in TideCloak.</p>
  </div>} />;
}

function LockedReader({ message, action }: { message: string; action?: React.ReactNode }) {
  return <div className="flex min-h-64 flex-col items-start justify-center gap-4">
    <span className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-600"><LockKeyhole className="size-5" aria-hidden="true" /></span>
    <h2 id="reader-title" className="text-lg font-semibold">This note is locked</h2>
    <p role="status" className="max-w-lg text-sm leading-6 text-slate-500">{message}</p>
    {action}
  </div>;
}
