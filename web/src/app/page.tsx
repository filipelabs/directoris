"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        // Call the API to check if we have a valid session
        // The httpOnly cookie will be sent automatically with credentials: "include"
        await api.auth.getSession();
        // Session is valid, go to story page
        router.replace("/story");
      } catch {
        // No valid session, go to login
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    }
    checkSession();
  }, [router]);

  // Show nothing while checking/redirecting
  if (checking) return null;
  return null;
}
