"use client";

import { useTideCloak } from "@tidecloak/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthRedirect() {
  const { initError, isInitializing } = useTideCloak();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !initError) router.replace("/");
  }, [initError, isInitializing, router]);

  if (initError) {
    return (
      <div className="empty-page">
        <p className="context-line">Authentication failed</p>
        <h1>SecureDocs could not verify this sign-in.</h1>
        <p>Check the TideCloak client redirect settings, then try signing in again.</p>
        <Link className="button button-secondary" href="/account">View account status</Link>
      </div>
    );
  }

  return (
    <div className="empty-page" role="status">
      <p className="context-line">TideCloak authentication</p>
      <h1>Verifying your session…</h1>
      <p>You will return to the document register when verification finishes.</p>
    </div>
  );
}
