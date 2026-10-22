"use client";

import { useTideCloak } from "@tidecloak/nextjs";

export function AuthControls({ configured }: { configured: boolean }) {
  if (!configured) return <span className="auth-state">Sign-in not configured</span>;
  return <ConfiguredAuthControls />;
}

function ConfiguredAuthControls() {
  const { authenticated, initError, isInitializing, login, logout } = useTideCloak();

  if (isInitializing) return <span className="auth-state">Checking session…</span>;
  if (initError) return <span className="auth-state auth-error">Sign-in unavailable</span>;

  return authenticated ? (
    <button className="auth-button" type="button" onClick={() => void logout()}>
      Sign out
    </button>
  ) : (
    <button className="auth-button" type="button" onClick={() => void login()}>
      Sign in
    </button>
  );
}
