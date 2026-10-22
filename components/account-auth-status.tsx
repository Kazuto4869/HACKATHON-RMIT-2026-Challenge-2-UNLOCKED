"use client";

import { useTideCloak } from "@tidecloak/nextjs";

import { CheckIcon, ShieldIcon } from "./icons";

export function AccountAuthStatus({ configured }: { configured: boolean }) {
  if (!configured) {
    return <StatusRow ready={false} title="Application sign-in" detail="The local adapter environment is incomplete, so protected reads stay anonymous." label="Blocked" />;
  }
  return <ConfiguredAccountAuthStatus />;
}

function ConfiguredAccountAuthStatus() {
  const { authenticated, initError, isInitializing } = useTideCloak();

  if (isInitializing) {
    return <StatusRow ready={false} title="Application sign-in" detail="Checking the browser session with TideCloak." label="Checking" />;
  }
  if (initError) {
    return <StatusRow ready={false} title="Application sign-in" detail="TideCloak initialization failed. Review the redirect URI, web origin, and local server." label="Unavailable" />;
  }
  if (authenticated) {
    return <StatusRow ready title="Application sign-in" detail="The browser holds an SDK-managed TideCloak session. Protected APIs still verify every access token server-side." label="Signed in" />;
  }
  return <StatusRow ready={false} title="Application sign-in" detail="The adapter loaded, but this browser is currently anonymous." label="Signed out" />;
}

function StatusRow({
  ready,
  title,
  detail,
  label,
}: {
  ready: boolean;
  title: string;
  detail: string;
  label: string;
}) {
  return (
    <div className="status-row">
      <span className={`status-row-icon ${ready ? "is-ready" : "is-pending"}`}>
        {ready ? <CheckIcon /> : <ShieldIcon />}
      </span>
      <div><strong>{title}</strong><p>{detail}</p></div>
      <span>{label}</span>
    </div>
  );
}
