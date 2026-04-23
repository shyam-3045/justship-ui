"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

type DeploySearchFormState = {
  url: string;
  projectName: string;
  branch: string;
};

type DeploySearchParamsProps<T extends DeploySearchFormState> = {
  setForm: React.Dispatch<React.SetStateAction<T>>;
};

const normalizeRepoUrl = (value: string, repoFullName?: string) => {
  if (repoFullName) {
    return `https://github.com/${repoFullName}`;
  }

  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (/^github\.com\//i.test(value)) return `https://${value}`;

  return `https://github.com/${value.replace(/^\/+/, "")}`;
};

export default function DeploySearchParams<T extends DeploySearchFormState>({
  setForm,
}: DeploySearchParamsProps<T>) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlFromQuery = searchParams.get("url") || "";
    const projectNameFromQuery = searchParams.get("projectName") || "";
    const branchFromQuery = searchParams.get("branch") || "";
    const repoFullNameFromQuery = searchParams.get("repoFullName") || "";
    const normalizedUrl = normalizeRepoUrl(urlFromQuery, repoFullNameFromQuery);

    if (normalizedUrl || projectNameFromQuery || branchFromQuery) {
      setForm((prev) => ({
        ...prev,
        url: normalizedUrl || prev.url,
        projectName: projectNameFromQuery || prev.projectName,
        branch: branchFromQuery || prev.branch,
      }));
    }
  }, [searchParams, setForm]);

  return null;
}
