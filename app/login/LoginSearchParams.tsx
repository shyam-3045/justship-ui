"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginSearchParams({ user, router }: any) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!user) return;

    const nextPath = searchParams.get("next");
    router.replace(nextPath || "/dashboard");
  }, [user, router, searchParams]);

  return null;
}