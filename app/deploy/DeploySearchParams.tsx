"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function DeploySearchParams({ setForm }: any) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlFromQuery = searchParams.get("url") || "";
    const projectNameFromQuery = searchParams.get("projectName") || "";

    if (urlFromQuery || projectNameFromQuery) {
      setForm((prev: any) => ({
        ...prev,
        url: urlFromQuery || prev.url,
        projectName: projectNameFromQuery || prev.projectName,
      }));
    }
  }, [searchParams, setForm]);

  return null;
}