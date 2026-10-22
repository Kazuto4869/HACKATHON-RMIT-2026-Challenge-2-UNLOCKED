"use client";

import { useTideCloak } from "@tidecloak/nextjs";
import { useState } from "react";

export function AuthControls({ configured }: { configured: boolean }) {
  if (!configured) return <span className="px-3 text-xs text-slate-500">Sign-in setup needed</span>;
  return <ConfiguredAuthControls />;
}

function ConfiguredAuthControls() {
  const { authenticated, initError, isInitializing, login, logout, getValueFromToken } = useTideCloak();
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function act() {
    setBusy(true);
    setError(false);
    try { await (authenticated ? logout() : login()); }
    catch { setError(true); }
    finally { setBusy(false); }
  }
  if (isInitializing) return <p role="status" className="px-3 text-xs text-slate-500">Checking session…</p>;
  if (initError) return <a className="px-3 text-xs text-amber-700" href="/account">Sign-in unavailable</a>;
  const name: unknown = authenticated ? getValueFromToken("preferred_username") : null;
  return <div className="space-y-2 px-2">
    {authenticated && <p className="truncate text-xs text-slate-500">{typeof name === "string" ? name : "Signed in"}</p>}
    <button className="button button-secondary w-full" type="button" disabled={busy} onClick={() => void act()}>{busy ? "Please wait…" : authenticated ? "Sign out" : "Sign in"}</button>
    {error && <p role="alert" className="text-xs text-red-600">Could not sign {authenticated ? "out" : "in"}. Try again.</p>}
  </div>;
}
