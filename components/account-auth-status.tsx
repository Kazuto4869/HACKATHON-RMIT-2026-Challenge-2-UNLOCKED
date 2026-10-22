"use client";

import { useTideCloak } from "@tidecloak/nextjs";

import { CheckIcon, ShieldIcon } from "./icons";

export function AccountAuthStatus({ configured }: { configured: boolean }) {
  if (!configured) {
    return <StatusRow ready={false} title="Website sign-in" detail="Sign-in setup is incomplete. Protected notes stay locked." label="Setup needed" />;
  }
  return <ConfiguredAccountAuthStatus />;
}

function ConfiguredAccountAuthStatus() {
  const { authenticated, initError, isInitializing } = useTideCloak();

  if (isInitializing) {
    return <StatusRow ready={false} title="Website sign-in" detail="Checking your TideCloak session." label="Checking" />;
  }
  if (initError) {
    return <StatusRow ready={false} title="Website sign-in" detail="Could not connect to TideCloak. Check the local server and sign-in settings." label="Unavailable" />;
  }
  if (authenticated) {
    return <StatusRow ready title="Website sign-in" detail="Signed in with TideCloak. Each protected read is checked by the server." label="Signed in" />;
  }
  return <StatusRow ready={false} title="Website sign-in" detail="Choose Sign in to connect your Tide account." label="Signed out" />;
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
