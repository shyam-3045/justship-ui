"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const normalizeRepoUrl = (value: string, repoFullName?: string) => {
  if (repoFullName) {
    return `https://github.com/${repoFullName}`;
  }

  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (/^github\.com\//i.test(value)) return `https://${value}`;

  return `https://github.com/${value.replace(/^\/+/, "")}`;
};

export default function DeploySearchParams({ setForm }: any) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlFromQuery = searchParams.get("url") || "";
    const projectNameFromQuery = searchParams.get("projectName") || "";
    const repoFullNameFromQuery = searchParams.get("repoFullName") || "";
    const normalizedUrl = normalizeRepoUrl(urlFromQuery, repoFullNameFromQuery);

    if (normalizedUrl || projectNameFromQuery) {
      setForm((prev: any) => ({
        ...prev,
        url: normalizedUrl || prev.url,
        projectName: projectNameFromQuery || prev.projectName,
      }));
    }
  }, [searchParams, setForm]);

  return null;
}
