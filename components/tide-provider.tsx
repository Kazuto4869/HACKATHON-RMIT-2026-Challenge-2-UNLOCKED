"use client";

import { TideCloakProvider } from "@tidecloak/nextjs";
import type { ReactNode } from "react";

import type { TideCloakRuntimeConfig } from "../src/domain/tidecloak";

export function TideProvider({
  config,
  children,
}: {
  config: TideCloakRuntimeConfig | null;
  children: ReactNode;
}) {
  return config ? <TideCloakProvider config={config}>{children}</TideCloakProvider> : children;
}
