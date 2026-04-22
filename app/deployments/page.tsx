"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Globe,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

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
import { CenterLoader } from "@/components/ui/center-loader";
import {
  useGetProjects,
  useSetActiveVersion,
} from "@/hooks/customHooks/project";
import { useRedeployHook, useGetDeployments } from "@/hooks/customHooks/deploy";
import { getErrorMessage, getSuccessMessage } from "@/utils/api-message";
import { toastSuccess, toastFailure } from "@/utils/toast";

interface Project {
  _id: string;
  name: string;
  userId: string;
  currentVersion: number;
  repoUrl: string;
  subfolder: string;
  url: string;
  createdAt: string;
}

interface VersionDeployment {
  _id: string;
  projectId: string;
  version: number;
  status: "success" | "failed" | "building";
  cdnUrl: string;
  completedAt: string;
  createdAt: string;
}

const activeDeploymentJobKey = "justship-active-deployment-job";
const activeDeploymentLockMaxAgeMs = 30 * 60 * 1000;
const pendingDeploymentLockMaxAgeMs = 2 * 60 * 1000;

const getDisplayHost = (url: string) => {
  if (!url) return "-";

  try {
    const parsed = new URL(url);
    return parsed.host.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
};

export default function DeploymentsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [redeployingProjectId, setRedeployingProjectId] = useState<
    string | null
  >(null);
  const [hasActiveDeploymentLock, setHasActiveDeploymentLock] = useState(false);
  const redeployClickLockRef = useRef(false);

  // Fetch projects
  const { data: projectsData, isLoading: projectsLoading } = useGetProjects();
  const projects = (projectsData?.projects || []) as Project[];

  // Fetch deployments for selected project
  const { data: deploymentsData, isLoading: deploymentsLoading } =
    useGetDeployments(selectedProjectId || "");
  const versionDeployments = (deploymentsData?.deployments ||
    []) as VersionDeployment[];

  // Redeploy mutation
  const redeployMutation = useRedeployHook();

  const hasValidActiveDeployment = () => {
    const activeRaw = localStorage.getItem(activeDeploymentJobKey);
    if (!activeRaw) return false;

    try {
      const active = JSON.parse(activeRaw) as {
        startedAt?: number;
        jobId?: string;
      };
      const startedAt = active.startedAt;
      const jobId = active.jobId;

      if (
        jobId === "pending" &&
        typeof startedAt === "number" &&
        Date.now() - startedAt > pendingDeploymentLockMaxAgeMs
      ) {
        localStorage.removeItem(activeDeploymentJobKey);
        return false;
      }

      if (
        typeof startedAt === "number" &&
        Date.now() - startedAt > activeDeploymentLockMaxAgeMs
      ) {
        localStorage.removeItem(activeDeploymentJobKey);
        return false;
      }

      return true;
    } catch {
      localStorage.removeItem(activeDeploymentJobKey);
      return false;
    }
  };

  useEffect(() => {
    if (!user) return;
  }, [user]);

  useEffect(() => {
    setHasActiveDeploymentLock(hasValidActiveDeployment());

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== activeDeploymentJobKey) return;
      setHasActiveDeploymentLock(hasValidActiveDeployment());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleRedeploy = async (projectId: string) => {
    if (
      redeployClickLockRef.current ||
      redeployMutation.isPending ||
      redeployingProjectId === projectId
    ) {
      return;
    }

    if (hasValidActiveDeployment()) {
      setHasActiveDeploymentLock(true);
      toastFailure("A deployment is already in progress. Please wait.", theme);
      return;
    }

    redeployClickLockRef.current = true;
    setRedeployingProjectId(projectId);
    setHasActiveDeploymentLock(true);
    try {
      const response = await redeployMutation.mutateAsync({ projectId });
      const jobId = response.jobID || response.jobId || response.deploymentId;
      const queueMessage = getSuccessMessage(response, "Job Added to Queue");

      if (!jobId) {
        throw new Error("Could not read job ID from redeploy response");
      }

      const selectedProject = projects.find(
        (project) => project._id === projectId,
      );

      localStorage.setItem(
        activeDeploymentJobKey,
        JSON.stringify({
          jobId,
          projectName: selectedProject?.name || "Deployment",
          startedAt: Date.now(),
        }),
      );

      toastSuccess(queueMessage, theme);
      router.push(
        `/deploy/${jobId}?projectName=${encodeURIComponent(selectedProject?.name || "Deployment")}`,
      );
    } catch (error) {
      localStorage.removeItem(activeDeploymentJobKey);
      setHasActiveDeploymentLock(false);
      toastFailure(getErrorMessage(error, "Failed to trigger redeploy"), theme);
      console.error(error);
    } finally {
      redeployClickLockRef.current = false;
      setRedeployingProjectId(null);
    }
  };

  const handleChangeVersion = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowVersionModal(true);
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
                  Please login to view your deployments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login?next=/deployments">
                  <Button>Go To Login</Button>
                </Link>
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
          {/* Projects Section */}
          <Card className="glass border-border/70">
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>
                Manage and redeploy your projects from here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {projectsLoading ? (
                <CenterLoader
                  label="Loading projects..."
                  className="min-h-72"
                />
              ) : projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No projects found. Create a project to get started.
                </p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project._id}
                    className="group flex cursor-pointer flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 transition-all hover:border-border hover:bg-card/60"
                    onClick={() => router.push(`/projects/${project._id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-lg glass-subtle p-2">
                          <GitBranch className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Version {project.currentVersion}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        Open details
                        <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex max-w-full items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <FolderGit2 className="size-4 shrink-0" />
                          <span className="truncate">
                            {getDisplayHost(project.repoUrl)}
                          </span>
                          <ExternalLink className="size-3 shrink-0" />
                        </a>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex max-w-full items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Globe className="size-4 shrink-0" />
                          <span className="truncate">
                            {getDisplayHost(project.url)}
                          </span>
                          <ExternalLink className="size-3 shrink-0" />
                        </a>
                      </div>

                      <div
                        className="flex flex-wrap items-center gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            router.push(`/projects/${project._id}`)
                          }
                        >
                          View Project
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleRedeploy(project._id)}
                          disabled={
                            hasActiveDeploymentLock ||
                            redeployMutation.isPending ||
                            redeployingProjectId === project._id
                          }
                        >
                          <RefreshCw className="size-4" />
                          {redeployingProjectId === project._id
                            ? "Redeploying..."
                            : "Redeploy"}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleChangeVersion(project._id)}
                        >
                          Change Version
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Legacy Deployments Section */}

          {/* Version Selection Modal */}
          {showVersionModal && (
            <VersionModal
              isOpen={showVersionModal}
              onClose={() => setShowVersionModal(false)}
              deployments={versionDeployments}
              isLoading={deploymentsLoading}
              projectId={selectedProjectId}
            />
          )}
        </section>
      </main>
    </div>
  );
}

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployments: VersionDeployment[];
  isLoading: boolean;
  projectId: string | null;
}

function VersionModal({
  isOpen,
  onClose,
  deployments,
  isLoading,
  projectId,
}: VersionModalProps) {
  const queryClient = useQueryClient();
  const setActiveVersionMutation = useSetActiveVersion();
  const { theme } = useTheme();
  const [switchingVersion, setSwitchingVersion] = useState<number | null>(null);

  const handleSelectVersion = async (version: number) => {
    if (!projectId || setActiveVersionMutation.isPending) return;

    setSwitchingVersion(version);

    try {
      const response = await setActiveVersionMutation.mutateAsync({
        projetId: projectId,
        version,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["deployments", projectId] }),
      ]);

      toastSuccess(
        getSuccessMessage(response, "Version changed successfully!"),
        theme,
      );
      onClose();
    } catch (error) {
      toastFailure(getErrorMessage(error, "Failed to change version"), theme);
      console.error(error);
    } finally {
      setSwitchingVersion(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="glass w-full max-w-md border-border/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Select Version</CardTitle>
            <CardDescription>
              Choose a deployment version to set as active
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            disabled={setActiveVersionMutation.isPending}
            className="rounded-md p-1 hover:bg-accent disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {setActiveVersionMutation.isPending && (
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground animate-pulse">
              <Loader2 className="size-4 animate-spin" />
              Switching version...
            </div>
          )}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading versions...</p>
          ) : deployments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No deployments found for this project
            </p>
          ) : (
            deployments.map((deployment) => (
              <div
                key={deployment._id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3 hover:bg-card/60 transition-colors cursor-pointer"
                onClick={() => handleSelectVersion(deployment.version)}
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Version {deployment.version}
                  </p>
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
                    <p className="text-xs text-muted-foreground">
                      {new Date(deployment.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={setActiveVersionMutation.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectVersion(deployment.version);
                  }}
                >
                  {switchingVersion === deployment.version ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Switching...
                    </>
                  ) : (
                    "Select"
                  )}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
