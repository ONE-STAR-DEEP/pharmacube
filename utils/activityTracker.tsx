"use client";

import { useEffect } from "react";
import { refreshSession } from "./refreshSession";
import { useRouter } from "next/navigation";
import { getCurrentUserSafe } from "@/lib/sessionCheck";

let lastPing = 0;
const CLIENT_THROTTLE = 60_000; // 1 min

export default function SessionActivityTracker() {
  const router = useRouter();

  useEffect(() => {
    const handler = async () => {
      const now = Date.now();
      if (now - lastPing < CLIENT_THROTTLE) return;
      lastPing = now;

      const valid = await getCurrentUserSafe();

      if (!valid) {
        router.replace("/");
        return;
      }

      await refreshSession();
    };

    window.addEventListener("click", handler);
    window.addEventListener("keydown", handler);
    window.addEventListener("scroll", handler);

    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("scroll", handler);
    };
  }, [router]);

  return null;
}
