"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Clock3,
  ExternalLink,
  FolderGit2,
  Globe,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/custom-theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRedeployHook, useGetDeployments } from "@/hooks/customHooks/deploy";
import {
  useGetEnv,
  useGetProjects,
  useUpdateEnv,
} from "@/hooks/customHooks/project";
import { getErrorMessage, getSuccessMessage } from "@/utils/api-message";
import { toastFailure, toastSuccess } from "@/utils/toast";

type Project = {
  _id: string;
  name: string;
  userId: string;
  currentVersion: number;
  repoUrl: string;
  subfolder: string;
  url: string;
  createdAt: string;
};

type Deployment = {
  _id: string;
  version: number;
  status: "success" | "failed" | "building";
  completedAt: string;
  cdnUrl?: string;
};

type EnvRow = {
  key: string;
  value: string;
};

const activeDeploymentJobKey = "justship-active-deployment-job";

const toHost = (url: string) => {
  if (!url) return "-";

  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
};

const toReadableDate = (value?: string) => {
  if (!value) return "Not finished yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not finished yet";

  return date.toLocaleString();
};

const toEnvRows = (source: unknown): EnvRow[] => {
  if (!source || typeof source !== "object") return [];

  const candidate = source as {
    env?: unknown;
    variables?: unknown;
  };

  const value =
    candidate.env && typeof candidate.env === "object"
      ? candidate.env
      : candidate.variables && typeof candidate.variables === "object"
        ? candidate.variables
        : source;

  if (!value || typeof value !== "object") return [];

  return Object.entries(value as Record<string, unknown>).map(([key, val]) => ({
    key,
    value: typeof val === "string" ? val : String(val ?? ""),
  }));
};

const normalizeRows = (rows: EnvRow[]) =>
  rows
    .map((row) => ({ key: row.key.trim(), value: row.value }))
    .filter((row) => row.key.length > 0)
    .sort((a, b) => a.key.localeCompare(b.key));

