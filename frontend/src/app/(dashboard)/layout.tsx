"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getAuthToken } from "@/lib/auth/cookies";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const token = getAuthToken();
    if (!isLoading && !token && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  return <AppShell>{children}</AppShell>;
}
