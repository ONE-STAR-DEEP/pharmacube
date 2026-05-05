"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RefreshOnFocus() {
  const router = useRouter();

  useEffect(() => {
    const handleFocus = () => {
      router.refresh();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return null;
}