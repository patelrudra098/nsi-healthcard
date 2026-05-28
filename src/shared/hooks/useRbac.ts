"use client";

import { useContext } from "react";
import { RbacContext, type RbacContextValue } from "@/providers/rbac-provider";

export function useRbac(): RbacContextValue {
  const ctx = useContext(RbacContext);
  if (!ctx) {
    throw new Error("useRbac must be used within an <RbacProvider>");
  }
  return ctx;
}
