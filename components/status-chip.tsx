import type { ReactNode } from "react";

export function StatusChip({
  tone,
  children,
}: {
  tone: "public" | "locked" | "pending";
  children: ReactNode;
}) {
  return <span className={`status-chip status-${tone}`}>{children}</span>;
}
