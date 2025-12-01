"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user might have a session cookie
    // Note: We can't validate the cookie client-side, but we can check if it exists
    const hasCookie = document.cookie.includes("wos-session");

    if (hasCookie) {
      // Likely authenticated, go to story page (which will validate server-side)
      router.replace("/story");
    } else {
      // No session, go to login
      router.replace("/login");
    }
  }, [router]);

  // Show nothing while redirecting
  return null;
}
