"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, GitBranch, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
                <p className="text-sm text-muted-foreground">
                  Loading projects...
                </p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No projects found. Create a project to get started.
                </p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project._id}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 md:flex-row md:items-center"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="rounded-lg glass-subtle p-2">
                        <GitBranch className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Version {project.currentVersion}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {project.repoUrl.split("//")[1]}
                        <ArrowUpRight className="size-3" />
                      </a>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {project.url.split("//")[1]}
                        <ArrowUpRight className="size-3" />
                      </a>
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
  const setActiveVersionMutation = useSetActiveVersion();
  const { theme } = useTheme();

  const handleSelectVersion = async (version: number) => {
    if (!projectId) return;

    try {
      const response = await setActiveVersionMutation.mutateAsync({
        projetId: projectId,
        version,
      });
      toastSuccess(
        getSuccessMessage(response, "Version changed successfully!"),
        theme,
      );
      onClose();
    } catch (error) {
      toastFailure(getErrorMessage(error, "Failed to change version"), theme);
      console.error(error);
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
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent">
            <X className="size-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
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
                  Select
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
