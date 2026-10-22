"use client";

import { useTideCloak } from "@tidecloak/nextjs";
import { useEffect, useState } from "react";

import type { AccessRequest } from "../src/domain/documents";
import { LockIcon } from "./icons";
import { StatusChip } from "./status-chip";

type ReadState =
  | { kind: "loading" }
  | { kind: "anonymous" }
  | { kind: "forbidden"; token: string }
  | { kind: "readable"; body: string; token: string }
  | { kind: "error"; message: string };

export function ProtectedDocumentReader({
  documentId,
  configured,
}: {
  documentId: string;
  configured: boolean;
}) {
  if (!configured) return <UnavailableReader />;
  return <AuthenticatedReader documentId={documentId} />;
}

function UnavailableReader() {
  return (
    <LockedReader
      message="The local TideCloak adapter is not configured, so SecureDocs kept this read anonymous."
      action={<button className="button button-disabled" type="button" disabled>Sign-in unavailable</button>}
    />
  );
}

function AuthenticatedReader({ documentId }: { documentId: string }) {
  const { authenticated, initError, isInitializing, login, token } = useTideCloak();
  const [readState, setReadState] = useState<ReadState>({ kind: "loading" });
  const [accessRequest, setAccessRequest] = useState<AccessRequest | null>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (isInitializing) return;
    if (initError) {
      setReadState({ kind: "error", message: "TideCloak session initialization failed." });
      return;
    }
    if (!authenticated || !token) {
      setReadState({ kind: "anonymous" });
      return;
    }

    const controller = new AbortController();
    setAccessRequest(null);
    setReadState({ kind: "loading" });
    void fetch(`/api/documents/${encodeURIComponent(documentId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    }).then(async (response) => {
      if (response.status === 200) {
        const payload = await response.json() as { body?: unknown };
        if (typeof payload.body === "string") {
          setReadState({ kind: "readable", body: payload.body, token });
          return;
        }
      }
      if (response.status === 401) setReadState({ kind: "anonymous" });
      else if (response.status === 403) {
        setReadState({ kind: "forbidden", token });
        const statusResponse = await fetch(
          `/api/access-requests?documentId=${encodeURIComponent(documentId)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
            signal: controller.signal,
          },
        );
        if (statusResponse.ok) {
          const statusPayload = await statusResponse.json() as { request?: AccessRequest | null };
          setAccessRequest(statusPayload.request ?? null);
        }
      } else {
        setReadState({ kind: "error", message: "The protected read could not be completed." });
      }
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setReadState({
          kind: "error",
          message: error instanceof Error ? error.message : "The protected read failed.",
        });
      }
    });

    return () => controller.abort();
  }, [authenticated, documentId, initError, isInitializing, token]);

  async function requestAccess() {
    if (!token || requesting) return;
    setRequesting(true);
    try {
      const response = await fetch("/api/access-requests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId }),
      });
      if (response.status === 202) {
        const payload = await response.json() as { request: AccessRequest };
        setAccessRequest(payload.request);
      } else if (response.status === 401) {
        setReadState({ kind: "anonymous" });
      } else {
        setReadState({ kind: "error", message: "SecureDocs could not record the access request." });
      }
    } catch {
      setReadState({ kind: "error", message: "The access request could not reach SecureDocs." });
    } finally {
      setRequesting(false);
    }
  }

  if (isInitializing) {
    return <LockedReader message="SecureDocs is verifying the current TideCloak access token." action={<button className="button button-disabled" type="button" disabled>Verifying access…</button>} />;
  }
  if (initError) {
    return <LockedReader message="TideCloak session initialization failed." action={<button className="button button-secondary" type="button" onClick={() => window.location.reload()}>Try again</button>} />;
  }
  if (!authenticated || !token) {
    return <LockedReader message="Sign in with the requester account before asking for document access." action={<button className="button button-primary" type="button" onClick={() => void login()}>Sign in with TideCloak</button>} />;
  }
  if ((readState.kind === "readable" || readState.kind === "forbidden") && readState.token !== token) {
    return <LockedReader message="SecureDocs is verifying the current TideCloak access token." action={<button className="button button-disabled" type="button" disabled>Verifying access…</button>} />;
  }

  if (readState.kind === "readable") {
    return (
      <>
        <div className="reader-heading">
          <span>Document content</span>
          <strong id="reader-title">TideCloak-authorized reader</strong>
        </div>
        <p className="document-body">{readState.body}</p>
      </>
    );
  }

  if (readState.kind === "loading") {
    return <LockedReader message="SecureDocs is verifying the current TideCloak access token." action={<button className="button button-disabled" type="button" disabled>Verifying access…</button>} />;
  }

  if (readState.kind === "anonymous") {
    return <LockedReader message="Sign in with the requester account before asking for document access." action={<button className="button button-primary" type="button" onClick={() => void login()}>Sign in with TideCloak</button>} />;
  }

  if (readState.kind === "error") {
    return <LockedReader message={readState.message} action={<button className="button button-secondary" type="button" onClick={() => window.location.reload()}>Try again</button>} />;
  }

  return (
    <LockedReader
      message="Your verified account does not currently hold this document's read role."
      action={accessRequest ? (
        <div className="request-result" role="status">
          <StatusChip tone="pending">Request pending</StatusChip>
          <p>Request {accessRequest.id} is recorded in this app process.</p>
        </div>
      ) : (
        <button className="button button-primary" type="button" disabled={requesting} onClick={() => void requestAccess()}>
          {requesting ? "Recording request…" : "Request access"}
        </button>
      )}
    />
  );
}

function LockedReader({ message, action }: { message: string; action: React.ReactNode }) {
  return (
    <div className="locked-reader">
      <span className="locked-reader-icon"><LockIcon /></span>
      <p className="context-line">Content not delivered</p>
      <h2 id="reader-title">This document remains locked.</h2>
      <p>{message}</p>
      {action}
      <small>
        A pending app request does not grant a Tide role and does not represent Guardian approval.
        An administrator must propose the document role in the Tide console; QEA governs that change.
      </small>
    </div>
  );
}