const rowsEqual = (a: EnvRow[], b: EnvRow[]) =>
  JSON.stringify(normalizeRows(a)) === JSON.stringify(normalizeRows(b));

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { theme } = useTheme();

  const projectId = params?.id || "";

  const [envRows, setEnvRows] = useState<EnvRow[]>([]);
  const [initialEnvRows, setInitialEnvRows] = useState<EnvRow[]>([]);
  const [visibleEnvIndexes, setVisibleEnvIndexes] = useState<number[]>([]);
  const [needsRedeploy, setNeedsRedeploy] = useState(false);

  const { data: projectsData, isLoading: projectsLoading } = useGetProjects();
  const projects = (projectsData?.projects || []) as Project[];

  const project = useMemo(
    () => projects.find((item) => item._id === projectId) || null,
    [projects, projectId],
  );

  const { data: envData, isLoading: envLoading } = useGetEnv(projectId);
  const { data: deploymentsData, isLoading: deploymentsLoading } =
    useGetDeployments(projectId);

  const deployments = ((deploymentsData as { deployments?: Deployment[] })
    ?.deployments || []) as Deployment[];

  const updateEnvMutation = useUpdateEnv();
  const redeployMutation = useRedeployHook();

  const hasEnvChanges = useMemo(
    () => !rowsEqual(envRows, initialEnvRows),
    [envRows, initialEnvRows],
  );

  useEffect(() => {
    const rows = toEnvRows(envData);
    setEnvRows(rows);
    setInitialEnvRows(rows);
  }, [envData]);

  const updateEnvRow = (index: number, field: "key" | "value", value: string) => {
    setEnvRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeEnvRow = (index: number) => {
    setEnvRows((prev) => prev.filter((_, idx) => idx !== index));
    setVisibleEnvIndexes((prev) =>
      prev.filter((item) => item !== index).map((item) => (item > index ? item - 1 : item)),
    );
  };

  const addEnvRow = () => {
    setEnvRows((prev) => [...prev, { key: "", value: "" }]);
  };

  const toggleEnvVisibility = (index: number) => {
    setVisibleEnvIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  const handleSaveEnv = async () => {
    if (!projectId || updateEnvMutation.isPending) return;

    const payload = normalizeRows(envRows).reduce<Record<string, string>>(
      (acc, row) => {
        acc[row.key] = row.value;
        return acc;
      },
      {},
    );

    try {
      const response = await updateEnvMutation.mutateAsync({
        projectId,
        env: payload,
      });

      setInitialEnvRows(envRows);
      setNeedsRedeploy(true);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["env", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
      ]);

      toastSuccess(
        getSuccessMessage(response, "Environment variables updated."),
        theme,
      );
    } catch (error) {
      toastFailure(
        getErrorMessage(error, "Failed to update environment variables."),
        theme,
      );
    }
  };

  const handleRedeploy = async () => {
    if (!projectId || redeployMutation.isPending) return;

    try {
      const response = await redeployMutation.mutateAsync({ projectId });
      const jobId = response.jobID || response.jobId || response.deploymentId;

      if (!jobId) {
        throw new Error("Could not read job ID from redeploy response");
      }

      localStorage.setItem(
        activeDeploymentJobKey,
        JSON.stringify({
          jobId,
          projectName: project?.name || "Deployment",
          startedAt: Date.now(),
        }),
      );

      toastSuccess(getSuccessMessage(response, "Job Added to Queue"), theme);
      setNeedsRedeploy(false);
      router.push(
        `/deploy/${jobId}?projectName=${encodeURIComponent(project?.name || "Deployment")}`,
      );
    } catch (error) {
      toastFailure(getErrorMessage(error, "Failed to trigger redeploy"), theme);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background bg-glow">
        <Navbar />
        <main className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8 lg:px-10">
          <DashboardSidebar activeLabel="My Deployments" />
          <section className="w-full">
            <Card className="glass border-border/70">
              <CardHeader>
                <CardTitle>Login Required</CardTitle>
                <CardDescription>
                  Please login to access project details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push("/login?next=/deployments")}>
                  Go To Login
                </Button>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-glow">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8 lg:px-10">
        <DashboardSidebar activeLabel="My Deployments" />

        <section className="w-full space-y-6">
          <Card className="glass border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-4">
                <span>{project?.name || "Project Details"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/deployments")}
                >
                  Back to Projects
                </Button>
              </CardTitle>
              <CardDescription>
                Platform-style overview with deployment health and environment management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading || !projectId ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading project...
                </div>
              ) : !project ? (
                <p className="text-sm text-muted-foreground">Project not found.</p>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-border/60 bg-background/30 p-4">
                      <p className="text-xs text-muted-foreground">Production URL</p>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-2 text-sm text-foreground hover:text-muted-foreground"
                      >
                        <Globe className="size-4" />
                        <span>{toHost(project.url)}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background/30 p-4">
                      <p className="text-xs text-muted-foreground">Repository</p>
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-2 text-sm text-foreground hover:text-muted-foreground"
                      >
                        <FolderGit2 className="size-4" />
                        <span>{toHost(project.repoUrl)}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-background/30 p-4">
                      <p className="text-xs text-muted-foreground">Active Version</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        v{project.currentVersion}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/30 p-4">
                      <p className="text-xs text-muted-foreground">Build Subfolder</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {project.subfolder || "."}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/30 p-4">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                        <Clock3 className="size-3.5" />
                        {new Date(project.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {needsRedeploy && (
            <Card className="border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20">
              <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Redeployment required
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Environment variables were updated. Redeploy to apply changes.
                  </p>
                </div>
                <Button onClick={handleRedeploy} disabled={redeployMutation.isPending}>
                  {redeployMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Starting Redeploy...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-4" />
                      Redeploy Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="glass border-border/70">
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>
                  Manage runtime secrets and config values for this project.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {envLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading environment variables...
                  </div>
                ) : envRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No environment variables set yet.
                  </p>
                ) : (
                  envRows.map((row, index) => (
                    <div key={`${row.key}-${index}`} className="flex gap-2">
                      <Input
                        value={row.key}
                        onChange={(event) =>
                          updateEnvRow(index, "key", event.target.value)
                        }
                        placeholder="KEY"
                        className="flex-1"
                      />
                      <Input
                        value={row.value}
                        onChange={(event) =>
                          updateEnvRow(index, "value", event.target.value)
                        }
                        placeholder="Value"
                        className="flex-1"
                        type={
                          visibleEnvIndexes.includes(index) ? "text" : "password"
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleEnvVisibility(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {visibleEnvIndexes.includes(index) ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEnvRow(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button type="button" variant="secondary" size="sm" onClick={addEnvRow}>
                    <Plus className="size-4" />
                    Add Variable
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveEnv}
                    disabled={updateEnvMutation.isPending || !hasEnvChanges}
                  >
                    {updateEnvMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/70">
              <CardHeader>
                <CardTitle>Recent Deployments</CardTitle>
                <CardDescription>
                  Track health and versions similar to a production platform dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {deploymentsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading deployments...
                  </div>
                ) : deployments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No deployments available yet.
                  </p>
                ) : (
                  deployments.slice(0, 8).map((deployment) => (
                    <div
                      key={deployment._id}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-background/30 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Version {deployment.version}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {toReadableDate(deployment.completedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            deployment.status === "success"
                              ? "success"
                              : deployment.status === "failed"
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {deployment.status}
                        </Badge>
                        {deployment.cdnUrl && (
                          <a
                            href={deployment.cdnUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ArrowUpRight className="size-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
