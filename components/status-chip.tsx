import type { ReactNode } from "react";

export function StatusChip({
  tone,
  children,
}: {
  tone: "available" | "locked" | "pending";
  children: ReactNode;
}) {
  const styles = {
    available: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    locked: "bg-red-100 text-red-600",
  };

  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}
