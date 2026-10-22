import type { ReactNode } from "react";

export function StatusChip({
  tone,
  children,
}: {
  tone: "available" | "locked" | "pending";
  children: ReactNode;
}) {
  const styles = {
    available: "bg-[#DCFCE7] text-[#16A34A]",
    pending: "bg-[#FEF3C7] text-[#D97706]",
    locked: "bg-[#FEE2E2] text-[#DC2626]",
  };

  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}
