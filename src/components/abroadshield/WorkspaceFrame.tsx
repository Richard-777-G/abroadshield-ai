"use client";

import type { ReactNode } from "react";

export default function WorkspaceFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-7 ${className}`}>{children}</div>;
}
