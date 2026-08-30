"use client";

import { useEffect } from "react";

export function ScrollToTop({ trigger }: { trigger: string }) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [trigger]);

  return null;
}
