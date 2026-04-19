"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, GitBranch, RefreshCw, X } from "lucide-react";
import Link from "next/link";

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
import { type Deployment } from "@/lib/mock-data";
import {
  useGetProjects,
  useSetActiveVersion,
} from "@/hooks/customHooks/project";
import { useRedeployHook, useGetDeployments } from "@/hooks/customHooks/deploy";
import { toastSuccess, toastFailure } from "@/utils/toast";

type StoredDeployment = Deployment & {
  ownerId?: string;
  repoUrl?: string;
};

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

const deploymentsStorageKey = "justship-user-deployments";

export default function DeploymentsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [deployments, setDeployments] = useState<StoredDeployment[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [showVersionModal, setShowVersionModal] = useState(false);

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

  useEffect(() => {
    if (!user) return;

    const raw = localStorage.getItem(deploymentsStorageKey);
    if (!raw) {
      setDeployments([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredDeployment[];
      const owned = Array.isArray(parsed)
        ? parsed.filter((item) => item.ownerId === user.name)
        : [];
      setDeployments(owned);
    } catch {
      setDeployments([]);
    }
  }, [user]);

  const handleRedeploy = async (projectId: string) => {
    try {
      await redeployMutation.mutateAsync({ projectId });
      toastSuccess("Redeploy triggered successfully!", theme);
    } catch (error) {
      toastFailure("Failed to trigger redeploy", theme);
      console.error(error);
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
                        disabled={redeployMutation.isPending}
                      >
                        <RefreshCw className="size-4" />
                        Redeploy
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

  const handleSelectVersion = async (version: number) => {
    if (!projectId) return;

    try {
      await setActiveVersionMutation.mutateAsync({
        projetId: projectId,
        version,
      });
      toastSuccess("Version changed successfully!", theme);
      onClose();
    } catch (error) {
      toastFailure("Failed to change version", theme);
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
