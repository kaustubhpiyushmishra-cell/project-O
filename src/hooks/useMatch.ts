"use client";

import { useContext } from "react";
import { MatchContext } from "@/context/MatchProvider";

export function useMatch() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error("useMatch must be used within a MatchProvider");
  }
  return context;
}
